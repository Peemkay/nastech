import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CatalogManager } from "@/components/admin/CatalogManager";

export const metadata: Metadata = { title: "Catalog & Pricing" };

export default async function AdminCatalogPage() {
  const categories = await prisma.deviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      brands: { orderBy: { name: "asc" }, include: { models: { orderBy: { name: "asc" } } } },
      conditionQuestions: { orderBy: { sortOrder: "asc" }, include: { options: { orderBy: { sortOrder: "asc" } } } },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Catalog & Pricing</h1>
        <p className="text-sm text-muted">Manage categories, brands, models and the condition questions that drive the trade-in quote engine.</p>
      </div>
      <CatalogManager categories={categories} />
    </div>
  );
}
