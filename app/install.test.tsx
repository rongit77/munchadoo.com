import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { InstallCard, type useInstall } from "./install";
function controller(changes = {}): ReturnType<typeof useInstall> {
  return {
    state: {
      ready: true,
      installed: false,
      ios: false,
      available: true,
      eligible: true,
      variant: "plain",
      busy: false,
      accepted: false,
      failed: false,
      ...changes,
    },
    track: vi.fn(),
    dismiss: vi.fn(),
    install: vi.fn(),
    clearFailure: vi.fn(),
  };
}
function render(changes = {}, manual = false) {
  return renderToStaticMarkup(
    <InstallCard
      locale="he"
      placement="restaurant"
      install={controller(changes)}
      manual={manual}
    />,
  );
}
describe("contextual install card", () => {
  it("only promotes supported, eligible, noninstalled sessions", () => {
    expect(render()).toContain("הוספה למסך הבית");
    expect(render({ available: false })).toBe("");
    expect(render({ available: false, ios: true })).toContain(
      "הוספה למסך הבית",
    );
    expect(render({ eligible: false })).toBe("");
    expect(render({ installed: true }, true)).toBe("");
    expect(render({ ready: false })).toBe("");
  });
  it("keeps manual instructions available during cooldown", () => {
    expect(render({ eligible: false, available: false }, true)).toContain(
      "הוספה למסך הבית",
    );
  });
  it("does not report a completed installation after prompt acceptance", () => {
    expect(render({ accepted: true })).toContain("הבקשה אושרה בדפדפן");
    expect(render({ accepted: true })).not.toContain("הותקן");
  });
  it("uses assigned copy and prevents a second click while waiting", () => {
    expect(render({ variant: "bite" })).toContain("הביס הבא במרחק לחיצה");
    expect(render({ busy: true })).toContain("disabled");
  });
});
