"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/Button";

export function AddToCartButton({
  product,
}: {
  product: { id: string; name: string; slug: string; priceKobo: number; grade: string; stock: number; image?: string };
}) {
  const router = useRouter();
  const add = useCartStore((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (product.stock <= 0) {
    return (
      <Button disabled fullWidth variant="secondary">
        Out of stock
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-full border border-border">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="flex size-10 items-center justify-center text-foreground hover:text-brand-600"
          aria-label="Decrease quantity"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-semibold">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          className="flex size-10 items-center justify-center text-foreground hover:text-brand-600"
          aria-label="Increase quantity"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      <Button
        fullWidth
        icon={added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
        onClick={() => {
          add(
            {
              productId: product.id,
              name: product.name,
              slug: product.slug,
              image: product.image,
              priceKobo: product.priceKobo,
              grade: product.grade,
              maxStock: product.stock,
            },
            qty,
          );
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
      >
        {added ? "Added to cart" : "Add to Cart"}
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          add(
            {
              productId: product.id,
              name: product.name,
              slug: product.slug,
              image: product.image,
              priceKobo: product.priceKobo,
              grade: product.grade,
              maxStock: product.stock,
            },
            qty,
          );
          router.push("/checkout");
        }}
      >
        Buy Now
      </Button>
    </div>
  );
}
