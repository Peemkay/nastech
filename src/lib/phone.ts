/**
 * Normalizes a Nigerian phone number to E.164 form: +234XXXXXXXXXX.
 * Accepts local (0801...), bare 10-digit (801...), country-coded (234801...)
 * or already-E.164 (+234801...) input. Returns null if it doesn't look valid.
 */
export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/[^\d+]/g, "");

  if (d.startsWith("+234")) d = d.slice(1);
  else if (d.startsWith("234")) {
    // already country-coded
  } else if (d.startsWith("0")) d = "234" + d.slice(1);
  else if (d.length === 10) d = "234" + d;
  else return null;

  if (!/^234\d{10}$/.test(d)) return null;
  return "+" + d;
}

/** Friendly display form: +234 801 234 5678 */
export function formatPhoneDisplay(normalized: string) {
  const m = normalized.match(/^\+234(\d{3})(\d{3})(\d{4})$/);
  return m ? `+234 ${m[1]} ${m[2]} ${m[3]}` : normalized;
}
