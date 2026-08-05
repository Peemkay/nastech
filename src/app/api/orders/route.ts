import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { trackingCode } from "@/lib/utils";
import { getSettings } from "@/lib/settings";

const FLAT_SHIPPING_FEE_KOBO = 250000; // ₦2,500

const bodySchema = z.object({
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(20) })).min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(7),
  shipFullName: z.string().min(2),
  shipPhone: z.string().min(7),
  shipLine1: z.string().min(3),
  shipLine2: z.string().optional().nullable(),
  shipCity: z.string().min(2),
  shipState: z.string().min(2),
  paymentMethod: z.enum(["PAYSTACK", "FLUTTERWAVE", "BANK_TRANSFER"]),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid order", issues: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const products = await prisma.product.findMany({ where: { id: { in: data.items.map((i) => i.productId) } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of data.items) {
    const product = productMap.get(item.productId);
    if (!product || !product.isActive) return NextResponse.json({ error: "One of the items in your cart is no longer available" }, { status: 400 });
    if (product.stock < item.quantity) return NextResponse.json({ error: `Only ${product.stock} left of "${product.name}"` }, { status: 400 });
  }

  const subtotalKobo = data.items.reduce((sum, i) => sum + productMap.get(i.productId)!.priceKobo * i.quantity, 0);
  const settings = await getSettings();
  const shippingFeeKobo = subtotalKobo >= settings.freeShippingThresholdKobo ? 0 : FLAT_SHIPPING_FEE_KOBO;
  const totalKobo = subtotalKobo + shippingFeeKobo;

  const session = await auth();
  const count = await prisma.order.count();
  const code = trackingCode("ORD", count + 1);

  const order = await prisma.order.create({
    data: {
      code,
      userId: session?.user?.id ?? null,
      subtotalKobo,
      shippingFeeKobo,
      totalKobo,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      shipFullName: data.shipFullName,
      shipPhone: data.shipPhone,
      shipLine1: data.shipLine1,
      shipLine2: data.shipLine2 ?? null,
      shipCity: data.shipCity,
      shipState: data.shipState,
      paymentMethod: data.paymentMethod,
      items: {
        create: data.items.map((i) => {
          const product = productMap.get(i.productId)!;
          const images = Array.isArray(product.images) ? (product.images as string[]) : [];
          return { productId: product.id, name: product.name, image: images[0] ?? null, priceKobo: product.priceKobo, quantity: i.quantity };
        }),
      },
      statusEvents: { create: [{ status: "PENDING_PAYMENT", note: "Order placed — awaiting payment" }] },
    },
  });

  return NextResponse.json({ code: order.code, orderId: order.id, totalKobo, subtotalKobo, shippingFeeKobo }, { status: 201 });
}
