import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

const schema = z.object({ categoryId: z.string().min(1), question: z.string().min(3), sortOrder: z.number().int().default(0) });

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid question" }, { status: 400 });
  const question = await prisma.conditionQuestion.create({ data: parsed.data });
  return NextResponse.json({ id: question.id }, { status: 201 });
}
