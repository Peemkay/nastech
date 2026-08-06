import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDateTime, formatDate } from "@/lib/utils";
import { REPAIR_STATUS_LABELS, REPAIR_SERVICE_TYPE_LABELS, formatStateName, type RepairServiceType } from "@/lib/constants";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { RepairStatusUpdater } from "@/components/admin/RepairStatusUpdater";

export const metadata: Metadata = { title: "Repair detail" };

export default async function AdminRepairDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repairRequest = await prisma.repairRequest.findUnique({
    where: { id },
    include: { category: true, brand: true, issues: true, statusEvents: { orderBy: { createdAt: "asc" } } },
  });
  if (!repairRequest) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">{repairRequest.code}</h1>
          <p className="text-sm text-muted">Booked {formatDateTime(repairRequest.createdAt)}</p>
        </div>
        <Badge tone="brand">{REPAIR_STATUS_LABELS[repairRequest.status as keyof typeof REPAIR_STATUS_LABELS] ?? repairRequest.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><p className="text-sm font-semibold text-foreground">Device & problem</p></CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs text-muted">Category / Brand</p>
                <p className="font-medium text-foreground">{repairRequest.category.name}{repairRequest.brand && ` · ${repairRequest.brand.name}`}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Device</p>
                <p className="font-medium text-foreground">{repairRequest.deviceLabel}</p>
              </div>
              {repairRequest.problemDescription && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted">Problem description</p>
                  <p className="text-foreground">{repairRequest.problemDescription}</p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><p className="text-sm font-semibold text-foreground">Requested repairs</p></CardHeader>
            <CardBody className="p-0">
              <ul className="divide-y divide-border">
                {repairRequest.issues.map((i) => (
                  <li key={i.id} className="flex justify-between px-5 py-3 text-sm">
                    <span className="text-muted">{i.name}</span>
                    <span className="font-medium text-foreground">{formatNaira(i.priceKobo, { withDecimals: false })}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border px-5 py-4 text-sm">
                <div className="flex justify-between font-bold text-foreground">
                  <span>{repairRequest.finalKobo != null ? "Final cost" : "Estimated cost"}</span>
                  <span>{formatNaira(repairRequest.finalKobo ?? repairRequest.estimatedKobo, { withDecimals: false })}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><p className="text-sm font-semibold text-foreground">Contact & service</p></CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs text-muted">Contact</p>
                <p className="font-medium text-foreground">{repairRequest.contactName}</p>
                <p className="text-muted">{repairRequest.contactEmail}</p>
                <p className="text-muted">{repairRequest.contactPhone}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Service type</p>
                <p className="font-medium text-foreground">{REPAIR_SERVICE_TYPE_LABELS[repairRequest.serviceType as RepairServiceType]}</p>
                {repairRequest.serviceType === "PICKUP" && (
                  <>
                    <p className="text-muted">{repairRequest.pickupLine1}{repairRequest.pickupLine2 && `, ${repairRequest.pickupLine2}`}</p>
                    <p className="text-muted">{repairRequest.pickupLga && `${repairRequest.pickupLga}, `}{repairRequest.pickupCity}, {repairRequest.pickupState && formatStateName(repairRequest.pickupState)}</p>
                    <p className="text-muted">{repairRequest.pickupDate && formatDate(repairRequest.pickupDate)} · {repairRequest.pickupSlot}</p>
                  </>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><p className="text-sm font-semibold text-foreground">Status history</p></CardHeader>
            <CardBody>
              <StatusTimeline events={repairRequest.statusEvents} statusLabels={REPAIR_STATUS_LABELS} />
            </CardBody>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader><p className="text-sm font-semibold text-foreground">Manage repair</p></CardHeader>
            <CardBody>
              <RepairStatusUpdater
                id={repairRequest.id}
                currentStatus={repairRequest.status}
                estimatedKobo={repairRequest.estimatedKobo}
                finalKobo={repairRequest.finalKobo}
                paymentStatus={repairRequest.paymentStatus}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
