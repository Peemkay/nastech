import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDate } from "@/lib/utils";
import { REPAIR_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Misc";
import { LinkButton } from "@/components/ui/Button";
import { Wrench } from "lucide-react";

export const metadata: Metadata = { title: "My Repairs" };

export default async function AccountRepairsPage() {
  const session = await auth();
  const repairRequests = await prisma.repairRequest.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-foreground">My Repairs</h1>
      {repairRequests.length === 0 ? (
        <EmptyState icon={<Wrench className="size-8" />} title="No repair bookings yet" subtitle="Got a broken screen or a software issue? We can help." action={<LinkButton href="/repair">Book a repair</LinkButton>} />
      ) : (
        <div className="space-y-3">
          {repairRequests.map((r) => (
            <Link key={r.id} href={`/track/${r.code}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5 hover:border-brand-300">
              <div>
                <p className="text-sm font-semibold text-foreground">{r.code}</p>
                <p className="text-xs text-muted">{r.deviceLabel} · {formatDate(r.createdAt)}</p>
              </div>
              <p className="text-sm font-bold text-brand-700">{formatNaira(r.finalKobo ?? r.estimatedKobo, { withDecimals: false })}</p>
              <Badge tone="brand">{REPAIR_STATUS_LABELS[r.status as keyof typeof REPAIR_STATUS_LABELS] ?? r.status}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
