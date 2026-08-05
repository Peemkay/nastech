import type { Metadata } from "next";
import { Suspense } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Container, SectionHeading, EmptyState } from "@/components/ui/Misc";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShoppingBag } from "lucide-react";

export const metadata: Metadata = { title: "Shop Certified Refurbished Devices" };

type SearchParams = { category?: string; grade?: string; q?: string; sort?: string };

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (sp.category) where.category = { slug: sp.category };
  if (sp.grade) where.grade = sp.grade;
  if (sp.q) where.name = { contains: sp.q };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sp.sort === "price_asc" ? { priceKobo: "asc" } : sp.sort === "price_desc" ? { priceKobo: "desc" } : { createdAt: "desc" };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where, orderBy, take: 60, include: { category: { select: { icon: true } } } }),
    prisma.deviceCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
  ]);

  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="Shop"
        title="Certified refurbished devices"
        subtitle="Every device is graded, tested and backed by a 12-month warranty. Pay by card, bank transfer or USSD."
      />

      <Suspense>
        <ShopFilters categories={categories} />
      </Suspense>

      {products.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="size-8" />}
          title="No products match your filters"
          subtitle="Try a different category or clear your search."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </Container>
  );
}
