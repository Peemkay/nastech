import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Misc";
import { LinkButton } from "@/components/ui/Button";
import { Package } from "lucide-react";

export const metadata: Metadata = { title: "My Orders" };

export default async function AccountOrdersPage() {
  const session = await auth();
  const orders = await prisma.order.findMany({ where: { userId: session!.user.id }, orderBy: { createdAt: "desc" }, include: { items: true } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-foreground">My Orders</h1>
      {orders.length === 0 ? (
        <EmptyState icon={<Package className="size-8" />} title="No orders yet" subtitle="Your purchases will appear here." action={<LinkButton href="/shop">Shop refurbished devices</LinkButton>} />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/track/${o.code}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5 hover:border-brand-300">
              <div>
                <p className="text-sm font-semibold text-foreground">{o.code}</p>
                <p className="text-xs text-muted">{formatDate(o.createdAt)} · {o.items.length} item{o.items.length > 1 ? "s" : ""}</p>
              </div>
              <p className="text-sm font-bold text-brand-700">{formatNaira(o.totalKobo, { withDecimals: false })}</p>
              <div className="flex gap-2">
                <OrderStatusBadge status={o.status} label={ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS] ?? o.status} />
                <PaymentStatusBadge status={o.paymentStatus} label={o.paymentStatus.replace(/_/g, " ")} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
