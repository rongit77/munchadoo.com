import { afterEach, describe, expect, it, vi } from "vitest";
import {
  mapPlace,
  autocompleteGoogle,
  resolveLocationGoogle,
  locationGoogle,
  openingStatus,
  parseSearch,
  searchGoogle,
  statusGoogle,
  takeRequest,
} from "./google-places";
const query = {
  center: { lat: 32.074, lng: 34.775 },
  radius: 3,
  cuisine: "all" as const,
  openOnly: true,
  locale: "he" as const,
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  delete (globalThis as typeof globalThis & { placesBudget?: unknown })
    .placesBudget;
});
describe("Google adapter", () => {
  it("rejects malformed searches including inherited object properties", () => {
    for (const value of [
      null,
      {},
      { ...query, cuisine: "constructor" },
      { ...query, radius: NaN },
      { ...query, center: { lat: 91, lng: 0 } },
      { ...query, openOnly: "yes" },
    ])
      expect(() => parseSearch(value)).toThrow();
  });
  it("does not infer missing opening hours or reopen a closed business", () => {
    expect(openingStatus({})).toBe("unknown");
    expect(openingStatus({ currentOpeningHours: { openNow: false } })).toBe(
      "closed",
    );
    expect(
      openingStatus({
        businessStatus: "CLOSED_TEMPORARILY",
        currentOpeningHours: { openNow: true },
      }),
    ).toBe("closed");
    expect(
      openingStatus({
        businessStatus: "OPERATIONAL",
        currentOpeningHours: { openNow: true },
      }),
    ).toBe("open");
  });
  it("does not invent a price or cuisine and preserves attribution", () => {
    const p = mapPlace({
      id: "example",
      displayName: { text: "Example" },
      location: { latitude: 32, longitude: 34 },
      attributions: [{ provider: "Example source" }],
    });
    expect(p).toMatchObject({
      price: null,
      cuisine: "all",
      status: "unknown",
      source: "google",
      attributions: [{ provider: "Example source" }],
    });
    expect(mapPlace({ id: "missing-location" })).toBeNull();
  });
  it("uses server header credentials, minimal fields and no storage, then filters distance and status", async () => {
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "test-key");
    const place = {
      id: "near",
      displayName: { text: "Example" },
      location: { latitude: 32.074, longitude: 34.775 },
      currentOpeningHours: { openNow: true },
    };
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({
        places: [
          place,
          { ...place, id: "unknown", currentOpeningHours: {} },
          { ...place, id: "far", location: { latitude: 0, longitude: 0 } },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    expect((await searchGoogle(query)).map((p) => p.id)).toEqual(["near"]);
    const [url, options] = fetcher.mock.calls[0];
    expect(url).not.toContain("test-key");
    expect(options.headers["X-Goog-Api-Key"]).toBe("test-key");
    expect(options.cache).toBe("no-store");
    expect(options.headers["X-Goog-FieldMask"]).not.toContain("*");
    expect(JSON.parse(options.body).maxResultCount).toBe(20);
  });
  it("revalidates status and sanitizes upstream access errors", async () => {
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("secret upstream diagnostic", { status: 403 }),
        ),
    );
    await expect(statusGoogle("valid_id")).rejects.toThrow("provider-access");
    await expect(statusGoogle("../bad")).rejects.toThrow("invalid-id");
  });
  it("reports network failures and missing keys", async () => {
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "");
    await expect(searchGoogle(query)).rejects.toThrow("not-configured");
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await expect(searchGoogle(query)).rejects.toThrow("provider-unavailable");
  });
  it("enforces both minute and process limits", () => {
    for (let minute = 0; minute < 5; minute++) {
      for (let n = 0; n < 20; n++) takeRequest(minute * 60000);
      expect(() => takeRequest(minute * 60000)).toThrow("rate-limited");
    }
    expect(() => takeRequest(300000)).toThrow("rate-limited");
  });
});

it("validates location queries before contacting the provider", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  for (const value of [null, " ", "x".repeat(201)])
    await expect(locationGoogle(value, "he")).rejects.toThrow(
      "invalid-location",
    );
  await expect(locationGoogle("London", "xx")).rejects.toThrow(
    "invalid-location",
  );
  expect(fetcher).not.toHaveBeenCalled();
});
it("returns selectable global locations and drops missing or invalid coordinates", async () => {
  vi.stubEnv("GOOGLE_PLACES_API_KEY", "test-key");
  const fetcher = vi.fn().mockResolvedValue(
    Response.json({
      places: [
        {
          id: "london",
          displayName: { text: "London" },
          formattedAddress: "UK",
          location: { latitude: 51.5, longitude: -0.12 },
        },
        { id: "missing" },
        { id: "bad", location: { latitude: 100, longitude: 0 } },
      ],
    }),
  );
  vi.stubGlobal("fetch", fetcher);
  expect(await locationGoogle(" London ", "en")).toEqual([
    { id: "london", label: "London · UK", point: { lat: 51.5, lng: -0.12 } },
  ]);
  expect(fetcher.mock.calls[0][0]).toContain("places:searchText");
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({
    textQuery: "London",
    languageCode: "en",
    pageSize: 5,
  });
});

it("autocomplete validates input and shares its session with the selected place", async () => {
  vi.stubEnv("GOOGLE_PLACES_API_KEY", "test-key");
  const token = "a1234567-1234-1234-1234-123456789012";
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      Response.json({
        suggestions: [
          {
            placePrediction: {
              placeId: "example",
              text: { text: "Example address" },
            },
          },
        ],
      }),
    )
    .mockResolvedValueOnce(
      Response.json({ location: { latitude: 32, longitude: 34 } }),
    );
  vi.stubGlobal("fetch", fetcher);
  await expect(autocompleteGoogle("ab", "en", token)).rejects.toThrow(
    "invalid-location",
  );
  expect(fetcher).not.toHaveBeenCalled();
  expect(await autocompleteGoogle("example", "en", token)).toEqual([
    { id: "example", label: "Example address" },
  ]);
  expect(JSON.parse(fetcher.mock.calls[0][1].body).sessionToken).toBe(token);
  expect(await resolveLocationGoogle("example", "en", token)).toEqual({
    lat: 32,
    lng: 34,
  });
  expect(fetcher.mock.calls[1][0]).toContain(`sessionToken=${token}`);
  expect(fetcher.mock.calls[1][1].headers["X-Goog-FieldMask"]).toBe("location");
});
