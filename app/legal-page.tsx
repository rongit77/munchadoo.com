"use client";
import { useLanguage } from "./use-language";
import Link from "next/link";
import { legal, operator, updated, type LegalKind } from "@/lib/legal";
export function LegalPage({ kind }: { kind: LegalKind }) {
  const { locale } = useLanguage();
  const content = legal[locale][kind];
  const he = locale === "he";
  return (
    <>
      <header className="legal-header shell">
        <Link href="/" lang="en">
          Munchadoo
        </Link>
        <Link href="/profile">{he ? "פרופיל ושפה" : "Profile & language"}</Link>
      </header>
      <main id="main-content" tabIndex={-1} className="legal-page shell">
        <h1>{content.title}</h1>
        <p className="legal-intro">{content.intro}</p>
        <p>
          {he ? "עודכן לאחרונה:" : "Last updated:"}{" "}
          <time dateTime={updated}>{updated}</time>
        </p>
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}
        <section>
          <h2>{he ? "יצירת קשר" : "Contact"}</h2>
          <p>
            {operator.name} ·{" "}
            <a href={`mailto:${operator.email}`}>{operator.email}</a>
          </p>
        </section>
        {(kind === "privacy" || kind === "terms") && (
          <section>
            <h2>
              {he ? "מידע ותנאים של Google" : "Google policies and terms"}
            </h2>
            <ul>
              <li>
                <a href="https://policies.google.com/privacy">
                  {he ? "מדיניות הפרטיות של Google" : "Google Privacy Policy"}
                </a>
              </li>
              <li>
                <a href="https://maps.google.com/help/terms_maps/">
                  {he
                    ? "תנאי Google Maps / Google Earth"
                    : "Google Maps / Google Earth Terms"}
                </a>
              </li>
            </ul>
          </section>
        )}
        <Link href="/">{he ? "חזרה ל־Munchadoo" : "Back to Munchadoo"}</Link>
      </main>
    </>
  );
}
