import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Container, SectionHeading, EmptyState } from "@/components/ui/Misc";
import { StepIndicator } from "@/components/sell/StepIndicator";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  return { title: `Sell your ${category}` };
}

export default async function BrandPickerPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;

  const category = await prisma.deviceCategory.findUnique({
    where: { slug: categorySlug },
    include: { brands: { orderBy: { name: "asc" }, include: { _count: { select: { models: true } } } } },
  });

  if (!category) notFound();

  return (
    <Container className="py-14">
      <StepIndicator steps={["Category", "Brand", "Model", "Quote"]} current={1} />
      <SectionHeading align="center" title={`Select your ${category.name.toLowerCase()} brand`} />

      {category.brands.length === 0 ? (
        <EmptyState title="No brands yet" subtitle="This category is still being set up — check back soon." />
      ) : (
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
          {category.brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/sell/${category.slug}/${brand.slug}`}
              className="group flex items-center justify-between gap-2 rounded-2xl border border-border bg-surface px-5 py-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5"
            >
              <span className="text-sm font-semibold text-foreground">{brand.name}</span>
              <ChevronRight className="size-4 text-silver-400 transition group-hover:text-brand-600" />
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
