import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Misc";
import { RepairWizard } from "@/components/repair/RepairWizard";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  return { title: `Repair your ${category.replace(/-/g, " ")}` };
}

export default async function RepairWizardPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;

  const category = await prisma.deviceCategory.findUnique({
    where: { slug: categorySlug },
    include: {
      brands: { orderBy: { name: "asc" } },
      repairIssues: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!category) notFound();

  return (
    <Container className="py-14">
      <RepairWizard
        category={{ id: category.id, name: category.name, slug: category.slug, icon: category.icon }}
        brands={category.brands.map((b) => ({ id: b.id, name: b.name }))}
        issues={category.repairIssues.map((i) => ({
          id: i.id,
          name: i.name,
          type: i.type,
          basePriceKobo: i.basePriceKobo,
          durationHint: i.durationHint,
          description: i.description,
        }))}
      />
    </Container>
  );
}
