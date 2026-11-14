import { INSTALL_KEY, WEEK } from "./install";
export const CONSENT_KEY = "munchadoo.consent.v1";
export const CONSENT_EVENT = "munchadoo:consent";
export const DISMISS_KEY = "munchadoo.install-dismissed.v1";
export const CONSENT_TTL = 180 * 24 * 60 * 60 * 1000;
export type Consent = { version: 1; measurement: boolean; updatedAt: number };
type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
let memory: Consent | null = null;
function storage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}
export function parseConsent(
  raw: string | null,
  now = Date.now(),
): Consent | null {
  try {
    const c = JSON.parse(raw ?? "null");
    return c?.version === 1 &&
      typeof c.measurement === "boolean" &&
      Number.isFinite(c.updatedAt) &&
      c.updatedAt <= now &&
      now - c.updatedAt < CONSENT_TTL
      ? c
      : null;
  } catch {
    return null;
  }
}
export function getConsent(store = storage()): Consent | null {
  try {
    return (
      parseConsent(store?.getItem(CONSENT_KEY) ?? null) ??
      (!store && memory ? parseConsent(JSON.stringify(memory)) : null)
    );
  } catch {
    return memory ? parseConsent(JSON.stringify(memory)) : null;
  }
}
export function measurementAllowed(store = storage()) {
  return getConsent(store)?.measurement === true;
}
export function removeMeasurement(store = storage()) {
  try {
    store?.removeItem(INSTALL_KEY);
  } catch {
    /* Storage optional. */
  }
}
export function saveConsent(
  measurement: boolean,
  store = storage(),
  now = Date.now(),
) {
  const value: Consent = { version: 1, measurement, updatedAt: now };
  memory = value;
  try {
    store?.setItem(CONSENT_KEY, JSON.stringify(value));
  } catch {
    /* In-memory choice still works. */
  }
  if (!measurement) removeMeasurement(store);
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event(CONSENT_EVENT));
  return value;
}
export function readMeasurement(store = storage()) {
  if (!measurementAllowed(store)) {
    removeMeasurement(store);
    return null;
  }
  try {
    return store?.getItem(INSTALL_KEY) ?? null;
  } catch {
    return null;
  }
}
export function writeMeasurement(value: string, store = storage()) {
  if (!measurementAllowed(store)) {
    removeMeasurement(store);
    return;
  }
  try {
    store?.setItem(INSTALL_KEY, value);
  } catch {
    /* Storage optional. */
  }
}
export function readDismissal() {
  try {
    const n = Number(storage()?.getItem(DISMISS_KEY));
    if (!Number.isFinite(n) || n <= 0 || Date.now() - n >= WEEK) {
      storage()?.removeItem(DISMISS_KEY);
      return 0;
    }
    return n;
  } catch {
    return 0;
  }
}
export function saveDismissal(now = Date.now()) {
  try {
    storage()?.setItem(DISMISS_KEY, String(now));
  } catch {
    /* Storage optional. */
  }
}
