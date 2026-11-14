"use client";
import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import { Mascot } from "./illustrations";
import {
  canOffer,
  INSTALL_KEY,
  isIOS,
  readInstallRecord,
  WEEK,
  type InstallRecord,
} from "@/lib/install";
import type { Locale } from "@/lib/places";
type InstallEvent = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
const words = {
  he: {
    title: "בפעם הבאה שאתם רעבים, אנחנו במרחק לחיצה",
    body: "הוסיפו את Munchadoo למסך הבית וחזרו ישר לבחירה ולמשחקים.",
    plain: "הוספה למסך הבית",
    bite: "הביס הבא במרחק לחיצה",
    later: "אולי אחר כך",
    close: "סגירת ההדרכה",
    guide: "כך מוסיפים למסך הבית",
    ios: "ב־Safari באייפון או באייפד:",
    steps: [
      "פתחו את תפריט השיתוף (ייתכן שהוא בתוך תפריט שלוש הנקודות).",
      "בחרו ״הוספה למסך הבית״. אם צריך, לחצו קודם ״עוד״.",
      "אם מופיע ״פתיחה כיישום אינטרנט״, הפעילו אותו ולחצו ״הוסף״.",
    ],
    other:
      "פתחו את תפריט הדפדפן וחפשו ״התקנת האפליקציה״ או ״הוספה למסך הבית״. אם האפשרות חסרה, נסו לפתוח את האתר ב־Chrome באנדרואיד או ב־Safari באייפון.",
    embedded:
      "פתחתם דרך WhatsApp או אפליקציה אחרת? פתחו את הקישור בדפדפן הרגיל כדי להתקין.",
    pending: "ממתינים לאישור הדפדפן…",
    accepted:
      "הבקשה אושרה בדפדפן. חפשו את Munchadoo במסך הבית או ברשימת האפליקציות.",
    failed: "לא הצלחנו לפתוח את בקשת ההתקנה. אפשר להשתמש בתפריט הדפדפן.",
  },
  en: {
    title: "Next time you’re hungry, we’re one tap away",
    body: "Add Munchadoo to your home screen for quick access to picks and games.",
    plain: "Add to home screen",
    bite: "Your next bite, one tap away",
    later: "Maybe later",
    close: "Close instructions",
    guide: "Add Munchadoo to your home screen",
    ios: "In Safari on iPhone or iPad:",
    steps: [
      "Open the Share menu (it may be inside the More menu).",
      "Choose “Add to Home Screen”. Tap “More” first if needed.",
      "If “Open as Web App” appears, enable it, then tap “Add”.",
    ],
    other:
      "Open your browser menu and look for “Install app” or “Add to Home Screen”. If unavailable, try Chrome on Android or Safari on iPhone.",
    embedded:
      "Opened in WhatsApp or another app? Open the link in your regular browser to install.",
    pending: "Waiting for the browser…",
    accepted:
      "Request accepted by your browser. Look for Munchadoo on your home screen or in your apps.",
    failed:
      "The install prompt could not open. You can use the browser menu instead.",
  },
};
export function useInstall() {
  const prompt = useRef<InstallEvent | null>(null);
  const record = useRef<InstallRecord | null>(null);
  const [state, setState] = useState({
    ready: false,
    installed: false,
    ios: false,
    available: false,
    eligible: false,
    variant: "plain" as "plain" | "bite",
    busy: false,
    accepted: false,
    failed: false,
  });
  function track(name: string) {
    const r = record.current;
    if (!r) return;
    r.counts[name] = Math.min(100000, (Number(r.counts[name]) || 0) + 1);
    try {
      localStorage.setItem(INSTALL_KEY, JSON.stringify(r));
    } catch {
      /* Private mode still works. */
    }
  }
  useEffect(() => {
    const media = matchMedia("(display-mode: standalone)");
    const installed = () =>
      media.matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    const init = setTimeout(() => {
      let raw = null;
      try {
        raw = localStorage.getItem(INSTALL_KEY);
      } catch {
        /* Storage unavailable. */
      }
      const now = Date.now();
      record.current = readInstallRecord(raw, now);
      record.current.returnedAfterWeek ||=
        now - record.current.firstSeen >= WEEK;
      record.current.lastSeen = now;
      track(installed() ? "standalone_launch" : "browser_visit");
      setState((s) => ({
        ...s,
        ready: true,
        installed: installed(),
        ios: isIOS(
          navigator.userAgent,
          navigator.platform,
          navigator.maxTouchPoints,
        ),
        eligible: canOffer(record.current!, now),
        variant: record.current!.variant,
      }));
    }, 0);
    const before = (event: Event) => {
      event.preventDefault();
      prompt.current = event as InstallEvent;
      setState((s) => ({ ...s, available: true }));
    };
    const complete = () => {
      prompt.current = null;
      track("installed_event");
      setState((s) => ({ ...s, installed: true, available: false }));
    };
    const changed = () => setState((s) => ({ ...s, installed: installed() }));
    window.addEventListener("beforeinstallprompt", before);
    window.addEventListener("appinstalled", complete);
    media.addEventListener("change", changed);
    return () => {
      clearTimeout(init);
      window.removeEventListener("beforeinstallprompt", before);
      window.removeEventListener("appinstalled", complete);
      media.removeEventListener("change", changed);
    };
  }, []);
  function dismiss() {
    if (record.current) record.current.dismissedAt = Date.now();
    track("dismissed");
    setState((s) => ({ ...s, eligible: false }));
  }
  async function install() {
    const event = prompt.current;
    if (!event || state.busy) return;
    prompt.current = null;
    track("prompt_requested");
    setState((s) => ({ ...s, busy: true, available: false, failed: false }));
    try {
      await event.prompt();
      const choice = await event.userChoice;
      track(
        choice.outcome === "accepted" ? "prompt_accepted" : "prompt_dismissed",
      );
      if (choice.outcome === "dismissed") dismiss();
      setState((s) => ({
        ...s,
        busy: false,
        accepted: choice.outcome === "accepted",
      }));
    } catch {
      track("prompt_error");
      setState((s) => ({ ...s, busy: false, failed: true }));
    }
  }
  return {
    state,
    track,
    dismiss,
    install,
    clearFailure: () => setState((s) => ({ ...s, failed: false })),
  };
}
export function InstallCard({
  locale,
  install,
  manual = false,
  placement,
  onClose,
}: {
  locale: Locale;
  install: ReturnType<typeof useInstall>;
  manual?: boolean;
  placement: "restaurant" | "game" | "footer";
  onClose?: () => void;
}) {
  const [guide, setGuide] = useState(false);
  const seen = useRef(false);
  const { state } = install;
  const visible =
    state.ready &&
    !state.installed &&
    (manual || (state.eligible && (state.available || state.ios)));
  useEffect(() => {
    if (visible && !seen.current) {
      seen.current = true;
      install.track(`offer_${placement}`);
    }
  }, [visible, placement, install]);
  if (!visible) return null;
  const t = words[locale];
  return (
    <aside className="install-card" aria-label={t.guide}>
      <div className="install-intro">
        <Mascot small />
        <div>
          <h3>{t.title}</h3>
          <p>{t.body}</p>
        </div>
      </div>
      {state.accepted ? (
        <p role="status">{t.accepted}</p>
      ) : (
        <div className="install-actions">
          <button
            className="dark-button"
            disabled={state.busy}
            onClick={() => {
              install.track(`click_${placement}`);
              if (state.available) void install.install();
              else {
                setGuide(true);
                install.track("guide_opened");
              }
            }}
          >
            <Download size={18} />
            {state.busy ? t.pending : t[state.variant]}
          </button>
          <button
            className="text-button"
            onClick={() => {
              install.dismiss();
              onClose?.();
            }}
          >
            {t.later}
          </button>
        </div>
      )}
      {state.failed && <p role="status">{t.failed}</p>}
      {(guide || state.failed) && (
        <div className="install-guide">
          <button
            className="text-button"
            aria-label={t.close}
            onClick={() => {
              setGuide(false);
              install.clearFailure();
            }}
          >
            <X size={18} />
          </button>
          <h4>{t.guide}</h4>
          {state.ios ? (
            <>
              <p>{t.ios}</p>
              <ol>
                {t.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </>
          ) : (
            <p>{t.other}</p>
          )}
          <p>{t.embedded}</p>
        </div>
      )}
    </aside>
  );
}
