import type { Locale, Place, Search } from "./places";
async function request(body: unknown, signal?: AbortSignal) {
  const response = await fetch("/api/places", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "provider-unavailable");
  return data;
}
export type LocationMatch = {
  id: string;
  label: string;
  point?: { lat: number; lng: number };
};
export const liveProvider = {
  async autocomplete(
    query: string,
    locale: Locale,
    token: string,
    signal?: AbortSignal,
  ): Promise<LocationMatch[]> {
    return (
      await request({ action: "autocomplete", query, locale, token }, signal)
    ).locations;
  },
  async resolveLocation(
    id: string,
    locale: Locale,
    token: string,
  ): Promise<{ lat: number; lng: number }> {
    return (await request({ action: "resolve-location", id, locale, token }))
      .point;
  },
  async reverseLocation(
    point: { lat: number; lng: number },
    locale: Locale,
  ): Promise<string | null> {
    return (await request({ action: "reverse-location", point, locale }))
      .address;
  },
  async locations(query: string, locale: Locale): Promise<LocationMatch[]> {
    return (await request({ action: "locations", query, locale })).locations;
  },
  async search(
    query: Search & { locale: Locale },
    signal?: AbortSignal,
  ): Promise<Place[]> {
    return (await request(query, signal)).places;
  },
  async status(id: string): Promise<Place["status"]> {
    return (await request({ action: "status", id })).status;
  },
};
