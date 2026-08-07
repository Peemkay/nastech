import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Landmark } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS, SELL_REQUEST_STATUS_LABELS, REPAIR_STATUS_LABELS, REPAIR_SERVICE_TYPE_LABELS, formatStateName, type RepairServiceType } from "@/lib/constants";
import { getSettings } from "@/lib/settings";
import { Container } from "@/components/ui/Misc";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge, OrderStatusBadge, PaymentStatusBadge, SellStatusBadge } from "@/components/ui/Badge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { CopyCodeButton } from "@/components/CopyCodeButton";
import { ProofOfPaymentUploader } from "@/components/ProofOfPaymentUploader";

export const metadata: Metadata = { title: "Track" };

export default async function TrackPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ new?: string; failed?: string }>;
}) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const sp = await searchParams;

  if (code.includes("REP")) {
    const repairRequest = await prisma.repairRequest.findUnique({
      where: { code },
      include: { issues: true, statusEvents: { orderBy: { createdAt: "asc" } } },
    });
    if (!repairRequest) notFound();

    return (
      <Container className="max-w-2xl py-12">
        <Banner show={sp.new === "1"} />
        <Card>
          <CardBody>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-lg font-extrabold text-foreground">
                  {repairRequest.code} <CopyCodeButton code={repairRequest.code} />
                </p>
                <p className="text-sm text-muted">{repairRequest.deviceLabel}</p>
              </div>
              <Badge tone="brand">{REPAIR_STATUS_LABELS[repairRequest.status as keyof typeof REPAIR_STATUS_LABELS] ?? repairRequest.status}</Badge>
            </div>

            <div className="my-5 h-px bg-border" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">{repairRequest.finalKobo != null ? "Final cost" : "Estimated cost"}</p>
                <p className="mt-1 text-xl font-extrabold text-foreground">{formatNaira(repairRequest.finalKobo ?? repairRequest.estimatedKobo, { withDecimals: false })}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Service</p>
                <p className="mt-1 text-sm font-medium text-foreground">{REPAIR_SERVICE_TYPE_LABELS[repairRequest.serviceType as RepairServiceType]}</p>
                {repairRequest.serviceType === "PICKUP" && repairRequest.pickupDate && (
                  <p className="text-xs text-muted">{formatDate(repairRequest.pickupDate)} · {repairRequest.pickupSlot}</p>
                )}
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-silver-100/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Repairs</p>
              <ul className="mt-2 space-y-1">
                {repairRequest.issues.map((i) => (
                  <li key={i.id} className="flex justify-between text-sm">
                    <span className="text-muted">{i.name}</span>
                    <span className="font-medium text-foreground">{formatNaira(i.priceKobo, { withDecimals: false })}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>

        <Card className="mt-6">
          <CardBody>
            <p className="mb-4 text-sm font-semibold text-foreground">Status</p>
            <StatusTimeline events={repairRequest.statusEvents} statusLabels={REPAIR_STATUS_LABELS} />
          </CardBody>
        </Card>
      </Container>
    );
  }

  if (code.includes("SEL")) {
    const sellRequest = await prisma.sellRequest.findUnique({
      where: { code },
      include: { model: { include: { brand: true } }, category: true, statusEvents: { orderBy: { createdAt: "asc" } } },
    });
    if (!sellRequest) notFound();

    return (
      <Container className="max-w-2xl py-12">
        <Banner show={sp.new === "1"} />
        <Card>
          <CardBody>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-lg font-extrabold text-foreground">
                  {sellRequest.code} <CopyCodeButton code={sellRequest.code} />
                </p>
                <p className="text-sm text-muted">
                  {sellRequest.model.brand.name} {sellRequest.model.name} · {sellRequest.category.name}
                </p>
              </div>
              <SellStatusBadge status={sellRequest.status} label={SELL_REQUEST_STATUS_LABELS[sellRequest.status as keyof typeof SELL_REQUEST_STATUS_LABELS] ?? sellRequest.status} />
            </div>

            <div className="my-5 h-px bg-border" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Estimated value</p>
                <p className="mt-1 text-xl font-extrabold text-foreground">{formatNaira(sellRequest.finalKobo ?? sellRequest.quotedKobo, { withDecimals: false })}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Pickup</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {sellRequest.pickupDate && formatDate(sellRequest.pickupDate)} · {sellRequest.pickupSlot}
                </p>
                <p className="text-xs text-muted">
                  {sellRequest.pickupLine1}, {sellRequest.pickupLga && `${sellRequest.pickupLga}, `}{sellRequest.pickupCity}, {sellRequest.pickupState && formatStateName(sellRequest.pickupState)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="mt-6">
          <CardBody>
            <p className="mb-4 text-sm font-semibold text-foreground">Status</p>
            <StatusTimeline events={sellRequest.statusEvents} statusLabels={SELL_REQUEST_STATUS_LABELS} />
          </CardBody>
        </Card>
      </Container>
    );
  }

  const order = await prisma.order.findUnique({
    where: { code },
    include: { items: true, statusEvents: { orderBy: { createdAt: "asc" } }, payments: { orderBy: { createdAt: "desc" } } },
  });
  if (!order) notFound();
  const bankTransferPayment = order.payments.find((p) => p.provider === "BANK_TRANSFER");

  const settings = order.paymentMethod === "BANK_TRANSFER" && order.paymentStatus === "AWAITING_VERIFICATION" ? await getSettings() : null;

  return (
    <Container className="max-w-2xl py-12">
      <Banner show={sp.new === "1" && order.paymentStatus === "PAID"} />
      {sp.failed === "1" && (
        <Card className="mb-6 border-danger/30 bg-red-50">
          <CardBody className="flex items-center gap-3">
            <AlertTriangle className="size-5 shrink-0 text-danger" />
            <div>
              <p className="text-sm font-semibold text-danger">Payment was not completed</p>
              <p className="text-xs text-red-700">You can retry payment from your order, or contact support if you were charged.</p>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-lg font-extrabold text-foreground">
                {order.code} <CopyCodeButton code={order.code} />
              </p>
              <p className="text-sm text-muted">
                {order.items.length} item{order.items.length > 1 ? "s" : ""} · {formatNaira(order.totalKobo, { withDecimals: false })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <OrderStatusBadge status={order.status} label={ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ?? order.status} />
              <PaymentStatusBadge status={order.paymentStatus} label={order.paymentStatus.replace(/_/g, " ")} />
            </div>
          </div>

          <div className="my-5 h-px bg-border" />
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-foreground">
                  {item.name} <span className="text-muted">× {item.quantity}</span>
                </span>
                <span className="font-medium text-foreground">{formatNaira(item.priceKobo * item.quantity, { withDecimals: false })}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-silver-100/60 p-4 text-sm">
            <p className="text-muted">Deliver to</p>
            <p className="mt-1 font-medium text-foreground">{order.shipFullName} · {order.shipPhone}</p>
            <p className="text-muted">{order.shipLine1}, {order.shipLga && `${order.shipLga}, `}{order.shipCity}, {formatStateName(order.shipState)}</p>
          </div>
        </CardBody>
      </Card>

      {settings && (
        <Card className="mt-6 border-brand-200 bg-brand-50">
          <CardBody>
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-brand-700">
              <Landmark className="size-4" /> Complete your bank transfer
            </p>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Bank</dt><dd className="font-medium text-foreground">{settings.bankName}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Account number</dt><dd className="font-medium text-foreground">{settings.bankAccountNumber}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Account name</dt><dd className="font-medium text-foreground">{settings.bankAccountName}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Amount</dt><dd className="font-bold text-brand-700">{formatNaira(order.totalKobo, { withDecimals: false })}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Reference (use as narration)</dt><dd className="font-mono font-medium text-foreground">{order.code}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-brand-700">We confirm bank transfers within a few hours during business hours and will update this page automatically.</p>
            <div className="mt-4 border-t border-brand-200 pt-4">
              <ProofOfPaymentUploader orderCode={order.code} existingProofUrl={bankTransferPayment?.proofUrl} />
            </div>
          </CardBody>
        </Card>
      )}

      <Card className="mt-6">
        <CardBody>
          <p className="mb-4 text-sm font-semibold text-foreground">Status</p>
          <StatusTimeline events={order.statusEvents} statusLabels={ORDER_STATUS_LABELS} />
        </CardBody>
      </Card>
    </Container>
  );
}

function Banner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardBody className="flex items-center gap-3">
        <CheckCircle2 className="size-5 shrink-0 text-green-600" />
        <p className="text-sm font-semibold text-green-700">Thank you! Your request was received successfully.</p>
      </CardBody>
    </Card>
  );
}
