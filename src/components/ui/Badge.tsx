import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const TONES = {
  brand: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200",
  silver: "bg-silver-100 text-silver-700 ring-1 ring-inset ring-silver-300",
  success: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  neutral: "bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200",
};

export function Badge({ tone = "neutral", children, className }: { tone?: keyof typeof TONES; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap", TONES[tone], className)}>
      {children}
    </span>
  );
}

// ----- Status → tone mappings shared by storefront + admin -----

const SELL_STATUS_TONE: Record<string, keyof typeof TONES> = {
  QUOTE_GENERATED: "silver",
  PICKUP_SCHEDULED: "brand",
  PICKED_UP: "brand",
  INSPECTING: "warning",
  OFFER_REVISED: "warning",
  ACCEPTED: "success",
  REJECTED_BY_CUSTOMER: "danger",
  PAID_OUT: "success",
  CANCELLED: "danger",
};

const ORDER_STATUS_TONE: Record<string, keyof typeof TONES> = {
  PENDING_PAYMENT: "warning",
  PAID: "success",
  PROCESSING: "brand",
  SHIPPED: "brand",
  DELIVERED: "success",
  CANCELLED: "danger",
  REFUNDED: "neutral",
};

const PAYMENT_STATUS_TONE: Record<string, keyof typeof TONES> = {
  PENDING: "warning",
  AWAITING_VERIFICATION: "warning",
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "neutral",
};

export function SellStatusBadge({ status, label }: { status: string; label: string }) {
  return <Badge tone={SELL_STATUS_TONE[status] ?? "neutral"}>{label}</Badge>;
}

export function OrderStatusBadge({ status, label }: { status: string; label: string }) {
  return <Badge tone={ORDER_STATUS_TONE[status] ?? "neutral"}>{label}</Badge>;
}

export function PaymentStatusBadge({ status, label }: { status: string; label: string }) {
  return <Badge tone={PAYMENT_STATUS_TONE[status] ?? "neutral"}>{label}</Badge>;
}
