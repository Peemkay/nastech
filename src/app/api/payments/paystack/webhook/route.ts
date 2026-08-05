import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paystackVerify, paystackVerifyWebhookSignature } from "@/lib/payments/paystack";
import { markPaymentSuccess, markPaymentFailed } from "@/lib/payments/record-payment";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  const verified = paystackVerifyWebhookSignature(rawBody, signature);

  let event: { event?: string; data?: { reference?: string; status?: string } } = {};
  try {
    event = JSON.parse(rawBody);
  } catch {
    // ignore malformed body — still logged below
  }

  await prisma.webhookLog.create({
    data: { provider: "PAYSTACK", eventType: event.event ?? null, reference: event.data?.reference ?? null, payload: event as object, verified },
  });

  if (!verified) return NextResponse.json({ received: true }, { status: 200 });

  const reference = event.data?.reference;
  if (event.event === "charge.success" && reference) {
    try {
      const verifyResult = await paystackVerify(reference);
      if (verifyResult.status === "success") {
        await markPaymentSuccess(reference, event.data);
      } else {
        await markPaymentFailed(reference, event.data);
      }
    } catch {
      // verification call failed — Paystack will retry the webhook
    }
  } else if (event.event === "charge.failed" && reference) {
    await markPaymentFailed(reference, event.data);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
