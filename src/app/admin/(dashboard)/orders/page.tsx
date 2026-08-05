import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDateTime } from "@/lib/utils";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Misc";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const where: Prisma.OrderWhereInput = {};
  if (sp.status) where.status = sp.status;
  if (sp.q) where.OR = [{ code: { contains: sp.q } }, { contactEmail: { contains: sp.q } }, { shipFullName: { contains: sp.q } }];

  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: { items: true } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-foreground">Orders</h1>
        <p className="text-sm text-muted">{orders.length} result{orders.length !== 1 ? "s" : ""}</p>
      </div>

      <AdminFilterBar
        searchPlaceholder="Search by code, email or name…"
        statusOptions={ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] }))}
      />

      {orders.length === 0 ? (
        <EmptyState title="No orders found" />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Code</Th>
              <Th>Customer</Th>
              <Th>Items</Th>
              <Th>Total</Th>
              <Th>Payment</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </tr>
          </Thead>
          <Tbody>
            {orders.map((o) => (
              <Tr key={o.id} className="cursor-pointer">
                <Td>
                  <Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand-700 hover:underline">{o.code}</Link>
                </Td>
                <Td>
                  <p className="font-medium">{o.shipFullName}</p>
                  <p className="text-xs text-muted">{o.contactEmail}</p>
                </Td>
                <Td>{o.items.length}</Td>
                <Td className="font-semibold">{formatNaira(o.totalKobo, { withDecimals: false })}</Td>
                <Td><PaymentStatusBadge status={o.paymentStatus} label={o.paymentStatus.replace(/_/g, " ")} /></Td>
                <Td><OrderStatusBadge status={o.status} label={ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS] ?? o.status} /></Td>
                <Td className="text-xs text-muted">{formatDateTime(o.createdAt)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
