import { geocodeAddress, drivingDistanceKm, DeliveryUnavailableError } from "./google-maps";
import { getSettings } from "@/lib/settings";
import { formatStateName } from "@/lib/constants";

export { DeliveryUnavailableError };

const FALLBACK_FLAT_FEE_KOBO = 250000; // ₦2,500 — used only if the distance API is unconfigured/unreachable

export type DeliveryQuote = {
  feeKobo: number;
  distanceKm: number | null;
  method: "distance" | "flat";
  note?: string;
};

export type DeliveryAddress = { line1: string; city: string; lga: string; state: string };

function toAddressString(addr: DeliveryAddress) {
  return [addr.line1, addr.lga, addr.city, formatStateName(addr.state), "Nigeria"].filter(Boolean).join(", ");
}

/**
 * Quotes a delivery fee for an address relative to the configured depot.
 * Throws DeliveryUnavailableError only for a genuinely out-of-range address
 * (business rule — surfaced to the customer). Any other failure (missing API
 * key, geocoding hiccup, etc.) degrades gracefully to a flat fee instead of
 * blocking checkout.
 */
export async function quoteDeliveryFee(addr: DeliveryAddress): Promise<DeliveryQuote> {
  const settings = await getSettings();

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return { feeKobo: FALLBACK_FLAT_FEE_KOBO, distanceKm: null, method: "flat", note: "Flat-rate delivery (distance pricing not yet configured)" };
  }

  let distanceKm: number;
  try {
    const destination = await geocodeAddress(toAddressString(addr));
    distanceKm = await drivingDistanceKm({ lat: settings.depotLat, lng: settings.depotLng }, destination);
  } catch {
    return { feeKobo: FALLBACK_FLAT_FEE_KOBO, distanceKm: null, method: "flat", note: "Could not pinpoint exact distance — flat rate applied" };
  }

  if (distanceKm > settings.maxDeliveryKm) {
    throw new DeliveryUnavailableError(
      `That address is ~${Math.round(distanceKm)}km from our hub — outside our ${settings.maxDeliveryKm}km delivery range. Please contact support to arrange delivery.`,
    );
  }

  const computed = settings.baseFareKobo + Math.round(distanceKm * settings.perKmFareKobo);
  const feeKobo = Math.max(computed, settings.minFareKobo);
  return { feeKobo, distanceKm, method: "distance" };
}
