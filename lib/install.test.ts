import { describe, expect, it } from "vitest";
import { canOffer, isIOS, readInstallRecord, WEEK } from "./install";
import manifest from "../app/manifest";
describe("install promotion policy", () => {
  it("waits a full week after dismissal, including clock rollback", () => {
    const r = readInstallRecord(null, 1000, () => 0);
    expect(canOffer(r, 1000)).toBe(true);
    r.dismissedAt = 1000;
    expect(canOffer(r, 999)).toBe(false);
    expect(canOffer(r, 1000 + WEEK - 1)).toBe(false);
    expect(canOffer(r, 1000 + WEEK)).toBe(true);
  });
  it("keeps experiment assignment and dismissal across visits", () => {
    const r = readInstallRecord(null, 1000, () => 0.9);
    r.dismissedAt = 2000;
    r.counts.prompt_accepted = 1;
    expect(readInstallRecord(JSON.stringify(r), 3000, () => 0)).toEqual(r);
    expect(r.variant).toBe("bite");
    expect(r.counts.installed_event).toBeUndefined();
  });
  it("recovers safely from corrupt or old local storage", () => {
    for (const raw of [
      "broken",
      "null",
      "{}",
      '{"variant":"invalid"}',
      '{"variant":"bite","dismissedAt":"oops"}',
    ]) {
      expect(readInstallRecord(raw, 1000, () => 0)).toMatchObject({
        variant: "plain",
        dismissedAt: 0,
        firstSeen: 1000,
      });
    }
  });
  it("recognizes iPad desktop mode but not a regular Mac or Android", () => {
    expect(isIOS("iPhone", "iPhone", 5)).toBe(true);
    expect(isIOS("Macintosh", "MacIntel", 5)).toBe(true);
    expect(isIOS("Macintosh", "MacIntel", 0)).toBe(false);
    expect(isIOS("Android", "Linux", 5)).toBe(false);
  });
  it("uses a stable scoped identity and supports regular and masked icons", () => {
    const m = manifest();
    expect(m.id).toBe("/");
    expect(m.scope).toBe("/");
    expect(m.display).toBe("standalone");
    expect(m.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sizes: "192x192", purpose: "any" }),
        expect.objectContaining({ sizes: "512x512", purpose: "maskable" }),
      ]),
    );
  });
});
