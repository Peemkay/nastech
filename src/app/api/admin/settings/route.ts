import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { PAYMENT_METHODS } from "@/lib/constants";

const schema = z.object({
  siteName: z.string().min(2),
  supportPhone: z.string().min(5),
  supportEmail: z.string().email(),
  activeGateways: z.array(z.enum(PAYMENT_METHODS)).min(1),
  defaultGateway: z.enum(PAYMENT_METHODS),
  bankName: z.string().min(2),
  bankAccountNumber: z.string().min(4),
  bankAccountName: z.string().min(2),
  freeShippingThresholdKobo: z.number().int().min(0),
  depotName: z.string().min(2),
  depotAddress: z.string().min(5),
  depotLat: z.number().min(-90).max(90),
  depotLng: z.number().min(-180).max(180),
  baseFareKobo: z.number().int().min(0),
  perKmFareKobo: z.number().int().min(0),
  minFareKobo: z.number().int().min(0),
  maxDeliveryKm: z.number().int().min(1),
});

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid settings", issues: parsed.error.flatten() }, { status: 400 });

  if (!parsed.data.activeGateways.includes(parsed.data.defaultGateway)) {
    return NextResponse.json({ error: "Default gateway must be one of the active gateways" }, { status: 400 });
  }

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });

  return NextResponse.json({ ok: true });
}
