import {
  filterPlaces,
  validPoint,
  type Cuisine,
  type Place,
  type Search,
  type Locale,
} from "./places";
export class PlacesError extends Error {
  constructor(
    public code: string,
    public status: number,
  ) {
    super(code);
  }
}
const types: Record<Cuisine, string[]> = {
  all: ["restaurant", "cafe"],
  pizza: ["pizza_restaurant"],
  burger: ["hamburger_restaurant"],
  asian: [
    "asian_restaurant",
    "chinese_restaurant",
    "japanese_restaurant",
    "thai_restaurant",
    "vietnamese_restaurant",
    "korean_restaurant",
  ],
  mediterranean: ["mediterranean_restaurant", "middle_eastern_restaurant"],
  cafe: ["cafe"],
};
export function parseSearch(value: unknown): Search & { locale: Locale } {
  const q = value as Partial<Search & { locale: Locale }> | null;
  if (
    !q ||
    !q.center ||
    !validPoint(q.center) ||
    typeof q.radius !== "number" ||
    q.radius < 1 ||
    q.radius > 20 ||
    !Number.isFinite(q.radius) ||
    typeof q.cuisine !== "string" ||
    !Object.hasOwn(types, q.cuisine) ||
    typeof q.openOnly !== "boolean" ||
    !["he", "en"].includes(q.locale ?? "")
  )
    throw new PlacesError("invalid-search", 400);
  return q as Search & { locale: Locale };
}
export type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  types?: string[];
  businessStatus?: string;
  currentOpeningHours?: { openNow?: boolean };
  attributions?: { provider?: string; providerUri?: string }[];
};
export function openingStatus(p: GooglePlace): Place["status"] {
  if (p.businessStatus && p.businessStatus !== "OPERATIONAL") return "closed";
  return p.currentOpeningHours?.openNow === true
    ? "open"
    : p.currentOpeningHours?.openNow === false
      ? "closed"
      : "unknown";
}
export function mapPlace(p: GooglePlace): Place | null {
  if (!p.id || !p.displayName?.text || !p.location) return null;
  const cuisine =
    (Object.keys(types) as Cuisine[]).find(
      (c) => c !== "all" && types[c].some((t) => p.types?.includes(t)),
    ) ?? "all";
  const food = {
    pizza: "pizza",
    burger: "burger",
    asian: "noodle",
    mediterranean: "salad",
    cafe: "coffee",
    all: "salad",
  }[cuisine];
  return {
    id: p.id,
    name: { he: p.displayName.text, en: p.displayName.text },
    street: { he: p.formattedAddress ?? "", en: p.formattedAddress ?? "" },
    point: { lat: p.location.latitude, lng: p.location.longitude },
    status: openingStatus(p),
    cuisine,
    food,
    color: "peach",
    price: null,
    source: "google",
    attributions: p.attributions ?? [],
  };
}
// Local single-process pilot guard, not a distributed billing cap. Restart resets it.
const shared = globalThis as typeof globalThis & {
  placesBudget?: { start: number; minute: number; total: number };
};
export function takeRequest(now = Date.now()) {
  const b = (shared.placesBudget ??= { start: now, minute: 0, total: 0 });
  if (now - b.start >= 60000) {
    b.start = now;
    b.minute = 0;
  }
  if (b.minute >= 20 || b.total >= 100)
    throw new PlacesError("rate-limited", 429);
  b.minute++;
  b.total++;
}
async function google(path: string, fields: string, body?: unknown) {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) throw new PlacesError("not-configured", 503);
  takeRequest();
  let response: Response;
  try {
    response = await fetch(`https://places.googleapis.com/v1/${path}`, {
      method: body ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": fields,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new PlacesError("provider-unavailable", 502);
  }
  if (!response.ok)
    throw new PlacesError(
      response.status === 429
        ? "rate-limited"
        : response.status === 403 || response.status === 401
          ? "provider-access"
          : "provider-unavailable",
      response.status === 429 ? 429 : 502,
    );
  return response.json();
}
export async function searchGoogle(q: Search & { locale: Locale }) {
  const data = await google(
    "places:searchNearby",
    "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.businessStatus,places.currentOpeningHours,places.attributions",
    {
      includedTypes: types[q.cuisine],
      maxResultCount: 20,
      rankPreference: "DISTANCE",
      languageCode: q.locale,
      locationRestriction: {
        circle: {
          center: { latitude: q.center.lat, longitude: q.center.lng },
          radius: q.radius * 1000,
        },
      },
    },
  );
  const places = ((data.places ?? []) as GooglePlace[])
    .map(mapPlace)
    .filter((p): p is Place => p !== null);
  // Google applies cuisine types; local distance/status checks protect the boundary.
  return filterPlaces(places, { ...q, cuisine: "all" });
}
export async function statusGoogle(id: string) {
  if (!/^[A-Za-z0-9_-]{1,256}$/.test(id))
    throw new PlacesError("invalid-id", 400);
  return openingStatus(
    await google(
      `places/${encodeURIComponent(id)}`,
      "businessStatus,currentOpeningHours",
    ),
  );
}
