import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { normalizePhone } from "@/lib/phone";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "SUPERADMIN"]),
});

// Admin-created accounts are a trusted path — no OTP needed (a superadmin is vouching for them).
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  if (session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Only a super admin can create admin accounts" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the details and try again" }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const phone = parsed.data.phone ? normalizePhone(parsed.data.phone) : null;
  if (parsed.data.phone && !phone) return NextResponse.json({ error: "Enter a valid Nigerian phone number" }, { status: 400 });

  const [existingEmail, existingPhone] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    phone ? prisma.user.findUnique({ where: { phone } }) : Promise.resolve(null),
  ]);
  if (existingEmail) return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
  if (existingPhone) return NextResponse.json({ error: "An account with this phone number already exists" }, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: { name: parsed.data.name, email, phone, phoneVerified: !!phone, passwordHash, role: parsed.data.role },
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}
