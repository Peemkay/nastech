import type { Metadata } from "next";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDateTime } from "@/lib/utils";
import { getSettings, parseActiveGateways } from "@/lib/settings";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { PaymentStatusBadge, Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Misc";
import { BankTransferReview } from "@/components/admin/BankTransferReview";

export const metadata: Metadata = { title: "Payments" };

export default async function AdminPaymentsPage() {
  const [payments, settings] = await Promise.all([
    prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { order: { select: { code: true } } } }),
    getSettings(),
  ]);
  const pendingBankTransferCount = payments.filter((p) => p.provider === "BANK_TRANSFER" && p.status === "INITIATED").length;
  const activeGateways = parseActiveGateways(settings.activeGateways);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-foreground">Payments</h1>
        <LinkButton href="/admin/settings" variant="secondary" icon={<Settings2 className="size-4" />}>Gateway settings</LinkButton>
      </div>

      <Card className="mb-6">
        <CardBody className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-foreground">Active gateways:</p>
          {activeGateways.map((g) => <Badge key={g} tone="success">{g.replace("_", " ")}</Badge>)}
          <span className="text-xs text-muted">· Default: {settings.defaultGateway.replace("_", " ")}</span>
          {pendingBankTransferCount > 0 && (
            <Badge tone="warning">{pendingBankTransferCount} bank transfer{pendingBankTransferCount > 1 ? "s" : ""} awaiting review</Badge>
          )}
        </CardBody>
      </Card>

      {payments.length === 0 ? (
        <EmptyState title="No payment transactions yet" />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Order</Th>
              <Th>Provider</Th>
              <Th>Reference</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th>Review</Th>
            </tr>
          </Thead>
          <Tbody>
            {payments.map((p) => (
              <Tr key={p.id}>
                <Td><Link href={`/admin/orders/${p.orderId}`} className="font-semibold text-brand-700 hover:underline">{p.order.code}</Link></Td>
                <Td>{p.provider.replace("_", " ")}</Td>
                <Td className="font-mono text-xs">{p.reference}</Td>
                <Td className="font-semibold">{formatNaira(p.amountKobo, { withDecimals: false })}</Td>
                <Td><PaymentStatusBadge status={p.status === "SUCCESS" ? "PAID" : p.status} label={p.status} /></Td>
                <Td className="text-xs text-muted">{formatDateTime(p.createdAt)}</Td>
                <Td>
                  {p.provider === "BANK_TRANSFER" && p.status === "INITIATED" ? (
                    <BankTransferReview paymentId={p.id} proofUrl={p.proofUrl} />
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
