import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a kobo integer amount as a Naira currency string, e.g. 12_500_00 -> "₦12,500.00" */
export function formatNaira(kobo: number, opts: { withDecimals?: boolean } = {}) {
  const naira = kobo / 100;
  return naira.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: opts.withDecimals === false ? 0 : 2,
    maximumFractionDigits: opts.withDecimals === false ? 0 : 2,
  });
}

export function nairaToKobo(naira: number) {
  return Math.round(naira * 100);
}

/** Sequential, human-friendly tracking codes, e.g. NAS-SEL-000123 */
export function trackingCode(prefix: "SEL" | "ORD", n: number) {
  return `NAS-${prefix}-${String(n).padStart(6, "0")}`;
}

export function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
