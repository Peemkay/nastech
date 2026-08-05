import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui/Misc";
import { LinkButton } from "@/components/ui/Button";
import { ProductCard } from "@/components/shop/ProductCard";

export async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true, stock: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { category: { select: { icon: true } } },
  });

  if (products.length === 0) return null;

  return (
    <section className="bg-silver-100/50 py-16">
      <div className="container-page">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            className="mb-0"
            eyebrow="Shop refurbished"
            title="Certified devices, up to 40% off retail"
            subtitle="Every unit is graded, tested and backed by a 12-month warranty."
          />
          <LinkButton href="/shop" variant="secondary">
            View all
          </LinkButton>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
