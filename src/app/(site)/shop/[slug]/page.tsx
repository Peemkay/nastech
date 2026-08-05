import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck, Star, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDate } from "@/lib/utils";
import { GRADE_LABELS, GRADE_DESCRIPTIONS, type ProductGrade } from "@/lib/constants";
import { Container } from "@/components/ui/Misc";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { DeviceImagePlaceholder } from "@/components/DeviceIcon";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { ProductCard } from "@/components/shop/ProductCard";
import { ReviewForm } from "@/components/shop/ReviewForm";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true } });
  return { title: product?.name ?? "Product" };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, brand: true, reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } } },
  });
  if (!product || !product.isActive) notFound();

  const images = Array.isArray(product.images) ? (product.images as string[]) : [];
  const specs = (product.specs && typeof product.specs === "object" ? (product.specs as Record<string, string>) : {}) ?? {};
  const avgRating = product.reviews.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : null;

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
    take: 4,
    include: { category: { select: { icon: true } } },
  });

  return (
    <Container className="py-10">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted">
        <Link href="/shop" className="hover:text-brand-600">Shop</Link>
        <ChevronRight className="size-3" />
        <span>{product.category.name}</span>
        <ChevronRight className="size-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          {images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images[0]} alt={product.name} className="aspect-square w-full rounded-2xl border border-border object-cover" />
          ) : (
            <DeviceImagePlaceholder icon={product.category.icon} grade={GRADE_LABELS[product.grade as ProductGrade]} className="aspect-square w-full" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Badge tone="brand">{GRADE_LABELS[product.grade as ProductGrade] ?? product.grade}</Badge>
            {avgRating && (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                <Star className="size-3.5 fill-amber-400 text-amber-400" /> {avgRating.toFixed(1)} ({product.reviews.length})
              </span>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">{product.name}</h1>
          <p className="mt-1 text-sm text-muted">{GRADE_DESCRIPTIONS[product.grade as ProductGrade]}</p>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-brand-700">{formatNaira(product.priceKobo, { withDecimals: false })}</span>
            {product.compareAtPriceKobo && (
              <span className="text-base text-muted line-through">{formatNaira(product.compareAtPriceKobo, { withDecimals: false })}</span>
            )}
          </div>

          {(product.storage || product.color) && (
            <div className="mt-4 flex gap-2">
              {product.storage && <Badge tone="silver">{product.storage}</Badge>}
              {product.color && <Badge tone="silver">{product.color}</Badge>}
            </div>
          )}

          <div className="mt-6">
            <AddToCartButton
              product={{ id: product.id, name: product.name, slug: product.slug, priceKobo: product.priceKobo, grade: product.grade, stock: product.stock, image: images[0] }}
            />
            {product.stock > 0 && product.stock <= 5 && <p className="mt-2 text-xs font-medium text-amber-600">Only {product.stock} left in stock</p>}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2.5 rounded-xl border border-border p-3 text-xs font-medium text-muted">
              <Truck className="size-4.5 shrink-0 text-brand-600" /> Nationwide delivery in 2–5 business days
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-border p-3 text-xs font-medium text-muted">
              <ShieldCheck className="size-4.5 shrink-0 text-brand-600" /> 12-month NASTECH warranty included
            </div>
          </div>

          {Object.keys(specs).length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold text-foreground">Specifications</p>
              <dl className="divide-y divide-border rounded-xl border border-border">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between px-4 py-2.5 text-sm">
                    <dt className="text-muted">{key}</dt>
                    <dd className="font-medium text-foreground">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {product.description && (
            <div className="mt-8">
              <p className="mb-2 text-sm font-semibold text-foreground">Description</p>
              <p className="text-sm leading-relaxed text-muted">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            <p className="mb-4 text-sm font-semibold text-foreground">
              Customer reviews {avgRating && `· ${avgRating.toFixed(1)} / 5`}
            </p>
            {product.reviews.length === 0 ? (
              <p className="text-sm text-muted">No reviews yet — be the first to review this product.</p>
            ) : (
              <ul className="space-y-4">
                {product.reviews.map((r) => (
                  <li key={r.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{r.user.name}</p>
                      <span className="flex items-center gap-0.5 text-xs text-amber-600">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" /> {r.rating}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted">{formatDate(r.createdAt)}</p>
                    {r.comment && <p className="mt-1.5 text-sm text-muted">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
        <ReviewForm productId={product.id} />
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <p className="mb-5 text-lg font-bold text-foreground">You may also like</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
