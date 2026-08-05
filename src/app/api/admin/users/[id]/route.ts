import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

const schema = z.object({ role: z.enum(["CUSTOMER", "ADMIN", "SUPERADMIN"]) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  if (session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Only a super admin can change user roles" }, { status: 403 });
  }

  const { id } = await params;
  if (id === session.user.id) return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  await prisma.user.update({ where: { id }, data: { role: parsed.data.role } });
  return NextResponse.json({ ok: true });
}
