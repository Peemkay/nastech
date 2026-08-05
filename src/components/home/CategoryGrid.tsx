import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeviceIcon } from "@/components/DeviceIcon";
import { SectionHeading } from "@/components/ui/Misc";

export async function CategoryGrid() {
  const categories = await prisma.deviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { brands: true } } },
  });

  if (categories.length === 0) return null;

  return (
    <section className="container-page py-16">
      <SectionHeading
        eyebrow="Sell in minutes"
        title="What are you trading in today?"
        subtitle="Pick a category to get an instant, no-obligation quote based on your device's condition."
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/sell/${cat.slug}`}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-5 text-center transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5"
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
              <DeviceIcon icon={cat.icon} className="size-7" />
            </span>
            <span className="text-sm font-semibold text-foreground">{cat.name}</span>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-brand-600 opacity-0 transition group-hover:opacity-100">
              Get quote <ArrowRight className="size-3" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
