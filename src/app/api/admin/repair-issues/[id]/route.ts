import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { REPAIR_ISSUE_TYPES } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(2),
  type: z.enum(REPAIR_ISSUE_TYPES),
  basePriceKobo: z.number().int().min(0),
  durationHint: z.string().min(1),
  description: z.string().optional().default(""),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().optional().default(true),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid repair issue" }, { status: 400 });
  await prisma.repairIssue.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await params;
  await prisma.repairIssue.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
