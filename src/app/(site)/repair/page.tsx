import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeviceIcon } from "@/components/DeviceIcon";
import { Container, SectionHeading, EmptyState } from "@/components/ui/Misc";

export const metadata: Metadata = { title: "Repair your device" };

export default async function RepairCategoryPickerPage() {
  const categories = await prisma.deviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { repairIssues: { where: { isActive: true } } } } },
  });
  const repairable = categories.filter((c) => c._count.repairIssues > 0);

  return (
    <Container className="py-14">
      <SectionHeading
        align="center"
        eyebrow="Repair"
        title="What needs fixing?"
        subtitle="Hardware or software issue — get an instant estimate and book a drop-off or pickup."
      />

      {repairable.length === 0 ? (
        <EmptyState icon={<Wrench className="size-8" />} title="Repair services are being set up" subtitle="Check back shortly." />
      ) : (
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3">
          {repairable.map((cat) => (
            <Link
              key={cat.id}
              href={`/repair/${cat.slug}`}
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
