const FLW_BASE = "https://api.flutterwave.com/v3";

function secretKey() {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("FLUTTERWAVE_SECRET_KEY is not set");
  return key;
}

export async function flutterwaveInitialize(params: {
  email: string;
  amountNaira: number; // Flutterwave uses the major currency unit (Naira), not kobo
  txRef: string;
  redirectUrl: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch(`${FLW_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: params.txRef,
      amount: params.amountNaira,
      currency: "NGN",
      redirect_url: params.redirectUrl,
      customer: { email: params.email, phonenumber: params.phone, name: params.name },
      customizations: { title: "NASTECH Gadgets", description: "Order payment" },
      meta: params.metadata,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.status !== "success") {
    throw new Error(data?.message || "Failed to initialize Flutterwave transaction");
  }
  return data.data as { link: string };
}

export async function flutterwaveVerify(transactionId: string) {
  const res = await fetch(`${FLW_BASE}/transactions/${encodeURIComponent(transactionId)}/verify`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || data.status !== "success") {
    throw new Error(data?.message || "Failed to verify Flutterwave transaction");
  }
  return data.data as { status: string; tx_ref: string; amount: number; currency: string; id: number };
}

/** Flutterwave signs webhooks by having you configure a secret hash and compare it to the `verif-hash` header. */
export function flutterwaveVerifyWebhookSignature(signatureHeader: string | null) {
  const expected = process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH;
  if (!expected || !signatureHeader) return false;
  return signatureHeader === expected;
}
