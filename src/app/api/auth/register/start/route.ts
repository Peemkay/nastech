import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { generateOtp, hashOtp, otpExpiryDate } from "@/lib/otp";
import { sendSms } from "@/lib/sms";
import { SITE_NAME } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your details and try again" }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return NextResponse.json({ error: "Enter a valid Nigerian phone number" }, { status: 400 });

  const [existingEmail, existingPhone] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { phone } }),
  ]);
  if (existingEmail) return NextResponse.json({ error: "An account with this email already exists. Try logging in." }, { status: 400 });
  if (existingPhone) return NextResponse.json({ error: "An account with this phone number already exists. Try logging in." }, { status: 400 });

  // Replace any prior pending attempt for this phone number.
  await prisma.pendingRegistration.deleteMany({ where: { phone } });

  const otp = generateOtp();
  const pending = await prisma.pendingRegistration.create({
    data: {
      name: parsed.data.name,
      email,
      phone,
      passwordPlain: parsed.data.password,
      otpCodeHash: hashOtp(otp),
      otpExpiresAt: otpExpiryDate(),
    },
  });

  let devOtp: string | undefined;
  try {
    const result = await sendSms(phone, `Your ${SITE_NAME} verification code is ${otp}. It expires in 10 minutes.`);
    if (result.simulated) devOtp = otp;
  } catch {
    // SMS provider error — still let them proceed with the on-screen dev code so the flow isn't dead-ended.
    devOtp = otp;
  }

  return NextResponse.json({ pendingId: pending.id, phone, devOtp });
}
