import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_KEY,
  CONSENT_TTL,
  parseConsent,
  saveConsent,
  readMeasurement,
  writeMeasurement,
  measurementAllowed,
} from "./privacy";
import { INSTALL_KEY } from "./install";
function makeStore() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
    removeItem: (k: string) => {
      data.delete(k);
    },
  };
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-14T12:00:00Z"));
});
afterEach(() => vi.useRealTimers());
describe("privacy consent", () => {
  it("never writes measurement before opt-in and removes legacy data", () => {
    const s = makeStore();
    s.setItem(INSTALL_KEY, "old measurement");
    expect(readMeasurement(s)).toBeNull();
    expect(s.getItem(INSTALL_KEY)).toBeNull();
    writeMeasurement("new measurement", s);
    expect(s.getItem(INSTALL_KEY)).toBeNull();
  });
  it("rejects optional storage while preserving essential consent choice", () => {
    const s = makeStore();
    saveConsent(false, s);
    writeMeasurement("data", s);
    expect(measurementAllowed(s)).toBe(false);
    expect(s.getItem(INSTALL_KEY)).toBeNull();
    expect(parseConsent(s.getItem(CONSENT_KEY))?.measurement).toBe(false);
  });
  it("allows opt-in and erases data immediately when withdrawn", () => {
    const s = makeStore();
    saveConsent(true, s);
    writeMeasurement("approved", s);
    expect(readMeasurement(s)).toBe("approved");
    saveConsent(false, s);
    expect(s.getItem(INSTALL_KEY)).toBeNull();
    writeMeasurement("late event", s);
    expect(s.getItem(INSTALL_KEY)).toBeNull();
  });
  it("expires consent and removes measurement on next read", () => {
    const s = makeStore();
    saveConsent(true, s);
    writeMeasurement("approved", s);
    vi.advanceTimersByTime(CONSENT_TTL);
    expect(measurementAllowed(s)).toBe(false);
    expect(readMeasurement(s)).toBeNull();
    expect(s.getItem(INSTALL_KEY)).toBeNull();
  });
  it("rejects malformed, future and incompatible records", () => {
    for (const raw of [
      "broken",
      "{}",
      JSON.stringify({ version: 2, measurement: true, updatedAt: Date.now() }),
      JSON.stringify({ version: 1, measurement: "yes", updatedAt: Date.now() }),
      JSON.stringify({
        version: 1,
        measurement: true,
        updatedAt: Date.now() + 1000,
      }),
    ])
      expect(parseConsent(raw)).toBeNull();
  });
  it("keeps core flows from crashing when browser storage is blocked", () => {
    const s = {
      getItem: () => {
        throw Error("blocked");
      },
      setItem: () => {
        throw Error("blocked");
      },
      removeItem: () => {
        throw Error("blocked");
      },
    };
    expect(() => saveConsent(false, s)).not.toThrow();
    expect(() => writeMeasurement("data", s)).not.toThrow();
    expect(readMeasurement(s)).toBeNull();
  });
});
