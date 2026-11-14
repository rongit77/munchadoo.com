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
export const liveProvider = {
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
