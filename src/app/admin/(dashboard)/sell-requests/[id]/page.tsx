import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDateTime, formatDate } from "@/lib/utils";
import { SELL_REQUEST_STATUS_LABELS } from "@/lib/constants";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { SellStatusBadge } from "@/components/ui/Badge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { SellRequestStatusUpdater } from "@/components/admin/SellRequestStatusUpdater";

export const metadata: Metadata = { title: "Sell request detail" };

export default async function AdminSellRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sellRequest = await prisma.sellRequest.findUnique({
    where: { id },
    include: {
      model: { include: { brand: true } },
      category: { include: { conditionQuestions: { include: { options: true } } } },
      statusEvents: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!sellRequest) notFound();

  const answers = (sellRequest.answers && typeof sellRequest.answers === "object" ? (sellRequest.answers as Record<string, string>) : {}) ?? {};

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">{sellRequest.code}</h1>
          <p className="text-sm text-muted">Submitted {formatDateTime(sellRequest.createdAt)}</p>
        </div>
        <SellStatusBadge status={sellRequest.status} label={SELL_REQUEST_STATUS_LABELS[sellRequest.status as keyof typeof SELL_REQUEST_STATUS_LABELS] ?? sellRequest.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><p className="text-sm font-semibold text-foreground">Device</p></CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs text-muted">Model</p>
                <p className="font-medium text-foreground">{sellRequest.model.brand.name} {sellRequest.model.name} {sellRequest.storage && `· ${sellRequest.storage}`}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Quoted value</p>
                <p className="font-medium text-foreground">{formatNaira(sellRequest.quotedKobo, { withDecimals: false })}</p>
              </div>
              {sellRequest.finalKobo !== null && (
                <div>
                  <p className="text-xs text-muted">Final offer</p>
                  <p className="font-bold text-brand-700">{formatNaira(sellRequest.finalKobo, { withDecimals: false })}</p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><p className="text-sm font-semibold text-foreground">Reported condition</p></CardHeader>
            <CardBody className="p-0">
              <ul className="divide-y divide-border">
                {sellRequest.category.conditionQuestions.map((q) => {
                  const option = q.options.find((o) => o.id === answers[q.id]);
                  return (
                    <li key={q.id} className="flex justify-between px-5 py-3 text-sm">
                      <span className="text-muted">{q.question}</span>
                      <span className="font-medium text-foreground">{option?.label ?? "—"}</span>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><p className="text-sm font-semibold text-foreground">Contact & pickup</p></CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs text-muted">Contact</p>
                <p className="font-medium text-foreground">{sellRequest.contactName}</p>
                <p className="text-muted">{sellRequest.contactEmail}</p>
                <p className="text-muted">{sellRequest.contactPhone}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Pickup</p>
                <p className="font-medium text-foreground">{sellRequest.pickupLine1}{sellRequest.pickupLine2 && `, ${sellRequest.pickupLine2}`}</p>
                <p className="text-muted">{sellRequest.pickupCity}, {sellRequest.pickupState}</p>
                <p className="text-muted">{sellRequest.pickupDate && formatDate(sellRequest.pickupDate)} · {sellRequest.pickupSlot}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><p className="text-sm font-semibold text-foreground">Status history</p></CardHeader>
            <CardBody>
              <StatusTimeline events={sellRequest.statusEvents} statusLabels={SELL_REQUEST_STATUS_LABELS} />
            </CardBody>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader><p className="text-sm font-semibold text-foreground">Manage request</p></CardHeader>
            <CardBody>
              <SellRequestStatusUpdater id={sellRequest.id} currentStatus={sellRequest.status} quotedKobo={sellRequest.quotedKobo} finalKobo={sellRequest.finalKobo} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
