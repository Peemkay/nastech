import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paystackInitialize } from "@/lib/payments/paystack";
import { getSiteUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const { orderId } = await req.json().catch(() => ({}));
  if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.paymentStatus === "PAID") return NextResponse.json({ error: "Order is already paid" }, { status: 400 });

  const reference = `${order.code}-${Date.now().toString(36).toUpperCase()}`;
  const siteUrl = getSiteUrl(req);

  try {
    const init = await paystackInitialize({
      email: order.contactEmail,
      amountKobo: order.totalKobo,
      reference,
      callbackUrl: `${siteUrl}/checkout/callback?provider=paystack`,
      metadata: { orderId: order.id, orderCode: order.code },
    });

    await prisma.$transaction([
      prisma.payment.create({
        data: { orderId: order.id, provider: "PAYSTACK", reference, amountKobo: order.totalKobo, status: "INITIATED" },
      }),
      prisma.order.update({ where: { id: order.id }, data: { paymentMethod: "PAYSTACK" } }),
    ]);

    return NextResponse.json({ authorizationUrl: init.authorization_url, reference });
  } catch (e) {
    console.error("[paystack] initialize failed:", e);
    return NextResponse.json({ error: "Card payment isn't available right now. Please try another payment method." }, { status: 502 });
  }
}
