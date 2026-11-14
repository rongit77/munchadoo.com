import { describe, expect, it } from "vitest";
import {
  areas,
  fixtures,
  filterPlaces,
  choosePlace,
  distanceKm,
  demoProvider,
  type Search,
} from "./places";
import { gameCards } from "./games";
const q: Search = {
  center: areas[0].point,
  radius: 3,
  cuisine: "all",
  openOnly: true,
};
describe("restaurant eligibility", () => {
  it("excludes closed and unknown statuses from open results", () =>
    expect(filterPlaces(fixtures, q).every((p) => p.status === "open")).toBe(
      true,
    ));
  it("enforces cuisine and radius together", () =>
    expect(
      filterPlaces(fixtures, { ...q, radius: 1, cuisine: "pizza" }).map(
        (p) => p.id,
      ),
    ).toEqual(["pizza"]));
  it("deduplicates provider ids", () =>
    expect(filterPlaces([...fixtures, ...fixtures], q)).toHaveLength(5));
  it("returns empty results outside the demo area", () =>
    expect(filterPlaces(fixtures, { ...q, center: areas[1].point })).toEqual(
      [],
    ));
  it("rejects invalid coordinates and radius", () => {
    for (const change of [
      { radius: NaN },
      { radius: 21 },
      { center: { lat: 91, lng: 0 } },
      { center: { lat: 0, lng: Infinity } },
    ])
      expect(() => filterPlaces(fixtures, { ...q, ...change })).toThrow(
        "invalid-search",
      );
  });
  it("includes the exact radius boundary", () => {
    const p = fixtures[4];
    const radius = distanceKm(q.center, p.point);
    expect(filterPlaces([p], { ...q, radius })).toHaveLength(1);
    expect(filterPlaces([p], { ...q, radius: radius - 0.00001 })).toHaveLength(
      0,
    );
  });
  it("shows unknown separately only when requested", () =>
    expect(
      filterPlaces(fixtures, { ...q, openOnly: false }).some(
        (p) => p.status === "unknown",
      ),
    ).toBe(true));
  it("never draws closed or unknown, even from unfiltered input", () => {
    expect(choosePlace(fixtures.filter((p) => p.status !== "open"))).toBeNull();
  });
  it("avoids the previous winner when there is an alternative", () =>
    expect(choosePlace(fixtures, "pizza", () => 0)?.id).not.toBe("pizza"));
  it("handles zero and one candidate", () => {
    expect(choosePlace([])).toBeNull();
    expect(choosePlace([fixtures[0]], "pizza")?.id).toBe("pizza");
  });
  it("maps equal random intervals to each unique candidate", () => {
    const p = fixtures.filter((p) => p.status === "open");
    expect(
      p.map(
        (_, i) => choosePlace(p, undefined, () => (i + 0.5) / p.length)?.id,
      ),
    ).toEqual(p.map((x) => x.id));
  });
  it("rechecks a known and missing place through the provider", async () => {
    expect(await demoProvider.status("pizza")).toBe("open");
    expect(await demoProvider.status("missing")).toBe("unknown");
  });
});
describe("original games", () => {
  it("has five complete rounds for both languages and every audience", () => {
    for (const locale of ["he", "en"] as const)
      for (const audience of ["family", "couple", "friends", "work"] as const)
        for (const type of ["would", "guess"] as const) {
          const cards = gameCards(type, audience, locale);
          expect(cards).toHaveLength(5);
          for (const card of cards)
            expect(
              type === "would" ? card.options.length : card.clues.length,
            ).toBe(type === "would" ? 2 : 3);
        }
  });
});
