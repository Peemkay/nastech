import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Business-logic validation failures are safe to show the customer verbatim.
// Anything else (missing BLOB_READ_WRITE_TOKEN, network errors, SDK internals)
// is our problem, not theirs — sanitized below instead of passed through.
class UploadValidationError extends Error {}

// Customer-facing proof-of-payment upload for bank transfers. Unauthenticated
// (tracking codes themselves are the access control, same trust model as the
// rest of /track/*), but every upload is tied to a real order code that must
// already be an awaiting-verification bank transfer — not a free-for-all.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const orderCode = clientPayload?.trim().toUpperCase();
        if (!orderCode) throw new UploadValidationError("Missing order code");

        const order = await prisma.order.findUnique({ where: { code: orderCode } });
        if (!order || order.paymentMethod !== "BANK_TRANSFER" || order.paymentStatus === "PAID") {
          throw new UploadValidationError("This order is not awaiting a bank transfer");
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
          addRandomSuffix: true,
          maximumSizeInBytes: 8 * 1024 * 1024,
          tokenPayload: orderCode,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const orderCode = tokenPayload;
        if (!orderCode) return;

        const order = await prisma.order.findUnique({ where: { code: orderCode } });
        if (!order) return;

        const payment = await prisma.payment.findFirst({
          where: { orderId: order.id, provider: "BANK_TRANSFER" },
          orderBy: { createdAt: "desc" },
        });
        if (!payment) return;

        await prisma.$transaction([
          prisma.payment.update({ where: { id: payment.id }, data: { proofUrl: blob.url, proofUploadedAt: new Date() } }),
          prisma.orderStatusEvent.create({
            data: { orderId: order.id, status: order.status, note: "Customer uploaded proof of payment — awaiting admin review" },
          }),
        ]);
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[bank-transfer-upload] failed:", error);
    return NextResponse.json({ error: "Upload isn't available right now. Please try again shortly." }, { status: 502 });
  }
}
