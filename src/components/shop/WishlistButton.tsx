"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/wishlist-store";
import { cn } from "@/lib/utils";

export function WishlistButton({
  product,
  className,
}: {
  product: { productId: string; name: string; slug: string; image?: string; priceKobo: number; grade: string };
  className?: string;
}) {
  const toggle = useWishlistStore((s) => s.toggle);
  const saved = useWishlistStore((s) => s.has(product.productId));

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-white/90 text-silver-500 shadow-sm backdrop-blur transition hover:text-danger",
        saved && "text-danger",
        className,
      )}
    >
      <Heart className={cn("size-4", saved && "fill-danger")} />
    </button>
  );
}
