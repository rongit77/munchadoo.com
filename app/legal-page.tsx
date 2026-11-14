"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { legal, operator, updated, type LegalKind } from "@/lib/legal";
import type { Locale } from "@/lib/places";
export function LegalPage({ kind }: { kind: LegalKind }) {
  const [locale, setLocale] = useState<Locale>("he");
  const content = legal[locale][kind];
  const he = locale === "he";
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = he ? "rtl" : "ltr";
  }, [locale, he]);
  return (
    <>
      <header className="legal-header shell">
        <Link href="/" lang="en">
          Munchadoo
        </Link>
        <button
          className="secondary"
          onClick={() => setLocale(he ? "en" : "he")}
          aria-label={he ? "Switch to English" : "מעבר לעברית"}
        >
          {he ? "English" : "עברית"}
        </button>
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
