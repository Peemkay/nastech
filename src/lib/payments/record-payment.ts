import { prisma } from "@/lib/prisma";

/**
 * Idempotently marks a Payment (and its parent Order) as successfully paid.
 * Safe to call multiple times for the same reference (webhook + redirect-page
 * verification both call this) — only the first call has any effect.
 */
export async function markPaymentSuccess(reference: string, rawPayload?: unknown) {
  const payment = await prisma.payment.findUnique({ where: { reference }, include: { order: { include: { items: true } } } });
  if (!payment) return { ok: false as const, reason: "PAYMENT_NOT_FOUND" as const };
  if (payment.status === "SUCCESS") return { ok: true as const, order: payment.order, alreadyProcessed: true };

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCESS", rawPayload: rawPayload ? (rawPayload as object) : undefined },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: "PAID", status: "PAID" },
    }),
    prisma.orderStatusEvent.create({
      data: { orderId: payment.orderId, status: "PAID", note: `Payment confirmed via ${payment.provider}` },
    }),
    ...payment.order.items.map((item) =>
      prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } }),
    ),
  ]);

  return { ok: true as const, order: payment.order, alreadyProcessed: false };
}

export async function markPaymentFailed(reference: string, rawPayload?: unknown) {
  const payment = await prisma.payment.findUnique({ where: { reference } });
  if (!payment || payment.status === "SUCCESS") return;

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED", rawPayload: rawPayload ? (rawPayload as object) : undefined } }),
    prisma.order.update({ where: { id: payment.orderId }, data: { paymentStatus: "FAILED" } }),
    prisma.orderStatusEvent.create({ data: { orderId: payment.orderId, status: "PENDING_PAYMENT", note: `Payment failed via ${payment.provider}` } }),
  ]);
}
