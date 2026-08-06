import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { REPAIR_ISSUE_TYPES } from "@/lib/constants";

const schema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(2),
  type: z.enum(REPAIR_ISSUE_TYPES),
  basePriceKobo: z.number().int().min(0),
  durationHint: z.string().min(1),
  description: z.string().optional().default(""),
  sortOrder: z.number().int().default(0),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid repair issue" }, { status: 400 });

  const issue = await prisma.repairIssue.create({ data: parsed.data });
  return NextResponse.json({ id: issue.id }, { status: 201 });
}
