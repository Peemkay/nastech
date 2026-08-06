import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { quoteDeliveryFee, DeliveryUnavailableError } from "@/lib/delivery/pricing";
import { isDefaultEnabled } from "@/lib/locations";

const schema = z.object({
  line1: z.string().min(3),
  city: z.string().min(1),
  lga: z.string().optional().default(""),
  state: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid address" }, { status: 400 });

  const region = await prisma.serviceRegion.findUnique({ where: { state: parsed.data.state } });
  const enabled = region ? region.enabled : isDefaultEnabled(parsed.data.state);
  if (!enabled) {
    return NextResponse.json({ error: "We don't deliver to this state yet" }, { status: 400 });
  }

  try {
    const quote = await quoteDeliveryFee(parsed.data);
    return NextResponse.json(quote);
  } catch (e) {
    if (e instanceof DeliveryUnavailableError) return NextResponse.json({ error: e.message }, { status: 400 });
    return NextResponse.json({ error: "Could not calculate delivery fee" }, { status: 502 });
  }
}
