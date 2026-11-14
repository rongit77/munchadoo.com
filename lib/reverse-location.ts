import { PlacesError, takeRequest } from "./google-places";
import { validPoint, type Point } from "./places";

export async function reverseLocation(
  point: Point,
  locale: string,
): Promise<string | null> {
  if (!point || !validPoint(point) || !["he", "en"].includes(locale))
    throw new PlacesError("invalid-location", 400);
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) return null;
  takeRequest();
  // Server-only request. Never log this URL, which includes coordinates and a credential.
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.search = new URLSearchParams({
    latlng: `${point.lat},${point.lng}`,
    language: locale,
    key,
  }).toString();
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status !== "OK") return null;
    const address = data.results?.[0]?.formatted_address;
    return typeof address === "string" ? address : null;
  } catch {
    return null;
  }
}
