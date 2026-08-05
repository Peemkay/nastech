import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

const schema = z.object({
  brandId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  releaseYear: z.number().int().optional().nullable(),
  baseValueKobo: z.number().int().min(0),
  storageOptions: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid model" }, { status: 400 });

  const existing = await prisma.deviceModel.findUnique({ where: { brandId_slug: { brandId: parsed.data.brandId, slug: parsed.data.slug } } });
  if (existing) return NextResponse.json({ error: "A model with this slug already exists for this brand" }, { status: 400 });

  const model = await prisma.deviceModel.create({ data: parsed.data });
  return NextResponse.json({ id: model.id }, { status: 201 });
}
