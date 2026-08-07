import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { markPaymentFailed } from "@/lib/payments/record-payment";

const schema = z.object({ note: z.string().max(500).optional() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  await markPaymentFailed(payment.reference, { rejectedBy: session.user.email, note: parsed.success ? parsed.data.note : undefined });

  return NextResponse.json({ ok: true });
}
