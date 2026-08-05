"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/utils";
import { GRADE_LABELS, type ProductGrade } from "@/lib/constants";
import { Container, EmptyState } from "@/components/ui/Misc";
import { Card, CardBody } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { DeviceImagePlaceholder } from "@/components/DeviceIcon";

export default function CartPage() {
  const { items, remove, setQuantity, subtotalKobo } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<ShoppingCart className="size-8" />}
          title="Your cart is empty"
          subtitle="Browse certified refurbished devices and add something you like."
          action={<LinkButton href="/shop">Shop refurbished devices</LinkButton>}
        />
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="mb-8 text-2xl font-extrabold text-foreground">Your Cart ({items.length})</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
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
                    <button onClick={() => remove(item.productId)} className="text-silver-400 hover:text-danger" aria-label="Remove item">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-border">
                      <button
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        className="flex size-8 items-center justify-center hover:text-brand-600"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        className="flex size-8 items-center justify-center hover:text-brand-600"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-brand-700">{formatNaira(item.priceKobo * item.quantity, { withDecimals: false })}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardBody>
              <p className="text-sm font-semibold text-foreground">Order Summary</p>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium text-foreground">{formatNaira(subtotalKobo(), { withDecimals: false })}</span>
              </div>
              <p className="mt-1 text-xs text-muted">Shipping calculated at checkout</p>
              <div className="my-4 h-px bg-border" />
              <LinkButton href="/checkout" fullWidth size="lg">
                Proceed to Checkout
              </LinkButton>
              <LinkButton href="/shop" variant="ghost" fullWidth size="sm" className="mt-2">
                Continue shopping
              </LinkButton>
            </CardBody>
          </Card>
        </div>
      </div>
    </Container>
  );
}
