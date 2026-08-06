import Link from "next/link";
import { Star } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { GRADE_LABELS, type ProductGrade } from "@/lib/constants";
import { DeviceImagePlaceholder } from "@/components/DeviceIcon";
import { Badge } from "@/components/ui/Badge";

export type ProductCardData = {
  slug: string;
  name: string;
  priceKobo: number;
  compareAtPriceKobo: number | null;
  grade: string;
  storage: string | null;
  images: unknown;
  category: { icon: string };
  avgRating?: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const images = Array.isArray(product.images) ? (product.images as string[]) : [];
  const discountPct =
    product.compareAtPriceKobo && product.compareAtPriceKobo > product.priceKobo
      ? Math.round(100 - (product.priceKobo / product.compareAtPriceKobo) * 100)
      : null;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5"
    >
      <div className="relative aspect-square p-4">
        {images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images[0]} alt={product.name} className="size-full rounded-xl object-cover" />
        ) : (
          <DeviceImagePlaceholder icon={product.category.icon} className="size-full" />
        )}
        {discountPct && (
          <span className="absolute top-3 left-3 rounded-full bg-danger px-2 py-1 text-[10px] font-bold text-white">
            -{discountPct}%
          </span>
        )}
        <span className="absolute top-3 right-3">
          <Badge tone={product.grade === "NEW" ? "success" : "brand"}>{GRADE_LABELS[product.grade as ProductGrade] ?? product.grade}</Badge>
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-border p-4">
        <p className="line-clamp-2 text-sm font-semibold text-foreground">{product.name}</p>
        {product.storage && <p className="text-xs text-muted">{product.storage}</p>}
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="text-base font-extrabold text-brand-700">{formatNaira(product.priceKobo, { withDecimals: false })}</p>
            {product.compareAtPriceKobo && (
              <p className="text-xs text-muted line-through">{formatNaira(product.compareAtPriceKobo, { withDecimals: false })}</p>
            )}
          </div>
          {product.avgRating ? (
            <span className="flex items-center gap-0.5 text-xs font-medium text-amber-600">
              <Star className="size-3.5 fill-amber-400 text-amber-400" /> {product.avgRating.toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
