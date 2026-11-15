"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/places";
export type Profile = {
  user: { id: string; name: string; registered: number };
  balance: number;
  history: { id: string; game: string; amount: number; created: number }[];
  stats: { game: string; count: number }[];
  favorites: { id: string; label: string }[];
};
type Reply = {
  profile?: Profile | null;
  round?: string;
  done?: boolean;
  result?: number[];
  earned?: number;
  hint?: string;
  attempts?: number;
  answer?: number;
  clientId?: string;
  nonce?: string;
};
type Member = {
  profile: Profile | null;
  ready: boolean;
  googleEnabled: boolean;
  act: (body: Record<string, unknown>) => Promise<Reply>;
};
const Context = createContext<Member | null>(null);
export function MemberProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null),
    [ready, setReady] = useState(false),
    [googleEnabled, setGoogleEnabled] = useState(false);
  const creation = useRef<Promise<Reply> | null>(null);
  async function send(body: Record<string, unknown>): Promise<Reply> {
    const res = await fetch("/api/member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "request-failed");
    if ("profile" in data) setProfile(data.profile);
    return data;
  }
  async function act(body: Record<string, unknown>) {
    if (!profile && body.action !== "guest") {
      if (!creation.current)
        creation.current = send({ action: "guest" }).finally(() => {
          creation.current = null;
        });
      await creation.current;
    }
    return send(body);
  }
  useEffect(() => {
    let active = true;
    fetch("/api/member")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        if (active) {
          setProfile(d.profile);
          setGoogleEnabled(d.googleEnabled);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <Context.Provider value={{ profile, ready, googleEnabled, act }}>
      {children}
    </Context.Provider>
  );
}
export function useMember() {
  const value = useContext(Context);
  if (!value) throw new Error("MemberProvider required");
  return value;
}
export function FavoriteButton({ id, locale }: { id: string; locale: Locale }) {
  const { profile, act } = useMember();
  const [editing, setEditing] = useState(false),
    [label, setLabel] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const saved = profile?.favorites.some((f) => f.id === id);
  const he = locale === "he";
  async function save(remove = false) {
    setBusy(true);
    try {
      await act({ action: "favorite", placeId: id, label, remove });
      setEditing(false);
      setMessage(he ? "המועדפים עודכנו" : "Favorites updated");
    } catch {
      setMessage(
        he ? "לא הצלחנו לשמור. נסו שוב." : "Could not save. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="favorite-save">
      <button
        className="soft-button"
        disabled={busy}
        onClick={() => (saved ? void save(true) : setEditing(!editing))}
      >
        {saved
          ? he
            ? "♥ נשמר · הסרה"
            : "♥ Saved · Remove"
          : he
            ? "♡ שמירה למועדפים"
            : "♡ Save favorite"}
      </button>
      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <label>
            {he ? "הכינוי שלכם למקום" : "Your nickname for this spot"}
            <input
              value={label}
              maxLength={60}
              required
              onChange={(e) => setLabel(e.target.value)}
              placeholder={he ? "למשל: הפיצה שלנו" : "e.g. Our pizza spot"}
            />
          </label>
          <button className="dark-button" disabled={busy}>
            {he ? "שמירה" : "Save"}
          </button>
        </form>
      )}
      <span role="status">{message}</span>
    </div>
  );
}
type GoogleApi = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        nonce: string;
        callback: (data: { credential: string }) => void;
      }) => void;
      renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
    };
  };
};
declare global {
  interface Window {
    google?: GoogleApi;
  }
}
let googleScript: Promise<void> | null = null;
function loadGoogle() {
  if (window.google) return Promise.resolve();
  if (!googleScript)
    googleScript = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        googleScript = null;
        script.remove();
        reject(new Error("script"));
      };
      document.head.appendChild(script);
    });
  return googleScript;
}
export function GoogleLogin({ locale }: { locale: Locale }) {
  const { act, googleEnabled } = useMember();
  const target = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [shown, setShown] = useState(false);
  const he = locale === "he";
  async function login() {
    setBusy(true);
    setMessage("");
    try {
      const data = await act({ action: "google-prepare" });
      await loadGoogle();
      if (!window.google || !target.current) throw new Error();
      window.google.accounts.id.initialize({
        client_id: data.clientId!,
        nonce: data.nonce!,
        callback: async (response) => {
          try {
            await act({ action: "google", credential: response.credential });
            setShown(false);
            setMessage("");
          } catch {
            setMessage(
              he ? "הכניסה לא הושלמה. נסו שוב." : "Sign-in failed. Try again.",
            );
            setShown(false);
          }
        },
      });
      window.google.accounts.id.renderButton(target.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        locale: he ? "he" : "en",
      });
      setShown(true);
    } catch {
      setMessage(
        he
          ? "הכניסה עם Google עדיין לא זמינה. אפשר להמשיך כאורח."
          : "Google sign-in is unavailable. Continue as a guest.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      {!shown && (
        <button
          className="google-button"
          disabled={!googleEnabled || busy}
          onClick={() => void login()}
        >
          <b>G</b> {he ? "המשך עם Google" : "Continue with Google"}
        </button>
      )}
      <div ref={target} />
      {!googleEnabled && (
        <small>
          {he
            ? "כניסת Google תיפתח לאחר השלמת החיבור."
            : "Google sign-in will open once setup is complete."}
        </small>
      )}
      <p role="status">{message}</p>
    </div>
  );
}
