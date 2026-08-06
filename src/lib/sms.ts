/**
 * SMS sending via Termii (Nigeria-focused SMS/OTP provider). Requires
 * TERMII_API_KEY. Without it, the message is logged instead of sent and the
 * caller is told it was "simulated" — callers (registration flow) surface the
 * code on-screen in that case so the app stays fully testable without a paid
 * SMS account, clearly marked as dev-mode. Configure TERMII_API_KEY before
 * real launch — otherwise no one can actually receive their verification code.
 */
export async function sendSms(to: string, message: string): Promise<{ sent: boolean; simulated: boolean }> {
  const apiKey = process.env.TERMII_API_KEY;
  const senderId = process.env.TERMII_SENDER_ID || "N-Alert";

  if (!apiKey) {
    console.log(`[SMS not configured — would send to ${to}]: ${message}`);
    return { sent: false, simulated: true };
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
