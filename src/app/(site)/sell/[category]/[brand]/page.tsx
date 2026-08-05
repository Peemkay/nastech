import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";
import { Container, SectionHeading, EmptyState } from "@/components/ui/Misc";
import { StepIndicator } from "@/components/sell/StepIndicator";
import { DeviceImagePlaceholder } from "@/components/DeviceIcon";

export async function generateMetadata({ params }: { params: Promise<{ category: string; brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  return { title: `Sell your ${brand} device` };
}

export default async function ModelPickerPage({ params }: { params: Promise<{ category: string; brand: string }> }) {
  const { category: categorySlug, brand: brandSlug } = await params;

  const category = await prisma.deviceCategory.findUnique({ where: { slug: categorySlug } });
  if (!category) notFound();

  const brand = await prisma.brand.findUnique({
    where: { categoryId_slug: { categoryId: category.id, slug: brandSlug } },
    include: { models: { orderBy: { name: "asc" } } },
  });
  if (!brand) notFound();

  return (
    <Container className="py-14">
      <StepIndicator steps={["Category", "Brand", "Model", "Quote"]} current={2} />
      <SectionHeading align="center" title={`Select your ${brand.name} model`} />

      {brand.models.length === 0 ? (
        <EmptyState title="No models yet" subtitle="This brand is still being set up — check back soon." />
      ) : (
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3">
          {brand.models.map((model) => (
            <Link
              key={model.id}
              href={`/sell/${category.slug}/${brand.slug}/${model.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5"
            >
              <DeviceImagePlaceholder icon={category.icon} className="aspect-[4/3] w-full rounded-none" />
              <div className="flex items-center justify-between gap-2 p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{model.name}</p>
                  <p className="text-xs text-muted">Up to {formatNaira(model.baseValueKobo, { withDecimals: false })}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-silver-400 transition group-hover:text-brand-600" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
