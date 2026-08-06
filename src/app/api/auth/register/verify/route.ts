import { NextRequest, NextResponse } from "next/server";
import { AuthError } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { hashOtp, OTP_MAX_ATTEMPTS } from "@/lib/otp";
import bcrypt from "bcryptjs";

const schema = z.object({ pendingId: z.string().min(1), code: z.string().min(4).max(8) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const pending = await prisma.pendingRegistration.findUnique({ where: { id: parsed.data.pendingId } });
  if (!pending) return NextResponse.json({ error: "Registration session not found. Please start again." }, { status: 400 });

  if (pending.otpExpiresAt < new Date()) {
    await prisma.pendingRegistration.delete({ where: { id: pending.id } });
    return NextResponse.json({ error: "That code has expired. Please start again." }, { status: 400 });
  }

  if (pending.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.pendingRegistration.delete({ where: { id: pending.id } });
    return NextResponse.json({ error: "Too many incorrect attempts. Please start again." }, { status: 400 });
  }

  if (hashOtp(parsed.data.code.trim()) !== pending.otpCodeHash) {
    await prisma.pendingRegistration.update({ where: { id: pending.id }, data: { attempts: { increment: 1 } } });
    return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(pending.passwordPlain, 10);
  await prisma.user.create({
    data: {
      name: pending.name,
      email: pending.email,
      phone: pending.phone,
      phoneVerified: true,
      passwordHash,
      role: "CUSTOMER",
    },
  });
  await prisma.pendingRegistration.delete({ where: { id: pending.id } });

  try {
    await signIn("credentials", { identifier: pending.email, password: pending.passwordPlain, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      // Account was created fine; sign-in hiccup just means they log in manually.
      return NextResponse.json({ ok: true, signedIn: false });
    }
    throw error;
  }

  return NextResponse.json({ ok: true, signedIn: true });
}
