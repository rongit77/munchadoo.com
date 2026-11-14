import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { LegalPage } from "./legal-page";
import { legal, type LegalKind } from "@/lib/legal";
describe("policy pages", () => {
  it("exposes a real contact link and skip destination on every page", () => {
    for (const kind of [
      "about",
      "privacy",
      "terms",
      "accessibility",
    ] as LegalKind[]) {
      const html = renderToStaticMarkup(<LegalPage kind={kind} />);
      expect(html).toContain('id="main-content"');
      expect(html).toContain("mailto:info@clickabily.com");
      expect(html).toContain("Clickabily");
      expect((html.match(/<h1/g) || []).length).toBe(1);
    }
  });
  it("provides Hebrew and English policy content and provider policy links", () => {
    for (const locale of ["he", "en"] as const)
      for (const kind of [
        "about",
        "privacy",
        "terms",
        "accessibility",
      ] as LegalKind[])
        expect(legal[locale][kind].sections.length).toBeGreaterThan(2);
    expect(renderToStaticMarkup(<LegalPage kind="privacy" />)).toContain(
      "https://policies.google.com/privacy",
    );
    expect(renderToStaticMarkup(<LegalPage kind="terms" />)).toContain(
      "https://maps.google.com/help/terms_maps/",
    );
  });
});
