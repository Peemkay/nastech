import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { computeQuoteKobo } from "@/lib/quote-engine";
import { trackingCode } from "@/lib/utils";

const bodySchema = z.object({
  categoryId: z.string().min(1),
  modelId: z.string().min(1),
  storage: z.string().optional().nullable(),
  answers: z.record(z.string(), z.string()), // questionId -> optionId
  contactName: z.string().min(2),
  contactPhone: z.string().min(7),
  contactEmail: z.string().email(),
  pickupLine1: z.string().min(3),
  pickupLine2: z.string().optional().nullable(),
  pickupCity: z.string().min(2),
  pickupState: z.string().min(2),
  pickupDate: z.string().min(4),
  pickupSlot: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const model = await prisma.deviceModel.findUnique({ where: { id: data.modelId } });
  if (!model || model.brandId === undefined) {
    return NextResponse.json({ error: "Device model not found" }, { status: 404 });
  }

  const questions = await prisma.conditionQuestion.findMany({
    where: { categoryId: data.categoryId },
    include: { options: true },
  });

  // Recompute quote server-side — never trust a client-submitted price.
  const selectedOptions = questions
    .map((q) => {
      const optionId = data.answers[q.id];
      const option = q.options.find((o) => o.id === optionId);
      return option ? { deductionBps: option.deductionBps } : null;
    })
    .filter((o): o is { deductionBps: number } => !!o);

  if (selectedOptions.length !== questions.length) {
    return NextResponse.json({ error: "Please answer all condition questions" }, { status: 400 });
  }

  const quotedKobo = computeQuoteKobo(model.baseValueKobo, selectedOptions);

  const session = await auth();
  const count = await prisma.sellRequest.count();
  const code = trackingCode("SEL", count + 1);

  const sellRequest = await prisma.sellRequest.create({
    data: {
      code,
      userId: session?.user?.id ?? null,
      categoryId: data.categoryId,
      modelId: data.modelId,
      storage: data.storage ?? null,
      answers: data.answers,
      quotedKobo,
      status: "PICKUP_SCHEDULED",
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      pickupLine1: data.pickupLine1,
      pickupLine2: data.pickupLine2 ?? null,
      pickupCity: data.pickupCity,
      pickupState: data.pickupState,
      pickupDate: new Date(data.pickupDate),
      pickupSlot: data.pickupSlot,
      statusEvents: {
        create: [
          { status: "QUOTE_GENERATED", note: "Instant quote generated" },
          { status: "PICKUP_SCHEDULED", note: `Pickup scheduled for ${data.pickupDate} (${data.pickupSlot})` },
        ],
      },
    },
  });

  return NextResponse.json({ code: sellRequest.code, quotedKobo }, { status: 201 });
}
