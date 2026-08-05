import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeviceIcon } from "@/components/DeviceIcon";
import { Container, SectionHeading, EmptyState } from "@/components/ui/Misc";

export const metadata: Metadata = { title: "Sell / Trade-in your device" };

export default async function SellCategoryPickerPage() {
  const categories = await prisma.deviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { brands: true } } },
  });

  return (
    <Container className="py-14">
      <SectionHeading
        align="center"
        eyebrow="Step 1 of 4"
        title="What would you like to sell?"
        subtitle="Choose a category to get an instant, no-obligation cash quote."
      />

      {categories.length === 0 ? (
        <EmptyState title="Catalog is being set up" subtitle="Check back shortly — our device catalog is being loaded." />
      ) : (
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/sell/${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6 text-center transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5"
            >
              <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <DeviceIcon icon={cat.icon} className="size-8" />
              </span>
              <span className="text-sm font-semibold text-foreground">{cat.name}</span>
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-brand-600 opacity-0 transition group-hover:opacity-100">
                Continue <ArrowRight className="size-3" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
