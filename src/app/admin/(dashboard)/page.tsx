import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, Package, Repeat, ShoppingCart, TriangleAlert, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS_LABELS, SELL_REQUEST_STATUS_LABELS } from "@/lib/constants";
import { StatCard } from "@/components/admin/StatCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { OrderStatusBadge, SellStatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Misc";

export const metadata: Metadata = { title: "Admin Dashboard" };

const PENDING_SELL_STATUSES = ["QUOTE_GENERATED", "PICKUP_SCHEDULED", "PICKED_UP", "INSPECTING", "OFFER_REVISED"];

export default async function AdminDashboardPage() {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const [revenueAgg, ordersCount, pendingSellCount, productsCount, lowStockCount, usersCount, recentOrders, recentSells, recentPaidOrders] =
    await Promise.all([
      prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { totalKobo: true } }),
      prisma.order.count(),
      prisma.sellRequest.count({ where: { status: { in: PENDING_SELL_STATUSES } } }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { gt: 0, lte: 5 }, isActive: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.sellRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { model: { include: { brand: true } } } }),
      prisma.order.findMany({ where: { paymentStatus: "PAID", updatedAt: { gte: fourteenDaysAgo } }, select: { totalKobo: true, updatedAt: true } }),
    ]);

  const dayBuckets = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    dayBuckets.set(d.toLocaleDateString("en-NG", { day: "2-digit", month: "short" }), 0);
  }
  for (const order of recentPaidOrders) {
    const key = new Date(order.updatedAt).toLocaleDateString("en-NG", { day: "2-digit", month: "short" });
    if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + order.totalKobo);
  }
  const chartData = Array.from(dayBuckets.entries()).map(([date, revenueKobo]) => ({ date, revenueKobo }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-foreground">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Banknote} label="Total revenue (paid)" value={formatNaira(revenueAgg._sum.totalKobo ?? 0, { withDecimals: false })} tone="success" />
        <StatCard icon={ShoppingCart} label="Total orders" value={ordersCount} tone="brand" />
        <StatCard icon={Repeat} label="Pending sell requests" value={pendingSellCount} tone="warning" />
        <StatCard icon={Users} label="Customers" value={usersCount} tone="silver" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <StatCard icon={Package} label="Active products" value={productsCount} tone="brand" />
        <StatCard icon={TriangleAlert} label="Low stock (≤5 units)" value={lowStockCount} tone="warning" hint={lowStockCount > 0 ? "Review inventory soon" : undefined} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <p className="text-sm font-semibold text-foreground">Revenue — last 14 days</p>
        </CardHeader>
        <CardBody>
          <RevenueChart data={chartData} />
        </CardBody>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Recent orders</p>
            <Link href="/admin/orders" className="text-xs font-medium text-brand-600 hover:underline">View all</Link>
          </CardHeader>
          <CardBody className="p-0">
            {recentOrders.length === 0 ? (
              <div className="p-6"><EmptyState title="No orders yet" /></div>
            ) : (
              <ul className="divide-y divide-border">
                {recentOrders.map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-brand-50/40">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{o.code}</p>
                        <p className="text-xs text-muted">{formatDateTime(o.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">{formatNaira(o.totalKobo, { withDecimals: false })}</span>
                        <OrderStatusBadge status={o.status} label={ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS] ?? o.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Recent sell requests</p>
            <Link href="/admin/sell-requests" className="text-xs font-medium text-brand-600 hover:underline">View all</Link>
          </CardHeader>
          <CardBody className="p-0">
            {recentSells.length === 0 ? (
              <div className="p-6"><EmptyState title="No sell requests yet" /></div>
            ) : (
              <ul className="divide-y divide-border">
                {recentSells.map((s) => (
                  <li key={s.id}>
                    <Link href={`/admin/sell-requests/${s.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-brand-50/40">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{s.code}</p>
                        <p className="text-xs text-muted">{s.model.brand.name} {s.model.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">{formatNaira(s.quotedKobo, { withDecimals: false })}</span>
                        <SellStatusBadge status={s.status} label={SELL_REQUEST_STATUS_LABELS[s.status as keyof typeof SELL_REQUEST_STATUS_LABELS] ?? s.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
