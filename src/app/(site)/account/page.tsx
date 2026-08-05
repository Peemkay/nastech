import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Package, Repeat, Wallet } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";
import { Card, CardBody } from "@/components/ui/Card";
import { OrderStatusBadge, SellStatusBadge } from "@/components/ui/Badge";
import { ORDER_STATUS_LABELS, SELL_REQUEST_STATUS_LABELS } from "@/lib/constants";
import { EmptyState } from "@/components/ui/Misc";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountOverviewPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [orderCount, sellCount, recentOrders, recentSells, paidOutTotal] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.sellRequest.count({ where: { userId } }),
    prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.sellRequest.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.sellRequest.aggregate({ where: { userId, status: "PAID_OUT" }, _sum: { finalKobo: true } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-foreground">Welcome back, {session!.user.name?.split(" ")[0]} 👋</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Package} label="Orders placed" value={orderCount} />
        <StatCard icon={Repeat} label="Sell requests" value={sellCount} />
        <StatCard icon={Wallet} label="Total earned" value={formatNaira(paidOutTotal._sum.finalKobo ?? 0, { withDecimals: false })} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Recent orders</p>
            <Link href="/account/orders" className="flex items-center gap-0.5 text-xs font-medium text-brand-600 hover:underline">
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" subtitle="Your purchases will show up here." />
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <Link key={o.id} href={`/track/${o.code}`} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 hover:border-brand-300">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{o.code}</p>
                    <p className="text-xs text-muted">{formatNaira(o.totalKobo, { withDecimals: false })}</p>
                  </div>
                  <OrderStatusBadge status={o.status} label={ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS] ?? o.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Recent sell requests</p>
            <Link href="/account/sell-requests" className="flex items-center gap-0.5 text-xs font-medium text-brand-600 hover:underline">
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          {recentSells.length === 0 ? (
            <EmptyState title="No sell requests yet" subtitle="Trade in a device to see it here." />
          ) : (
            <div className="space-y-2">
              {recentSells.map((s) => (
                <Link key={s.id} href={`/track/${s.code}`} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 hover:border-brand-300">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{s.code}</p>
                    <p className="text-xs text-muted">{formatNaira(s.finalKobo ?? s.quotedKobo, { withDecimals: false })}</p>
                  </div>
                  <SellStatusBadge status={s.status} label={SELL_REQUEST_STATUS_LABELS[s.status as keyof typeof SELL_REQUEST_STATUS_LABELS] ?? s.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string | number }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-lg font-extrabold text-foreground">{value}</p>
          <p className="text-xs text-muted">{label}</p>
        </div>
      </CardBody>
    </Card>
  );
}
