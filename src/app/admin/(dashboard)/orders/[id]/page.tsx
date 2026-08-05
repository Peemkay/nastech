import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDateTime } from "@/lib/utils";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/Badge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { StatusUpdater } from "@/components/admin/StatusUpdater";

export const metadata: Metadata = { title: "Order detail" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payments: true, statusEvents: { orderBy: { createdAt: "asc" } }, user: true },
  });
  if (!order) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">{order.code}</h1>
          <p className="text-sm text-muted">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <OrderStatusBadge status={order.status} label={ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ?? order.status} />
          <PaymentStatusBadge status={order.paymentStatus} label={order.paymentStatus.replace(/_/g, " ")} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><p className="text-sm font-semibold text-foreground">Items</p></CardHeader>
            <CardBody className="p-0">
              <ul className="divide-y divide-border">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between px-5 py-3.5 text-sm">
                    <span>{item.name} <span className="text-muted">× {item.quantity}</span></span>
                    <span className="font-medium">{formatNaira(item.priceKobo * item.quantity, { withDecimals: false })}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-1.5 border-t border-border px-5 py-4 text-sm">
                <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatNaira(order.subtotalKobo, { withDecimals: false })}</span></div>
                <div className="flex justify-between text-muted"><span>Shipping</span><span>{order.shippingFeeKobo === 0 ? "Free" : formatNaira(order.shippingFeeKobo, { withDecimals: false })}</span></div>
                <div className="flex justify-between font-bold text-foreground"><span>Total</span><span>{formatNaira(order.totalKobo, { withDecimals: false })}</span></div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><p className="text-sm font-semibold text-foreground">Customer & shipping</p></CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs text-muted">Contact</p>
                <p className="font-medium text-foreground">{order.shipFullName}</p>
                <p className="text-muted">{order.contactEmail}</p>
                <p className="text-muted">{order.contactPhone}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Delivery address</p>
                <p className="font-medium text-foreground">{order.shipLine1}{order.shipLine2 && `, ${order.shipLine2}`}</p>
                <p className="text-muted">{order.shipCity}, {order.shipState}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><p className="text-sm font-semibold text-foreground">Payments</p></CardHeader>
            <CardBody className="p-0">
              {order.payments.length === 0 ? (
                <p className="p-5 text-sm text-muted">No payment attempts recorded yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {order.payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                      <div>
                        <p className="font-medium text-foreground">{p.provider.replace("_", " ")}</p>
                        <p className="font-mono text-xs text-muted">{p.reference}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{formatNaira(p.amountKobo, { withDecimals: false })}</p>
                        <PaymentStatusBadge status={p.status === "SUCCESS" ? "PAID" : p.status} label={p.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><p className="text-sm font-semibold text-foreground">Status history</p></CardHeader>
            <CardBody>
              <StatusTimeline events={order.statusEvents} statusLabels={ORDER_STATUS_LABELS} />
            </CardBody>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader><p className="text-sm font-semibold text-foreground">Manage order</p></CardHeader>
            <CardBody>
              <StatusUpdater
                endpoint={`/api/admin/orders/${order.id}`}
                statuses={ORDER_STATUSES}
                labels={ORDER_STATUS_LABELS}
                currentStatus={order.status}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
