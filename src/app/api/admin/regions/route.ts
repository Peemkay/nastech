import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

const schema = z.object({ state: z.string().min(1), enabled: z.boolean() });

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  await prisma.serviceRegion.upsert({
    where: { state: parsed.data.state },
    update: { enabled: parsed.data.enabled },
    create: { state: parsed.data.state, enabled: parsed.data.enabled },
  });

  return NextResponse.json({ ok: true });
}
