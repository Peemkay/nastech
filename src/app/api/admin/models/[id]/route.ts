import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  releaseYear: z.number().int().optional().nullable(),
  baseValueKobo: z.number().int().min(0),
  storageOptions: z.array(z.string()).default([]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid model" }, { status: 400 });
  await prisma.deviceModel.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await params;
  try {
    await prisma.deviceModel.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Cannot delete a model that still has products or sell requests" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
