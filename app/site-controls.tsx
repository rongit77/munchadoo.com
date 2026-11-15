"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CONSENT_EVENT,
  getConsent,
  removeMeasurement,
  saveConsent,
} from "@/lib/privacy";
import type { Locale } from "@/lib/places";
export function SiteControls() {
  const [locale, setLocale] = useState<Locale>("he");
  const [banner, setBanner] = useState(false);
  const [measurement, setMeasurement] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [large, setLarge] = useState(false);
  const [contrast, setContrast] = useState(false);
  const bannerRef = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const he = locale === "he";
  useEffect(() => {
    const update = () =>
      setLocale(document.documentElement.lang === "en" ? "en" : "he");
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
    const refresh = () => {
      const c = getConsent();
      setMeasurement(c?.measurement ?? false);
      setBanner(!c);
      if (!c?.measurement) removeMeasurement();
    };
    const timer = setTimeout(() => {
      update();
      refresh();
    }, 0);
    window.addEventListener("storage", refresh);
    window.addEventListener(CONSENT_EVENT, refresh);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("storage", refresh);
      window.removeEventListener(CONSENT_EVENT, refresh);
    };
  }, []);
  useEffect(() => {
    const el = bannerRef.current;
    if (!el) {
      document.body.style.paddingBottom = "";
      return;
    }
    const sync = () => {
      document.body.style.paddingBottom = `${el.getBoundingClientRect().height + 20}px`;
    };
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    sync();
    return () => {
      observer.disconnect();
      document.body.style.paddingBottom = "";
    };
  }, [banner]);
  function choose(value: boolean) {
    saveConsent(value);
    setBanner(false);
    setSaved(true);
    dialog.current?.close();
  }
  function openSettings() {
    opener.current = document.activeElement as HTMLElement;
    setMeasurement(getConsent()?.measurement ?? false);
    dialog.current?.showModal();
  }
  const links = he
    ? [
        ["/about", "עלינו"],
        ["/privacy", "פרטיות"],
        ["/terms", "תנאי שימוש"],
        ["/accessibility", "הצהרת נגישות"],
      ]
    : [
        ["/about", "About"],
        ["/privacy", "Privacy"],
        ["/terms", "Terms of use"],
        ["/accessibility", "Accessibility"],
      ];
  return (
    <>
      <footer
        className="site-footer shell"
        aria-label={he ? "מידע משפטי והעדפות" : "Policies and preferences"}
      >
        <nav aria-label={he ? "מידע והגדרות" : "Information and settings"}>
          {links.map(([url, label]) => (
            <Link href={url} key={url}>
              {label}
            </Link>
          ))}
          <button ref={settingsButton} onClick={openSettings}>
            {he ? "הגדרות פרטיות וקוקיז" : "Privacy & cookie settings"}
          </button>
        </nav>
        <p>
          {he ? "מופעל על ידי" : "Operated by"}{" "}
          <span lang="en">Clickabily</span> ·{" "}
          <a href="mailto:info@clickabily.com">info@clickabily.com</a>
        </p>
        <details className="access-tools">
          <summary>{he ? "אפשרויות נגישות" : "Accessibility options"}</summary>
          <p>
            {he
              ? "אפשר גם להגדיל את התצוגה באמצעות כלי הדפדפן."
              : "You can also zoom using your browser controls."}
          </p>
          <div>
            {[
              [
                large,
                setLarge,
                "large-text",
                he ? "טקסט מוגדל" : "Larger text",
              ],
              [
                contrast,
                setContrast,
                "high-contrast",
                he ? "ניגודיות גבוהה" : "High contrast",
              ],
              [
                reduce,
                setReduce,
                "reduce-motion",
                he ? "צמצום תנועה" : "Reduce motion",
              ],
            ].map(([value, setter, attribute, label]) => (
              <button
                key={String(attribute)}
                aria-pressed={Boolean(value)}
                onClick={() => {
                  (setter as (v: boolean) => void)(!value);
                  document.documentElement.toggleAttribute(
                    `data-${attribute}`,
                    !value,
                  );
                }}
              >
                {String(label)}
              </button>
            ))}
          </div>
        </details>
        <p className="sr-only" role="status">
          {saved
            ? he
              ? "העדפות הפרטיות נשמרו."
              : "Privacy preferences saved."
            : ""}
        </p>
      </footer>
      {banner && (
        <section
          ref={bannerRef}
          className="consent-banner"
          aria-label={
            he ? "פרטיות ואחסון בדפדפן" : "Privacy and browser storage"
          }
        >
          <div>
            <h2>
              {he ? "הפרטיות שלכם, הבחירה שלכם" : "Your privacy, your choice"}
            </h2>
            <p>
              {he
                ? "אנחנו שומרים את בחירת הפרטיות ואת בקשתכם לדחות הצעות התקנה. משחק ושמירת מועדפים משתמשים בעוגיית התחברות חיונית. מדידה מקומית של השימוש בהתקנה תופעל רק באישורכם. אין כרגע עוגיות פרסום או שירות מדידה חיצוני."
                : "We store your privacy choice and requests to snooze install offers. Games and favorites use an essential session cookie. Optional local installation measurement runs only with your permission. We currently use no advertising cookies or external analytics."}{" "}
              <Link href="/privacy">
                {he ? "פרטים במדיניות הפרטיות" : "Read our privacy policy"}
              </Link>
            </p>
          </div>
          <div className="consent-actions">
            <button onClick={() => choose(false)}>
              {he ? "חיוניים בלבד" : "Essential only"}
            </button>
            <button onClick={() => choose(true)}>
              {he ? "אישור מדידה מקומית" : "Allow local measurement"}
            </button>
            <button onClick={openSettings}>
              {he ? "התאמה אישית" : "Customize"}
            </button>
          </div>
        </section>
      )}
      <dialog
        ref={dialog}
        className="privacy-dialog"
        aria-labelledby="privacy-settings-heading"
        onClose={() =>
          (opener.current?.isConnected
            ? opener.current
            : settingsButton.current
          )?.focus({ preventScroll: true })
        }
      >
        <h2 id="privacy-settings-heading">
          {he ? "העדפות פרטיות" : "Privacy preferences"}
        </h2>
        <p>
          {he
            ? "ההעדפות חלות על הדפדפן הזה. אפשר לשנות אותן בכל עת. דחייה אינה מגבילה את החיפוש או המשחקים."
            : "These preferences apply to this browser and can be changed anytime. Declining does not limit search or games."}
        </p>
        <p>
          {he
            ? "חיוני: שמירת בחירת הפרטיות ובקשת ״אולי אחר כך״."
            : "Essential: saving your privacy choice and “Maybe later” requests."}
        </p>
        <label>
          <input
            type="checkbox"
            checked={measurement}
            onChange={(e) => setMeasurement(e.target.checked)}
          />
          {he
            ? "מדידה מקומית אופציונלית: נוסח כפתור, ביקורים ופעולות התקנה. אינה נשלחת לשרת."
            : "Optional local measurement: button variant, visits and installation actions. Not sent to a server."}
        </label>
        <p>
          {he
            ? "ביטול האישור מוחק את נתוני המדידה מהדפדפן."
            : "Withdrawing consent deletes local measurement data."}
        </p>
        <div className="consent-actions">
          <button onClick={() => choose(false)}>
            {he ? "חיוניים בלבד" : "Essential only"}
          </button>
          <button onClick={() => choose(measurement)}>
            {he ? "שמירת הבחירה" : "Save preference"}
          </button>
          <button onClick={() => dialog.current?.close()}>
            {he ? "סגירה ללא שינוי" : "Close without changes"}
          </button>
        </div>
      </dialog>
    </>
  );
}
