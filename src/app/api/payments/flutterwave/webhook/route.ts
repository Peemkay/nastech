import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { flutterwaveVerify, flutterwaveVerifyWebhookSignature } from "@/lib/payments/flutterwave";
import { markPaymentSuccess, markPaymentFailed } from "@/lib/payments/record-payment";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("verif-hash");
  const verified = flutterwaveVerifyWebhookSignature(signature);

  let event: { event?: string; data?: { id?: number; tx_ref?: string; status?: string } } = {};
  try {
    event = JSON.parse(rawBody);
  } catch {
    // ignore malformed body — still logged below
  }

  await prisma.webhookLog.create({
    data: { provider: "FLUTTERWAVE", eventType: event.event ?? null, reference: event.data?.tx_ref ?? null, payload: event as object, verified },
  });

  if (!verified) return NextResponse.json({ received: true }, { status: 200 });

  const txRef = event.data?.tx_ref;
  const txId = event.data?.id;
  if (txRef && txId && event.data?.status === "successful") {
    try {
      const verifyResult = await flutterwaveVerify(String(txId));
      if (verifyResult.status === "successful") {
        await markPaymentSuccess(txRef, event.data);
      } else {
        await markPaymentFailed(txRef, event.data);
      }
    } catch {
      // verification call failed — Flutterwave will retry the webhook
    }
  } else if (txRef && event.data?.status && event.data.status !== "successful") {
    await markPaymentFailed(txRef, event.data);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
