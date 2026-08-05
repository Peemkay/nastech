import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDate } from "@/lib/utils";
import { SELL_REQUEST_STATUS_LABELS } from "@/lib/constants";
import { Container } from "@/components/ui/Misc";
import { Card, CardBody } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { StatusTimeline } from "@/components/StatusTimeline";
import { CopyCodeButton } from "@/components/CopyCodeButton";

export const metadata: Metadata = { title: "Pickup scheduled" };

export default async function SellConfirmPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const sellRequest = await prisma.sellRequest.findUnique({
    where: { code },
    include: { model: { include: { brand: true } }, category: true, statusEvents: { orderBy: { createdAt: "asc" } } },
  });
  if (!sellRequest) notFound();

  return (
    <Container className="max-w-2xl py-14">
      <div className="text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 className="size-9" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-foreground">Pickup scheduled!</h1>
        <p className="mt-2 text-muted">
          We&apos;ll pick up your {sellRequest.model.brand.name} {sellRequest.model.name} on{" "}
          {sellRequest.pickupDate && formatDate(sellRequest.pickupDate)} ({sellRequest.pickupSlot}).
        </p>
      </div>

      <Card className="mt-8">
        <CardBody className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Your tracking code</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <p className="text-xl font-extrabold tracking-wide text-brand-700">{sellRequest.code}</p>
            <CopyCodeButton code={sellRequest.code} />
          </div>
          <p className="mt-1 text-xs text-muted">Save this to track your pickup and payout status anytime.</p>
          <div className="my-5 h-px bg-border" />
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Estimated payout</p>
          <p className="mt-1 text-3xl font-extrabold text-foreground">{formatNaira(sellRequest.quotedKobo, { withDecimals: false })}</p>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardBody>
          <p className="mb-4 text-sm font-semibold text-foreground">Status</p>
          <StatusTimeline events={sellRequest.statusEvents} statusLabels={SELL_REQUEST_STATUS_LABELS} />
        </CardBody>
      </Card>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <LinkButton href={`/track/${sellRequest.code}`} variant="secondary">
          Track this pickup
        </LinkButton>
        <LinkButton href="/">Back to home</LinkButton>
      </div>
    </Container>
  );
}
