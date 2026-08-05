import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

const schema = z.object({ categoryId: z.string().min(1), name: z.string().min(1), slug: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid brand" }, { status: 400 });

  const existing = await prisma.brand.findUnique({ where: { categoryId_slug: { categoryId: parsed.data.categoryId, slug: parsed.data.slug } } });
  if (existing) return NextResponse.json({ error: "A brand with this slug already exists in this category" }, { status: 400 });

  const brand = await prisma.brand.create({ data: parsed.data });
  return NextResponse.json({ id: brand.id }, { status: 201 });
}
