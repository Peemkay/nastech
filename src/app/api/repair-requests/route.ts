import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { trackingCode } from "@/lib/utils";
import { isDefaultEnabled } from "@/lib/locations";
import { REPAIR_SERVICE_TYPES } from "@/lib/constants";
import { saveDefaultAddress } from "@/lib/account-prefill";

const bodySchema = z
  .object({
    categoryId: z.string().min(1),
    brandId: z.string().optional().nullable(),
    deviceLabel: z.string().min(2),
    problemDescription: z.string().optional().default(""),
    issueIds: z.array(z.string().min(1)).min(1),
    serviceType: z.enum(REPAIR_SERVICE_TYPES),
    contactName: z.string().min(2),
    contactPhone: z.string().min(7),
    contactEmail: z.string().email(),
    pickupLine1: z.string().optional().nullable(),
    pickupLine2: z.string().optional().nullable(),
    pickupCity: z.string().optional().nullable(),
    pickupLga: z.string().optional().nullable(),
    pickupState: z.string().optional().nullable(),
    pickupDate: z.string().optional().nullable(),
    pickupSlot: z.string().optional().nullable(),
  })
  .refine((d) => d.serviceType !== "PICKUP" || (d.pickupLine1 && d.pickupCity && d.pickupState && d.pickupDate && d.pickupSlot), {
    message: "Pickup address and schedule are required for pickup service",
    path: ["pickupLine1"],
  });

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Please verify your phone number to continue" }, { status: 401 });

  if (data.serviceType === "PICKUP") {
    const region = await prisma.serviceRegion.findUnique({ where: { state: data.pickupState! } });
    const regionEnabled = region ? region.enabled : isDefaultEnabled(data.pickupState!);
    if (!regionEnabled) return NextResponse.json({ error: "We don't offer pickup in this state yet" }, { status: 400 });
  }

  const issues = await prisma.repairIssue.findMany({ where: { id: { in: data.issueIds }, categoryId: data.categoryId, isActive: true } });
  if (issues.length !== data.issueIds.length) {
    return NextResponse.json({ error: "One or more selected repair issues are invalid" }, { status: 400 });
  }

  const estimatedKobo = issues.reduce((sum, i) => sum + i.basePriceKobo, 0);

  const count = await prisma.repairRequest.count();
  const code = trackingCode("REP", count + 1);

  const repairRequest = await prisma.repairRequest.create({
    data: {
      code,
      userId: session?.user?.id ?? null,
      categoryId: data.categoryId,
      brandId: data.brandId || null,
      deviceLabel: data.deviceLabel,
      problemDescription: data.problemDescription ?? "",
      estimatedKobo,
      serviceType: data.serviceType,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      pickupLine1: data.serviceType === "PICKUP" ? data.pickupLine1 : null,
      pickupLine2: data.serviceType === "PICKUP" ? data.pickupLine2 : null,
      pickupCity: data.serviceType === "PICKUP" ? data.pickupCity : null,
      pickupLga: data.serviceType === "PICKUP" ? data.pickupLga : null,
      pickupState: data.serviceType === "PICKUP" ? data.pickupState : null,
      pickupDate: data.serviceType === "PICKUP" && data.pickupDate ? new Date(data.pickupDate) : null,
      pickupSlot: data.serviceType === "PICKUP" ? data.pickupSlot : null,
      issues: { create: issues.map((i) => ({ repairIssueId: i.id, name: i.name, priceKobo: i.basePriceKobo })) },
      statusEvents: { create: [{ status: "REQUESTED", note: "Repair request received" }] },
    },
  });

  if (data.serviceType === "PICKUP") {
    await saveDefaultAddress(session.user.id, {
      fullName: data.contactName,
      phone: data.contactPhone,
      line1: data.pickupLine1!,
      line2: data.pickupLine2,
      city: data.pickupCity!,
      lga: data.pickupLga,
      state: data.pickupState!,
    }).catch((e) => console.error("[repair-requests] could not save default address:", e));
  }

  return NextResponse.json({ code: repairRequest.code, estimatedKobo }, { status: 201 });
}
