import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOtp, hashOtp, otpExpiryDate } from "@/lib/otp";
import { sendSms } from "@/lib/sms";
import { SITE_NAME } from "@/lib/constants";

const schema = z.object({ pendingId: z.string().min(1) });
const RESEND_COOLDOWN_MS = 60_000;

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const pending = await prisma.pendingRegistration.findUnique({ where: { id: parsed.data.pendingId } });
  if (!pending) return NextResponse.json({ error: "Registration session not found. Please start again." }, { status: 400 });

  const sinceLastSend = Date.now() - pending.lastSentAt.getTime();
  if (sinceLastSend < RESEND_COOLDOWN_MS) {
    return NextResponse.json({ error: `Please wait ${Math.ceil((RESEND_COOLDOWN_MS - sinceLastSend) / 1000)}s before requesting another code` }, { status: 429 });
  }

  const otp = generateOtp();
  await prisma.pendingRegistration.update({
    where: { id: pending.id },
    data: { otpCodeHash: hashOtp(otp), otpExpiresAt: otpExpiryDate(), attempts: 0, lastSentAt: new Date() },
  });

  let devOtp: string | undefined;
  try {
    const result = await sendSms(pending.phone, `Your ${SITE_NAME} verification code is ${otp}. It expires in 10 minutes.`);
    if (result.simulated) devOtp = otp;
  } catch {
    devOtp = otp;
  }

  return NextResponse.json({ ok: true, devOtp });
}
