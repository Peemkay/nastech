import { sendSms } from "@/lib/sms";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Sends an OTP SMS and decides what the customer-facing API response should
 * reveal.
 *
 * - Real SMS sent → customer just gets `ok: true`, nothing extra.
 * - Admin explicitly disabled SMS in Settings ("test mode") → the code is
 *   echoed back regardless of environment. That's the entire point of the
 *   toggle: test the flow live, including in production, without spending
 *   SMS credit or needing a real phone.
 * - Anything else going wrong (missing API key, provider error) → in
 *   production the customer NEVER sees why — that's our problem, not
 *   theirs — they get a friendly "try again" message via `ok: false`, while
 *   the real error is logged server-side (visible in Vercel's function
 *   logs). Locally (npm run dev) it still echoes the code so registration
 *   stays testable without any SMS setup at all.
 */
export async function deliverOtp(phone: string, message: string): Promise<{ ok: true; devOtp?: string } | { ok: false }> {
  try {
    const result = await sendSms(phone, message);
    if (result.simulated) {
      if (result.reason === "disabled" || !isProduction) return { ok: true, devOtp: message.match(/\d{6}/)?.[0] };
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
