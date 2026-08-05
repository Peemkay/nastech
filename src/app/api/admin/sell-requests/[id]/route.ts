import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { SELL_REQUEST_STATUSES } from "@/lib/constants";

const bodySchema = z.object({
  status: z.enum(SELL_REQUEST_STATUSES),
  note: z.string().max(500).optional(),
  finalKobo: z.number().int().min(0).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const sellRequest = await prisma.sellRequest.findUnique({ where: { id } });
  if (!sellRequest) return NextResponse.json({ error: "Sell request not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.sellRequest.update({
      where: { id },
      data: { status: parsed.data.status, ...(parsed.data.finalKobo !== undefined ? { finalKobo: parsed.data.finalKobo } : {}) },
    }),
    prisma.sellRequestStatusEvent.create({ data: { sellRequestId: id, status: parsed.data.status, note: parsed.data.note || null } }),
  ]);

  return NextResponse.json({ ok: true });
}
