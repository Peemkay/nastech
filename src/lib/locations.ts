import { NIGERIAN_STATES, DEFAULT_ENABLED_STATE } from "@/lib/constants";

// Live Nigeria States/LGA API (nga-states-lga.onrender.com) — free tier can
// cold-start slowly if idle, so every call here is cached for a day via
// Next.js's fetch cache. Falls back to the bundled NIGERIAN_STATES list (and
// an empty LGA list, which the UI treats as "type your area manually") if
// the API is ever unreachable, so address forms never hard-fail on it.
const LGA_API_BASE = "https://nga-states-lga.onrender.com";
const DAY = 60 * 60 * 24;

export async function fetchAllStates(): Promise<string[]> {
  try {
    const res = await fetch(`${LGA_API_BASE}/fetch`, { next: { revalidate: DAY }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`states API returned ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data;
    throw new Error("unexpected states API response shape");
  } catch {
    return [...NIGERIAN_STATES];
  }
}

export async function fetchLgasForState(state: string): Promise<string[]> {
  try {
    const res = await fetch(`${LGA_API_BASE}/?state=${encodeURIComponent(state)}`, {
      next: { revalidate: DAY },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`LGA API returned ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function isDefaultEnabled(state: string) {
  return state === DEFAULT_ENABLED_STATE;
}
