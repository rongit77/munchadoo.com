export const INSTALL_KEY = "munchadoo.install.v1";
export const WEEK = 7 * 24 * 60 * 60 * 1000;
export type InstallRecord = {
  variant: "plain" | "bite";
  dismissedAt: number;
  firstSeen: number;
  lastSeen: number;
  returnedAfterWeek: boolean;
  counts: Record<string, number>;
};
export function readInstallRecord(
  raw: string | null,
  now: number,
  random = Math.random,
): InstallRecord {
  try {
    const value = JSON.parse(raw ?? "null");
    if (
      value &&
      ["plain", "bite"].includes(value.variant) &&
      Number.isFinite(value.dismissedAt) &&
      Number.isFinite(value.firstSeen) &&
      Number.isFinite(value.lastSeen) &&
      typeof value.returnedAfterWeek === "boolean" &&
      value.counts &&
      typeof value.counts === "object" &&
      !Array.isArray(value.counts)
    )
      return value;
  } catch {
    /* Storage is optional. */
  }
  return {
    variant: random() < 0.5 ? "plain" : "bite",
    dismissedAt: 0,
    firstSeen: now,
    lastSeen: now,
    returnedAfterWeek: false,
    counts: {},
  };
}
export function canOffer(record: InstallRecord, now: number) {
  return record.dismissedAt === 0 || now - record.dismissedAt >= WEEK;
}
export function isIOS(
  userAgent: string,
  platform: string,
  touchPoints: number,
) {
  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (platform === "MacIntel" && touchPoints > 1)
  );
}
