import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  icon: z.string().min(1),
  sortOrder: z.number().int().default(0),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid category" }, { status: 400 });

  const existing = await prisma.deviceCategory.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "A category with this slug already exists" }, { status: 400 });

  const category = await prisma.deviceCategory.create({ data: parsed.data });
  return NextResponse.json({ id: category.id }, { status: 201 });
}
