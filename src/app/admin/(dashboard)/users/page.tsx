import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/auth-admin";
import { formatDate } from "@/lib/utils";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { UserRoleSelect } from "@/components/admin/UserRoleSelect";
import { AddAdminForm } from "@/components/admin/AddAdminForm";
import { AdminResetPasswordButton } from "@/components/admin/AdminResetPasswordButton";
import { EmptyState } from "@/components/ui/Misc";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const session = await adminAuth();
  const where: Prisma.UserWhereInput = sp.q ? { OR: [{ name: { contains: sp.q } }, { email: { contains: sp.q } }] } : {};

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { orders: true, sellRequests: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-foreground">Users</h1>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted">{users.length} result{users.length !== 1 ? "s" : ""}</p>
          {session?.user.role === "SUPERADMIN" && <AddAdminForm />}
        </div>
      </div>

      <AdminFilterBar searchPlaceholder="Search by name or email…" />

      {users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Orders</Th>
              <Th>Sell requests</Th>
              <Th>Joined</Th>
              <Th>Role</Th>
              <Th>Password</Th>
            </tr>
          </Thead>
          <Tbody>
            {users.map((u) => (
              <Tr key={u.id}>
                <Td className="font-medium">{u.name}</Td>
                <Td className="text-muted">{u.email}</Td>
                <Td>{u._count.orders}</Td>
                <Td>{u._count.sellRequests}</Td>
                <Td className="text-xs text-muted">{formatDate(u.createdAt)}</Td>
                <Td>
                  {u.role !== "CUSTOMER" && <Badge tone="brand" className="mb-1.5">{u.role}</Badge>}
                  <UserRoleSelect userId={u.id} role={u.role} canEdit={session?.user.role === "SUPERADMIN" && u.id !== session.user.id} />
                </Td>
                <Td>
                  {session?.user.role === "SUPERADMIN" && (
                    <AdminResetPasswordButton userId={u.id} disabled={u.id === session.user.id} />
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
