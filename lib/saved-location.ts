import { validPoint, type Point } from "./places";
export const LOCATION_KEY = "munchadoo.device-location.v1";
export const LOCATION_TTL = 7 * 24 * 60 * 60 * 1000;
export type SavedLocation = { point: Point; accuracy: number; savedAt: number };
export function parseLocation(
  raw: string | null,
  now = Date.now(),
): SavedLocation | null {
  try {
    const v = JSON.parse(raw ?? "null");
    if (
      !v ||
      !v.point ||
      !validPoint(v.point) ||
      !Number.isFinite(v.accuracy) ||
      v.accuracy < 0 ||
      !Number.isFinite(v.savedAt) ||
      v.savedAt > now ||
      now - v.savedAt >= LOCATION_TTL
    )
      return null;
    return {
      point: { lat: v.point.lat, lng: v.point.lng },
      accuracy: v.accuracy,
      savedAt: v.savedAt,
    };
  } catch {
    return null;
  }
}
export function readLocation(): SavedLocation | null {
  try {
    const value = parseLocation(localStorage.getItem(LOCATION_KEY));
    if (!value) localStorage.removeItem(LOCATION_KEY);
    return value;
  } catch {
    return null;
  }
}
export function saveLocation(point: Point, accuracy: number): boolean {
  try {
    localStorage.setItem(
      LOCATION_KEY,
      JSON.stringify({ point, accuracy, savedAt: Date.now() }),
    );
    return true;
  } catch {
    return false;
  }
}
export function clearLocation() {
  try {
    localStorage.removeItem(LOCATION_KEY);
  } catch {}
}
