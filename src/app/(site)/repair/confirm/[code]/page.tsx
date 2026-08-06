import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";
import { REPAIR_STATUS_LABELS, REPAIR_SERVICE_TYPE_LABELS, type RepairServiceType } from "@/lib/constants";
import { Container } from "@/components/ui/Misc";
import { Card, CardBody } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { StatusTimeline } from "@/components/StatusTimeline";
import { CopyCodeButton } from "@/components/CopyCodeButton";

export const metadata: Metadata = { title: "Repair booked" };

export default async function RepairConfirmPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const repairRequest = await prisma.repairRequest.findUnique({
    where: { code },
    include: { issues: true, statusEvents: { orderBy: { createdAt: "asc" } } },
  });
  if (!repairRequest) notFound();

  return (
    <Container className="max-w-2xl py-14">
      <div className="text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 className="size-9" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-foreground">Repair booked!</h1>
        <p className="mt-2 text-muted">
          {REPAIR_SERVICE_TYPE_LABELS[repairRequest.serviceType as RepairServiceType]} — {repairRequest.deviceLabel}
        </p>
      </div>

      <Card className="mt-8">
        <CardBody className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Your tracking code</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <p className="text-xl font-extrabold tracking-wide text-brand-700">{repairRequest.code}</p>
            <CopyCodeButton code={repairRequest.code} />
          </div>
          <div className="my-5 h-px bg-border" />
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Estimated cost</p>
          <p className="mt-1 text-3xl font-extrabold text-foreground">{formatNaira(repairRequest.estimatedKobo, { withDecimals: false })}</p>
          <p className="mt-1 text-xs text-muted">Final price confirmed after diagnosis</p>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardBody>
          <p className="mb-4 text-sm font-semibold text-foreground">Status</p>
          <StatusTimeline events={repairRequest.statusEvents} statusLabels={REPAIR_STATUS_LABELS} />
        </CardBody>
      </Card>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <LinkButton href={`/track/${repairRequest.code}`} variant="secondary">
          Track this repair
        </LinkButton>
        <LinkButton href="/">Back to home</LinkButton>
      </div>
    </Container>
  );
}
