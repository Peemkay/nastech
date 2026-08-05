import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { PRODUCT_GRADES } from "@/lib/constants";

const bodySchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(2),
  slug: z.string().min(2),
  categoryId: z.string().min(1),
  brandId: z.string().min(1),
  modelId: z.string().optional().nullable(),
  grade: z.enum(PRODUCT_GRADES),
  storage: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  priceKobo: z.number().int().min(0),
  compareAtPriceKobo: z.number().int().min(0).optional().nullable(),
  stock: z.number().int().min(0),
  images: z.array(z.string()).default([]),
  description: z.string().optional().default(""),
  specs: z.record(z.string(), z.string()).optional().default({}),
  isActive: z.boolean().optional().default(true),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid product", issues: parsed.error.flatten() }, { status: 400 });

  const conflictSlug = await prisma.product.findFirst({ where: { slug: parsed.data.slug, NOT: { id } } });
  if (conflictSlug) return NextResponse.json({ error: "A product with this slug already exists" }, { status: 400 });

  await prisma.product.update({ where: { id }, data: { ...parsed.data, modelId: parsed.data.modelId || null } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  // Soft delete — deactivate rather than hard-delete, so past orders keep valid product references.
  await prisma.product.update({ where: { id }, data: { isActive: false, stock: 0 } });
  return NextResponse.json({ ok: true });
}
