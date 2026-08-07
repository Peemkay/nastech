import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { markPaymentSuccess } from "@/lib/payments/record-payment";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  const result = await markPaymentSuccess(payment.reference, { confirmedBy: session.user.email, method: "manual-bank-transfer-review" });
  if (!result.ok) return NextResponse.json({ error: "Could not confirm payment" }, { status: 400 });

  return NextResponse.json({ ok: true });
}
