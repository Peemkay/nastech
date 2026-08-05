import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDate } from "@/lib/utils";
import { SELL_REQUEST_STATUS_LABELS } from "@/lib/constants";
import { SellStatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Misc";
import { LinkButton } from "@/components/ui/Button";
import { Repeat } from "lucide-react";

export const metadata: Metadata = { title: "My Sell Requests" };

export default async function AccountSellRequestsPage() {
  const session = await auth();
  const sellRequests = await prisma.sellRequest.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { model: { include: { brand: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-foreground">My Sell Requests</h1>
      {sellRequests.length === 0 ? (
        <EmptyState icon={<Repeat className="size-8" />} title="No sell requests yet" subtitle="Trade in your old device for instant cash." action={<LinkButton href="/sell">Get an instant quote</LinkButton>} />
      ) : (
        <div className="space-y-3">
          {sellRequests.map((s) => (
            <Link key={s.id} href={`/track/${s.code}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5 hover:border-brand-300">
              <div>
                <p className="text-sm font-semibold text-foreground">{s.code}</p>
                <p className="text-xs text-muted">
                  {s.model.brand.name} {s.model.name} · {formatDate(s.createdAt)}
                </p>
              </div>
              <p className="text-sm font-bold text-brand-700">{formatNaira(s.finalKobo ?? s.quotedKobo, { withDecimals: false })}</p>
              <SellStatusBadge status={s.status} label={SELL_REQUEST_STATUS_LABELS[s.status as keyof typeof SELL_REQUEST_STATUS_LABELS] ?? s.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
