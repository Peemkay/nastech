"use client";

import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/utils";
import { GRADE_LABELS, type ProductGrade } from "@/lib/constants";
import { Container, EmptyState } from "@/components/ui/Misc";
import { Card, CardBody } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { DeviceImagePlaceholder } from "@/components/DeviceIcon";
import { useHasMounted } from "@/lib/use-has-mounted";

export default function WishlistPage() {
  const { items, remove } = useWishlistStore();
  const addToCart = useCartStore((s) => s.add);
  const mounted = useHasMounted();

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<Heart className="size-8" />}
          title="Your wishlist is empty"
          subtitle="Save devices you're eyeing to come back to them later."
          action={<LinkButton href="/shop">Shop refurbished devices</LinkButton>}
        />
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="mb-8 text-2xl font-extrabold text-foreground">My Wishlist ({items.length})</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.productId}>
            <CardBody className="flex gap-4">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name} className="size-20 shrink-0 rounded-xl object-cover" />
              ) : (
                <DeviceImagePlaceholder icon="smartphone" className="size-20 shrink-0" />
              )}
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/shop/${item.slug}`} className="text-sm font-semibold text-foreground hover:text-brand-600">
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted">{GRADE_LABELS[item.grade as ProductGrade] ?? item.grade}</p>
                  </div>
                  <button onClick={() => remove(item.productId)} className="text-silver-400 hover:text-danger" aria-label="Remove from wishlist">
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-brand-700">{formatNaira(item.priceKobo, { withDecimals: false })}</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      addToCart({ productId: item.productId, name: item.name, slug: item.slug, image: item.image, priceKobo: item.priceKobo, grade: item.grade, maxStock: 99 })
                    }
                  >
                    Add to cart
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </Container>
  );
}
