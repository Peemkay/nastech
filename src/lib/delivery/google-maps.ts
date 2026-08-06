// Google Maps Geocoding + Distance Matrix — converts a customer's address
// into a real driving distance (km) from the depot. Requires GOOGLE_MAPS_API_KEY
// (server-only secret, never exposed to the client). See lib/delivery/pricing.ts
// for the graceful flat-fee fallback used when this isn't configured.

export class DeliveryUnavailableError extends Error {}

function requireApiKey() {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new DeliveryUnavailableError("Distance-based delivery pricing is not configured");
  return key;
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  const key = requireApiKey();
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&components=country:NG&key=${key}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await res.json();

  if (data.status !== "OK" || !data.results?.[0]) {
    throw new DeliveryUnavailableError(`Could not locate that address (${data.status ?? "no response"})`);
  }
  const loc = data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}

export async function drivingDistanceKm(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): Promise<number> {
  const key = requireApiKey();
  const url =
    `https://maps.googleapis.com/maps/api/distancematrix/json` +
    `?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}` +
    `&mode=driving&units=metric&key=${key}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await res.json();
  const element = data.rows?.[0]?.elements?.[0];

  if (data.status !== "OK" || !element || element.status !== "OK") {
    throw new DeliveryUnavailableError("Could not calculate a driving route to that address");
  }
  return element.distance.value / 1000; // meters -> km
}
