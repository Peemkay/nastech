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

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid product", issues: parsed.error.flatten() }, { status: 400 });

  const existingSlug = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (existingSlug) return NextResponse.json({ error: "A product with this slug already exists" }, { status: 400 });
  const existingSku = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
  if (existingSku) return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 400 });

  const product = await prisma.product.create({ data: { ...parsed.data, modelId: parsed.data.modelId || null } });
  return NextResponse.json({ id: product.id }, { status: 201 });
}
