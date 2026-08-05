import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { paystackVerify } from "@/lib/payments/paystack";
import { flutterwaveVerify } from "@/lib/payments/flutterwave";
import { markPaymentFailed, markPaymentSuccess } from "@/lib/payments/record-payment";

type SearchParams = { provider?: string; reference?: string; trxref?: string; tx_ref?: string; transaction_id?: string; status?: string };

async function orderCodeForReference(reference: string) {
  const payment = await prisma.payment.findUnique({ where: { reference }, select: { order: { select: { code: true } } } });
  return payment?.order.code ?? null;
}

export default async function CheckoutCallbackPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  if (sp.provider === "paystack") {
    const reference = sp.reference || sp.trxref;
    if (!reference) redirect("/cart");
    const code = await orderCodeForReference(reference);
    try {
      const result = await paystackVerify(reference);
      if (result.status === "success") {
        await markPaymentSuccess(reference, result);
        redirect(`/track/${code}?new=1`);
      }
      await markPaymentFailed(reference, result);
      redirect(`/track/${code}?failed=1`);
    } catch {
      redirect(code ? `/track/${code}?failed=1` : "/cart");
    }
  }

  if (sp.provider === "flutterwave") {
    const reference = sp.tx_ref;
    if (!reference) redirect("/cart");
    const code = await orderCodeForReference(reference);
    if (sp.status !== "successful" || !sp.transaction_id) {
      await markPaymentFailed(reference);
      redirect(code ? `/track/${code}?failed=1` : "/cart");
    }
    try {
      const result = await flutterwaveVerify(sp.transaction_id!);
      if (result.status === "successful") {
        await markPaymentSuccess(reference, result);
        redirect(`/track/${code}?new=1`);
      }
      await markPaymentFailed(reference, result);
      redirect(`/track/${code}?failed=1`);
    } catch {
      redirect(code ? `/track/${code}?failed=1` : "/cart");
    }
  }

  redirect("/");
}
