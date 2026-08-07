import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";
import { GRADE_LABELS, type ProductGrade } from "@/lib/constants";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Misc";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { Prisma } from "@prisma/client";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; stock?: string }> }) {
  const sp = await searchParams;
  const where: Prisma.ProductWhereInput = sp.q ? { OR: [{ name: { contains: sp.q } }, { sku: { contains: sp.q } }] } : {};
  if (sp.stock === "low") where.stock = { gt: 0, lte: 5 };
  if (sp.stock === "out") where.stock = 0;

  const products = await prisma.product.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: { category: true, brand: true } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-foreground">Products</h1>
        <LinkButton href="/admin/products/new" icon={<Plus className="size-4" />}>Add product</LinkButton>
      </div>

      <AdminFilterBar searchPlaceholder="Search by name or SKU…" />

      {products.length === 0 ? (
        <EmptyState title="No products yet" subtitle="Add your first refurbished device to the shop." action={<LinkButton href="/admin/products/new">Add product</LinkButton>} />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Product</Th>
              <Th>Category</Th>
              <Th>Grade</Th>
              <Th>Price</Th>
              <Th>Stock</Th>
              <Th>Status</Th>
            </tr>
          </Thead>
          <Tbody>
            {products.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <Link href={`/admin/products/${p.id}`} className="font-semibold text-brand-700 hover:underline">{p.name}</Link>
                  <p className="text-xs text-muted">{p.sku}</p>
                </Td>
                <Td>{p.category.name} · {p.brand.name}</Td>
                <Td><Badge tone="silver">{GRADE_LABELS[p.grade as ProductGrade] ?? p.grade}</Badge></Td>
                <Td className="font-semibold">{formatNaira(p.priceKobo, { withDecimals: false })}</Td>
                <Td>
                  <span className={p.stock === 0 ? "font-medium text-danger" : p.stock <= 5 ? "font-medium text-amber-600" : ""}>{p.stock}</span>
                </Td>
                <Td>{p.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
