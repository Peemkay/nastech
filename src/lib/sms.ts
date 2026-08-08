import { getSettings } from "@/lib/settings";

/**
 * SMS sending via Termii (Nigeria-focused SMS/OTP provider). The API key and
 * sender ID can be set either in admin Settings (DB, editable without a
 * redeploy) or via the TERMII_API_KEY/TERMII_SENDER_ID env vars — the DB
 * value wins if both are set. Admin can also flip "Enable SMS" off in
 * Settings to force test mode even in production (see reason below).
 *
 * When sending isn't actually attempted, the caller is told it was
 * "simulated" plus why:
 *  - "disabled"     — admin explicitly turned SMS off (deliberate test mode)
 *  - "unconfigured" — no API key available anywhere (misconfiguration)
 * Callers (registration flow) use this to decide whether it's safe to show
 * the code on-screen (yes for "disabled" — that's the point of the toggle)
 * or must stay hidden from the customer (misconfiguration in production).
 */
export async function sendSms(
  to: string,
  message: string,
): Promise<{ sent: boolean; simulated: boolean; reason?: "disabled" | "unconfigured" }> {
  const settings = await getSettings();
  const apiKey = settings.termiiApiKey || process.env.TERMII_API_KEY;
  const senderId = settings.termiiSenderId || process.env.TERMII_SENDER_ID || "N-Alert";

  if (!settings.smsEnabled) {
    console.log(`[SMS disabled by admin — would send to ${to}]: ${message}`);
    return { sent: false, simulated: true, reason: "disabled" };
  }

  if (!apiKey) {
    console.log(`[SMS not configured — would send to ${to}]: ${message}`);
    return { sent: false, simulated: true, reason: "unconfigured" };
  }

  const res = await fetch("https://api.ng.termii.com/api/sms/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, from: senderId, sms: message, type: "plain", channel: "generic", api_key: apiKey }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SMS send failed (${res.status}): ${text.slice(0, 200)}`);
  }

  return { sent: true, simulated: false };
}
