import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDateTime } from "@/lib/utils";
import { REPAIR_STATUSES, REPAIR_STATUS_LABELS } from "@/lib/constants";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Misc";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";

export const metadata: Metadata = { title: "Repairs" };

export default async function AdminRepairsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const where: Prisma.RepairRequestWhereInput = {};
  if (sp.status) where.status = sp.status;
  if (sp.q) where.OR = [{ code: { contains: sp.q } }, { contactEmail: { contains: sp.q } }, { contactName: { contains: sp.q } }, { deviceLabel: { contains: sp.q } }];

  const repairRequests = await prisma.repairRequest.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: { category: true } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-foreground">Repairs</h1>
        <p className="text-sm text-muted">{repairRequests.length} result{repairRequests.length !== 1 ? "s" : ""}</p>
      </div>

      <AdminFilterBar
        searchPlaceholder="Search by code, name, email or device…"
        statusOptions={REPAIR_STATUSES.map((s) => ({ value: s, label: REPAIR_STATUS_LABELS[s] }))}
      />

      {repairRequests.length === 0 ? (
        <EmptyState title="No repair requests found" />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Code</Th>
              <Th>Customer</Th>
              <Th>Device</Th>
              <Th>Estimate</Th>
              <Th>Service</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </tr>
          </Thead>
          <Tbody>
            {repairRequests.map((r) => (
              <Tr key={r.id}>
                <Td><Link href={`/admin/repairs/${r.id}`} className="font-semibold text-brand-700 hover:underline">{r.code}</Link></Td>
                <Td>
                  <p className="font-medium">{r.contactName}</p>
                  <p className="text-xs text-muted">{r.contactEmail}</p>
                </Td>
                <Td>{r.deviceLabel}</Td>
                <Td className="font-semibold">{formatNaira(r.finalKobo ?? r.estimatedKobo, { withDecimals: false })}</Td>
                <Td><Badge tone="silver">{r.serviceType === "PICKUP" ? "Pickup" : "Drop-off"}</Badge></Td>
                <Td><Badge tone="brand">{REPAIR_STATUS_LABELS[r.status as keyof typeof REPAIR_STATUS_LABELS] ?? r.status}</Badge></Td>
                <Td className="text-xs text-muted">{formatDateTime(r.createdAt)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
