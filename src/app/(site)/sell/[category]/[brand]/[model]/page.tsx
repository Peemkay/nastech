import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getAccountPrefill } from "@/lib/account-prefill";
import { Container } from "@/components/ui/Misc";
import { SellWizard } from "@/components/sell/SellWizard";

export async function generateMetadata({ params }: { params: Promise<{ model: string }> }): Promise<Metadata> {
  const { model } = await params;
  return { title: `Sell your ${model.replace(/-/g, " ")}` };
}

export default async function SellWizardPage({
  params,
}: {
  params: Promise<{ category: string; brand: string; model: string }>;
}) {
  const { category: categorySlug, brand: brandSlug, model: modelSlug } = await params;

  const category = await prisma.deviceCategory.findUnique({
    where: { slug: categorySlug },
    include: { conditionQuestions: { orderBy: { sortOrder: "asc" }, include: { options: { orderBy: { sortOrder: "asc" } } } } },
  });
  if (!category) notFound();

  const brand = await prisma.brand.findUnique({ where: { categoryId_slug: { categoryId: category.id, slug: brandSlug } } });
  if (!brand) notFound();

  const model = await prisma.deviceModel.findUnique({ where: { brandId_slug: { brandId: brand.id, slug: modelSlug } } });
  if (!model) notFound();

  const storageOptions = Array.isArray(model.storageOptions) ? (model.storageOptions as string[]) : [];
  const session = await auth();
  const prefill = session?.user?.id ? await getAccountPrefill(session.user.id) : null;

  return (
    <Container className="py-14">
      <SellWizard
        category={{ id: category.id, name: category.name, slug: category.slug, icon: category.icon }}
        brand={{ id: brand.id, name: brand.name, slug: brand.slug }}
        model={{ id: model.id, name: model.name, slug: model.slug, baseValueKobo: model.baseValueKobo, storageOptions }}
        questions={category.conditionQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options.map((o) => ({ id: o.id, label: o.label, deductionBps: o.deductionBps })),
        }))}
        isAuthenticated={!!session}
        prefill={prefill}
      />
    </Container>
  );
}
