import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  const { orderId } = await req.json().catch(() => ({}));
  if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.paymentStatus === "PAID") return NextResponse.json({ error: "Order is already paid" }, { status: 400 });

  const settings = await getSettings();

  await prisma.$transaction([
    prisma.payment.upsert({
      where: { reference: order.code },
      update: {},
      create: { orderId: order.id, provider: "BANK_TRANSFER", reference: order.code, amountKobo: order.totalKobo, status: "INITIATED" },
    }),
    prisma.order.update({ where: { id: order.id }, data: { paymentMethod: "BANK_TRANSFER", paymentStatus: "AWAITING_VERIFICATION" } }),
    prisma.orderStatusEvent.create({
      data: { orderId: order.id, status: "PENDING_PAYMENT", note: "Awaiting bank transfer confirmation" },
    }),
  ]);

  return NextResponse.json({
    bankName: settings.bankName,
    bankAccountNumber: settings.bankAccountNumber,
    bankAccountName: settings.bankAccountName,
    reference: order.code,
    amountKobo: order.totalKobo,
  });
}
