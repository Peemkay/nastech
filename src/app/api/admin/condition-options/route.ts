import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

const schema = z.object({
  questionId: z.string().min(1),
  label: z.string().min(1),
  deductionBps: z.number().int().min(0).max(10000),
  sortOrder: z.number().int().default(0),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  const option = await prisma.conditionOption.create({ data: parsed.data });
  return NextResponse.json({ id: option.id }, { status: 201 });
}
