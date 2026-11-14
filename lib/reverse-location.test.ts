import { afterEach, expect, it, vi } from "vitest";
import { reverseLocation } from "./reverse-location";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it("rejects invalid coordinates before requesting an address", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  await expect(reverseLocation({ lat: 91, lng: 0 }, "he")).rejects.toThrow(
    "invalid-location",
  );
  expect(fetcher).not.toHaveBeenCalled();
});
it("returns a provider address, with no persistent fetch cache", async () => {
  vi.stubEnv("GOOGLE_PLACES_API_KEY", "test-key");
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      Response.json({
        status: "OK",
        results: [{ formatted_address: "Example street" }],
      }),
    );
  vi.stubGlobal("fetch", fetcher);
  expect(await reverseLocation({ lat: 32, lng: 34 }, "en")).toBe(
    "Example street",
  );
  expect(fetcher.mock.calls[0][1].cache).toBe("no-store");
});
it("leaves the device location usable when address lookup is denied or empty", async () => {
  vi.stubEnv("GOOGLE_PLACES_API_KEY", "test-key");
  for (const status of ["REQUEST_DENIED", "ZERO_RESULTS"]) {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ status })),
    );
    expect(await reverseLocation({ lat: 32, lng: 34 }, "he")).toBeNull();
  }
});
