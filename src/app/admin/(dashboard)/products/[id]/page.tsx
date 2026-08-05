import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.deviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { brands: { orderBy: { name: "asc" }, include: { models: { orderBy: { name: "asc" } } } } },
    }),
  ]);
  if (!product) notFound();

  const images = Array.isArray(product.images) ? (product.images as string[]) : [];
  const specsObj = (product.specs && typeof product.specs === "object" ? (product.specs as Record<string, string>) : {}) ?? {};
  const specs = Object.entries(specsObj).map(([key, value]) => ({ key, value }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-foreground">Edit Product</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name, brands: c.brands.map((b) => ({ id: b.id, name: b.name, categoryId: b.categoryId, models: b.models.map((m) => ({ id: m.id, name: m.name, brandId: m.brandId })) })) }))}
        initial={{
          id: product.id,
          sku: product.sku,
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          brandId: product.brandId,
          modelId: product.modelId ?? "",
          grade: product.grade,
          storage: product.storage ?? "",
          color: product.color ?? "",
          priceNaira: String(product.priceKobo / 100),
          compareAtPriceNaira: product.compareAtPriceKobo ? String(product.compareAtPriceKobo / 100) : "",
          stock: String(product.stock),
          imageUrl: images[0] ?? "",
          description: product.description,
          specs: specs.length > 0 ? specs : [{ key: "", value: "" }],
          isActive: product.isActive,
        }}
      />
    </div>
  );
}
