"use client";
import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/places";
import { useMember } from "./member";
const colors = [
  "#f78461",
  "#9bb270",
  "#91bcc6",
  "#c69bd0",
  "#eac76b",
  "#7bb6a3",
];
export function BrickBuddy({ index = 0 }: { index?: number }) {
  return (
    <svg viewBox="0 0 100 130" aria-hidden="true" className="brick-buddy">
      <rect x="38" y="7" width="24" height="12" rx="4" fill="#ebbd51" />
      <rect x="24" y="17" width="52" height="41" rx="9" fill="#f5d56c" />
      <circle cx="40" cy="35" r="3" fill="#293e32" />
      <circle cx="60" cy="35" r="3" fill="#293e32" />
      <path
        d="M40 45q10 9 20 0"
        fill="none"
        stroke="#293e32"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M26 64h48l8 38H18z" fill={colors[index % 6]} />
      <rect
        x="5"
        y="65"
        width="15"
        height="38"
        rx="5"
        fill={colors[index % 6]}
      />
      <rect
        x="80"
        y="65"
        width="15"
        height="38"
        rx="5"
        fill={colors[index % 6]}
      />
      <rect x="23" y="103" width="23" height="25" rx="3" fill="#344d41" />
      <rect x="54" y="103" width="23" height="25" rx="3" fill="#344d41" />
      <text x="50" y="91" textAnchor="middle" fontSize="21" fill="#fff">
        {["★", "♥", "✦", "●", "☀", "◆"][index % 6]}
      </text>
    </svg>
  );
}
export function Arcade({ locale }: { locale: Locale }) {
  const he = locale === "he",
    { profile, act, ready } = useMember();
  const [selected, setSelected] = useState<"number" | "wheel" | "slots">(
      "number",
    ),
    [round, setRound] = useState(""),
    [guess, setGuess] = useState(""),
    [done, setDone] = useState(true),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [reels, setReels] = useState([0, 1, 2]),
    [rotation, setRotation] = useState(0);
  const names = he
    ? ["נחשו את המספר", "גלגל ההפתעות", "חברים בקוביות"]
    : ["Guess the number", "Surprise wheel", "Brick buddies"];
  const challenges = he
    ? [
        "תנו שם למסעדה שלכם",
        "המציאו טעם גלידה",
        "מי הכי רעב כאן?",
        "עשו פרצוף של לימון",
        "ספרו בדיחת אוכל",
        "בחרו שיר לארוחה",
      ]
    : [
        "Name your restaurant",
        "Invent an ice cream flavor",
        "Who is hungriest?",
        "Make a lemon face",
        "Tell a food joke",
        "Pick a dinner song",
      ];
  async function start() {
    setBusy(true);
    setMessage("");
    try {
      const data = await act({ action: "start", game: selected });
      setRound(data.round!);
      setDone(data.done!);
      setGuess("");
      if (selected === "number")
        setMessage(
          he
            ? "חשבתי על מספר. יש לכם 10 ניסיונות!"
            : "I picked a number. You have 10 guesses!",
        );
      else {
        if (selected === "slots") setReels(data.result!);
        else
          setRotation(
            (v) =>
              Math.floor(v / 360) * 360 + 1080 + (360 - data.result![0] * 60),
          );
        const outcome =
          selected === "wheel"
            ? challenges[data.result![0]]
            : new Set(data.result).size === 1
              ? he
                ? "שלישייה תואמת!"
                : "Three of a kind!"
              : he
                ? "נבחרה לכם נבחרת חדשה!"
                : "Meet your new crew!";
        setMessage(
          `${outcome} · ${data.earned ? `+${data.earned} Munch Coins` : he ? "הגעתם לתקרת הצבירה היומית. ממשיכים לשחק!" : "Daily coin limit reached. Keep playing!"}`,
        );
      }
    } catch (e) {
      setMessage(
        e instanceof Error && e.message === "slow-down"
          ? he
            ? "עוד רגע… נסו שוב בעוד כמה שניות."
            : "One moment… try again in a few seconds."
          : he
            ? "המשחק לא נטען. נסו שוב."
            : "Could not load the game. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    setBusy(true);
    try {
      const data = await act({ action: "guess", round, guess: Number(guess) });
      setDone(data.done!);
      const hints: Record<string, string> = he
        ? {
            higher: "יותר גבוה ↑",
            lower: "יותר נמוך ↓",
            correct: "בול! מצאתם את המספר ✦",
            over: `נגמרו הניסיונות. המספר היה ${data.answer}`,
          }
        : {
            higher: "Go higher ↑",
            lower: "Go lower ↓",
            correct: "You found it! ✦",
            over: `Out of guesses. The number was ${data.answer}`,
          };
      setMessage(
        `${hints[data.hint!]} · ${data.attempts}/10${data.earned ? ` · +${data.earned} Munch Coins` : ""}`,
      );
      setGuess("");
    } catch {
      setDone(true);
      setMessage(
        he
          ? "הסיבוב הסתיים. התחילו סיבוב חדש."
          : "This round ended. Start a new one.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="arcade"
      aria-label={he ? "ארקייד Munchadoo" : "Munchadoo arcade"}
    >
      <div className="arcade-heading">
        <div>
          <span className="club-kicker">THE MUNCH CLUB</span>
          <h2>{he ? "עוד סיבוב קטן?" : "One more little round?"}</h2>
        </div>
        <Link className="coin-pill" href="/profile">
          ✦ {profile?.balance || 0} <span>MC</span>
        </Link>
      </div>
      <p>
        {he
          ? "משחקים, אוספים רגעים וצוברים מטבעות. גם כאורחים."
          : "Play, make memories and collect coins. Guests welcome."}
      </p>
      <div className="arcade-tabs">
        {(["number", "wheel", "slots"] as const).map((type, i) => (
          <button
            key={type}
            disabled={busy}
            aria-pressed={selected === type}
            onClick={() => {
              setSelected(type);
              setDone(true);
              setMessage("");
              setRound("");
            }}
          >
            <span>{["#", "◉", "▦"][i]}</span>
            {names[i]}
          </button>
        ))}
      </div>
      <div className={`arcade-stage ${selected}`}>
        <div className="arcade-art">
          {selected === "number" ? (
            <div className="number-orb">
              <small>BETWEEN</small>
              <b>1—100</b>
              <span>?</span>
            </div>
          ) : selected === "wheel" ? (
            <div className="wheel-wrap">
              <span className="wheel-pointer">▼</span>
              <div
                className="munch-wheel"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {["✦", "♥", "☀", "♫", "☺", "★"].map((s, i) => (
                  <span
                    key={s}
                    style={{
                      transform: `rotate(${i * 60}deg) translateY(-83px) rotate(${-i * 60}deg)`,
                    }}
                  >
                    {s}
                  </span>
                ))}
                <b>m</b>
              </div>
            </div>
          ) : (
            <div className="slot-cabinet">
              <div className="slot-lights">✦ BRICK BUDDIES ✦</div>
              <div className="slot-reels">
                {reels.map((n, i) => (
                  <div key={`${i}-${n}`}>
                    <BrickBuddy index={n} />
                  </div>
                ))}
              </div>
              <small>
                {he
                  ? "דמויות קובייה מקוריות של Munchadoo"
                  : "Original Munchadoo brick characters"}
              </small>
            </div>
          )}
        </div>
        <div className="arcade-actions">
          <h3>{names[["number", "wheel", "slots"].indexOf(selected)]}</h3>
          <p>
            {selected === "number"
              ? he
                ? "מספר סודי, עשרה ניסיונות. נרמוז לכם בדרך."
                : "One secret number, ten guesses. Follow the hints."
              : he
                ? "כל סיבוב הוא הפתעה. אין הימור ואין צורך במטבעות."
                : "Every round is a surprise. No bets or coins required."}
          </p>
          {selected === "number" && !done ? (
            <form
              className="number-form"
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <label htmlFor="number-guess">
                {he ? "הניחוש שלכם" : "Your guess"}
              </label>
              <input
                id="number-guess"
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                required
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
              />
              <button className="dark-button" disabled={busy}>
                {he ? "זה המספר שלי" : "That’s my number"}
              </button>
            </form>
          ) : (
            <button
              className="dark-button"
              disabled={busy || !ready}
              onClick={() => void start()}
            >
              {busy
                ? he
                  ? "רגע…"
                  : "One moment…"
                : selected === "number"
                  ? he
                    ? "בואו ננחש"
                    : "Let’s guess"
                  : he
                    ? "סובבו לי!"
                    : "Give it a spin!"}
            </button>
          )}
          <p className="arcade-status" role="status">
            {message}
          </p>
          <small>
            {he
              ? "10 מטבעות להשלמה, עד 100 ביום (UTC). ללא ערך כספי או פרסים כרגע."
              : "10 coins per completion, up to 100 per day (UTC). No cash value or prizes currently."}
          </small>
        </div>
      </div>
    </section>
  );
}
