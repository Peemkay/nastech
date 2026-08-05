import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const categories = await prisma.deviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { brands: { orderBy: { name: "asc" }, include: { models: { orderBy: { name: "asc" } } } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-foreground">Add Product</h1>
      <ProductForm categories={categories.map((c) => ({ id: c.id, name: c.name, brands: c.brands.map((b) => ({ id: b.id, name: b.name, categoryId: b.categoryId, models: b.models.map((m) => ({ id: m.id, name: m.name, brandId: m.brandId })) })) }))} />
    </div>
  );
}
