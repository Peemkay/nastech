"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Banknote, ChevronLeft, CreditCard, Landmark, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/utils";
import { NIGERIAN_STATES, PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/constants";
import { StepIndicator } from "@/components/sell/StepIndicator";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Select } from "@/components/ui/Field";
import { Container, EmptyState } from "@/components/ui/Misc";
import { cn } from "@/lib/utils";

const GATEWAY_ICON: Record<PaymentMethod, typeof CreditCard> = {
  PAYSTACK: CreditCard,
  FLUTTERWAVE: CreditCard,
  BANK_TRANSFER: Landmark,
};

type PublicSettings = {
  activeGateways: PaymentMethod[];
  defaultGateway: PaymentMethod;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  freeShippingThresholdKobo: number;
};

const FLAT_SHIPPING_FEE_KOBO = 250000;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalKobo, clear } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [settings, setSettings] = useState<PublicSettings | null>(null);
  useEffect(() => {
    fetch("/api/settings/public").then((r) => r.json()).then(setSettings);
  }, []);

  const [stepIndex, setStepIndex] = useState(0);
  const steps = ["Shipping", "Payment", "Review"];
  const [form, setForm] = useState({
    contactEmail: "",
    contactPhone: "",
    shipFullName: "",
    shipPhone: "",
    shipLine1: "",
    shipLine2: "",
    shipCity: "",
    shipState: "Lagos",
  });
  const [method, setMethod] = useState<PaymentMethod>("PAYSTACK");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = subtotalKobo();
  const shippingFee = settings && subtotal >= settings.freeShippingThresholdKobo ? 0 : FLAT_SHIPPING_FEE_KOBO;
  const total = subtotal + shippingFee;

  function shippingValid() {
    return (
      /\S+@\S+\.\S+/.test(form.contactEmail) &&
      form.contactPhone.trim().length > 6 &&
      form.shipFullName.trim().length > 1 &&
      form.shipPhone.trim().length > 6 &&
      form.shipLine1.trim().length > 2 &&
      form.shipCity.trim().length > 1 &&
      form.shipState
    );
  }

  function goNext() {
    setError(null);
    if (stepIndex === 0 && !shippingValid()) {
      setError("Please complete all required shipping fields.");
      return;
    }
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  async function placeOrder() {
    setSubmitting(true);
    setError(null);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          paymentMethod: method,
          ...form,
        }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error ?? "Could not place order");

      if (method === "BANK_TRANSFER") {
        await fetch("/api/payments/bank-transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.orderId }),
        });
        clear();
        router.push(`/track/${order.code}?new=1`);
        return;
      }

      const initEndpoint = method === "PAYSTACK" ? "/api/payments/paystack/initialize" : "/api/payments/flutterwave/initialize";
      const initRes = await fetch(initEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId }),
      });
      const init = await initRes.json();
      if (!initRes.ok) throw new Error(init.error ?? "Could not start payment");

      clear();
      window.location.href = init.authorizationUrl ?? init.link;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState title="Your cart is empty" subtitle="Add some products before checking out." />
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <StepIndicator steps={steps} current={stepIndex} />

      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardBody>
              {stepIndex === 0 && (
                <div>
                  <p className="mb-4 text-sm font-semibold text-foreground">Shipping details</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label required>Full name</Label>
                      <Input value={form.shipFullName} onChange={(e) => setForm((f) => ({ ...f, shipFullName: e.target.value }))} />
                    </div>
                    <div>
                      <Label required>Phone number</Label>
                      <Input value={form.shipPhone} onChange={(e) => setForm((f) => ({ ...f, shipPhone: e.target.value }))} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label required>Email address</Label>
                      <Input
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value, contactPhone: f.contactPhone || form.shipPhone }))}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label required>Delivery address</Label>
                      <Input value={form.shipLine1} onChange={(e) => setForm((f) => ({ ...f, shipLine1: e.target.value }))} placeholder="House / street address" />
                    </div>
                    <div className="sm:col-span-2">
                      <Input value={form.shipLine2} onChange={(e) => setForm((f) => ({ ...f, shipLine2: e.target.value }))} placeholder="Landmark / apartment (optional)" />
                    </div>
                    <div>
                      <Label required>City</Label>
                      <Input value={form.shipCity} onChange={(e) => setForm((f) => ({ ...f, shipCity: e.target.value }))} />
                    </div>
                    <div>
                      <Label required>State</Label>
                      <Select value={form.shipState} onChange={(e) => setForm((f) => ({ ...f, shipState: e.target.value }))}>
                        {NIGERIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {stepIndex === 1 && (
                <div>
                  <p className="mb-4 text-sm font-semibold text-foreground">Choose a payment method</p>
                  <div className="space-y-3">
                    {(settings?.activeGateways ?? ["PAYSTACK", "FLUTTERWAVE", "BANK_TRANSFER"]).map((gw) => {
                      const Icon = GATEWAY_ICON[gw];
                      return (
                        <button
                          key={gw}
                          type="button"
                          onClick={() => setMethod(gw)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition",
                            method === gw ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100" : "border-border hover:border-brand-300",
                          )}
                        >
                          <span className={cn("flex size-10 items-center justify-center rounded-full", method === gw ? "bg-brand-600 text-white" : "bg-silver-100 text-silver-600")}>
                            <Icon className="size-4.5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{PAYMENT_METHOD_LABELS[gw]}</p>
                            {gw === "BANK_TRANSFER" && <p className="text-xs text-muted">Pay manually, confirmed within a few hours</p>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
                    <ShieldCheck className="size-3.5 text-brand-600" /> All payments are processed securely in Nigerian Naira (₦).
                  </p>
                </div>
              )}

              {stepIndex === 2 && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-foreground">Review your order</p>
                  <ul className="divide-y divide-border rounded-xl border border-border">
                    {items.map((item) => (
                      <li key={item.productId} className="flex justify-between px-4 py-3 text-sm">
                        <span className="text-foreground">
                          {item.name} <span className="text-muted">× {item.quantity}</span>
                        </span>
                        <span className="font-medium text-foreground">{formatNaira(item.priceKobo * item.quantity, { withDecimals: false })}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-xl bg-silver-100/60 p-4 text-sm">
                    <p className="text-muted">Deliver to</p>
                    <p className="mt-1 font-medium text-foreground">
                      {form.shipFullName} · {form.shipPhone}
                    </p>
                    <p className="text-muted">
                      {form.shipLine1}, {form.shipCity}, {form.shipState}
                    </p>
                  </div>
                  <div className="rounded-xl bg-silver-100/60 p-4 text-sm">
                    <p className="text-muted">Payment method</p>
                    <p className="mt-1 font-medium text-foreground">{PAYMENT_METHOD_LABELS[method]}</p>
                  </div>
                </div>
              )}

              {error && (
                <p className="mt-4 flex items-center gap-1.5 text-sm text-danger">
                  <AlertCircle className="size-4 shrink-0" /> {error}
                </p>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                <Button variant="ghost" onClick={() => setStepIndex((i) => Math.max(0, i - 1))} disabled={stepIndex === 0} icon={<ChevronLeft className="size-4" />}>
                  Back
                </Button>
                {stepIndex < 2 ? (
                  <Button onClick={goNext}>Continue</Button>
                ) : (
                  <Button onClick={placeOrder} loading={submitting} icon={<Banknote className="size-4" />}>
                    Place Order
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardBody>
              <p className="text-sm font-semibold text-foreground">Order Summary</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-medium text-foreground">{formatNaira(subtotal, { withDecimals: false })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Shipping</span>
                  <span className="font-medium text-foreground">{shippingFee === 0 ? "Free" : formatNaira(shippingFee, { withDecimals: false })}</span>
                </div>
              </div>
              <div className="my-4 h-px bg-border" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-brand-700">{formatNaira(total, { withDecimals: false })}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </Container>
  );
}
