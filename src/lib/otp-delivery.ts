import { sendSms } from "@/lib/sms";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Sends an OTP SMS and decides what the customer-facing API response should
 * reveal. In production, a customer NEVER sees whether SMS is misconfigured
 * or a provider call failed — those are our problems, not theirs — they just
 * get a friendly "try again" message via `ok: false`. Locally (npm run dev),
 * the code is echoed back so registration stays fully testable without a
 * paid SMS account. The real error is still logged server-side either way,
 * so it's visible in Vercel's function logs for whoever's debugging it.
 */
export async function deliverOtp(phone: string, message: string): Promise<{ ok: true; devOtp?: string } | { ok: false }> {
  try {
    const result = await sendSms(phone, message);
    if (result.simulated) {
      if (!isProduction) return { ok: true, devOtp: message.match(/\d{6}/)?.[0] };
      console.error(`[otp] SMS provider not configured — could not deliver code to ${phone}`);
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    console.error(`[otp] SMS send failed for ${phone}:`, error);
    if (!isProduction) return { ok: true, devOtp: message.match(/\d{6}/)?.[0] };
    return { ok: false };
  }
}
