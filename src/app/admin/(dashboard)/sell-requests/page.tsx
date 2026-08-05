import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDateTime } from "@/lib/utils";
import { SELL_REQUEST_STATUSES, SELL_REQUEST_STATUS_LABELS } from "@/lib/constants";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { SellStatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Misc";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";

export const metadata: Metadata = { title: "Sell Requests" };

export default async function AdminSellRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const where: Prisma.SellRequestWhereInput = {};
  if (sp.status) where.status = sp.status;
  if (sp.q) where.OR = [{ code: { contains: sp.q } }, { contactEmail: { contains: sp.q } }, { contactName: { contains: sp.q } }];

  const sellRequests = await prisma.sellRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { model: { include: { brand: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-foreground">Sell Requests</h1>
        <p className="text-sm text-muted">{sellRequests.length} result{sellRequests.length !== 1 ? "s" : ""}</p>
      </div>

      <AdminFilterBar
        searchPlaceholder="Search by code, name or email…"
        statusOptions={SELL_REQUEST_STATUSES.map((s) => ({ value: s, label: SELL_REQUEST_STATUS_LABELS[s] }))}
      />

      {sellRequests.length === 0 ? (
        <EmptyState title="No sell requests found" />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Code</Th>
              <Th>Customer</Th>
              <Th>Device</Th>
              <Th>Quote</Th>
              <Th>Pickup</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </tr>
          </Thead>
          <Tbody>
            {sellRequests.map((s) => (
              <Tr key={s.id}>
                <Td><Link href={`/admin/sell-requests/${s.id}`} className="font-semibold text-brand-700 hover:underline">{s.code}</Link></Td>
                <Td>
                  <p className="font-medium">{s.contactName}</p>
                  <p className="text-xs text-muted">{s.contactEmail}</p>
                </Td>
                <Td>{s.model.brand.name} {s.model.name}</Td>
                <Td className="font-semibold">{formatNaira(s.finalKobo ?? s.quotedKobo, { withDecimals: false })}</Td>
                <Td className="text-xs">{s.pickupDate ? new Date(s.pickupDate).toLocaleDateString("en-NG", { day: "2-digit", month: "short" }) : "—"} {s.pickupSlot && `· ${s.pickupSlot.split(" ")[0]}`}</Td>
                <Td><SellStatusBadge status={s.status} label={SELL_REQUEST_STATUS_LABELS[s.status as keyof typeof SELL_REQUEST_STATUS_LABELS] ?? s.status} /></Td>
                <Td className="text-xs text-muted">{formatDateTime(s.createdAt)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
