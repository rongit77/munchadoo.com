import { expect, it } from "vitest";
import { parseLocation, LOCATION_TTL } from "./saved-location";
it("restores only valid unexpired device coordinates and excludes provider text", () => {
  const now = Date.now();
  const v = {
    point: { lat: 32, lng: 34 },
    accuracy: 25,
    savedAt: now,
    address: "must not persist",
  };
  expect(parseLocation(JSON.stringify(v), now)).toEqual({
    point: v.point,
    accuracy: 25,
    savedAt: now,
  });
  expect(parseLocation(JSON.stringify(v), now + LOCATION_TTL)).toBeNull();
  expect(parseLocation(JSON.stringify(v), now - 1)).toBeNull();
  expect(
    parseLocation(JSON.stringify({ ...v, point: { lat: 99, lng: 0 } }), now),
  ).toBeNull();
  expect(parseLocation("broken")).toBeNull();
});
