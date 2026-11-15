"use client";
import Link from "next/link";
import { useLanguage } from "../use-language";
import { useState } from "react";
import { useMember, GoogleLogin } from "../member";
import { BrickBuddy } from "../arcade";
export default function ProfilePage() {
  const { profile, act, ready } = useMember();
  const { locale, selected, setLanguage } = useLanguage();
  const [name, setName] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(false);
  const he = locale === "he";
  const games = profile?.stats.reduce((n, s) => n + s.count, 0) || 0;
  const badges = [
    {
      icon: "✦",
      name: he ? "ביס ראשון" : "First bite",
      desc: he ? "השלימו משחק אחד" : "Complete one game",
      unlocked: games >= 1,
    },
    {
      icon: "#",
      name: he ? "קוראי מחשבות" : "Mind reader",
      desc: he ? "מצאו מספר סודי" : "Find a secret number",
      unlocked: profile?.stats.some((s) => s.game === "number"),
    },
    {
      icon: "◉",
      name: he ? "מסובבי עולמות" : "World spinner",
      desc: he ? "סובבו את הגלגל" : "Spin the wheel",
      unlocked: profile?.stats.some((s) => s.game === "wheel"),
    },
    {
      icon: "▦",
      name: he ? "חברים בקוביות" : "Brick crew",
      desc: he ? "שחקו בסלוט" : "Play brick buddies",
      unlocked: profile?.stats.some((s) => s.game === "slots"),
    },
    {
      icon: "♥",
      name: he ? "יש לי מקום" : "My favorite spot",
      desc: he ? "שמרו מקום אהוב" : "Save a favorite",
      unlocked: !!profile?.favorites.length,
    },
    {
      icon: "★",
      name: he ? "שחקני בית" : "Club regular",
      desc: he ? "השלימו עשרה משחקים" : "Complete ten games",
      unlocked: games >= 10,
    },
  ];
  async function action(body: Record<string, unknown>) {
    setBusy(true);
    setMessage("");
    try {
      await act(body);
      setMessage(he ? "עודכן!" : "Updated!");
      setConfirm(false);
    } catch {
      setMessage(
        he ? "לא הצלחנו לעדכן. נסו שוב." : "Could not update. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="club-page" dir={he ? "rtl" : "ltr"} lang={locale}>
      <header className="club-header shell">
        <Link className="wordmark" href="/" dir="ltr">
          <span className="logo-face">m</span>munchadoo
          <span className="wordmark-dot">.</span>
        </Link>
      </header>
      <main id="main-content" className="shell club-main">
        <div className="profile-language">
          <label htmlFor="profile-language">
            {he ? "שפת האפליקציה" : "App language"}
          </label>
          <select
            id="profile-language"
            value={selected}
            onChange={(e) =>
              setLanguage(e.target.value as "auto" | "he" | "en")
            }
          >
            <option value="auto">
              {he ? "לפי המכשיר" : "Device language"}
            </option>
            <option value="he">עברית</option>
            <option value="en">English</option>
          </select>
        </div>
        <Link className="club-back" href="/">
          {he ? "← בחזרה לביס הבא" : "← Back to your next bite"}
        </Link>
        <section className="profile-hero">
          <div className="profile-avatar">
            <BrickBuddy index={4} />
          </div>
          <div>
            <span className="club-kicker">YOUR LITTLE HAPPY PLACE</span>
            <h1>
              {he ? "הפינה של" : "Hello,"}{" "}
              {profile?.user.name || (he ? "האורחים שלנו" : "guest")}
            </h1>
            <p>
              {he
                ? "הטעמים שלכם. המשחקים שלכם. הסיפור שלכם."
                : "Your tastes. Your games. Your story."}
            </p>
            <span className="membership-tag">
              {profile?.user.registered
                ? he
                  ? "חברי Munch Club"
                  : "Munch Club member"
                : he
                  ? "מצב אורח · במכשיר הזה"
                  : "Guest mode · this browser"}
            </span>
          </div>
        </section>
        {!ready ? (
          <p role="status">
            {he ? "טוענים את הפרופיל…" : "Loading your profile…"}
          </p>
        ) : (
          <>
            <div className="profile-columns">
              <section className="wallet-card">
                <div className="wallet-top">
                  <span>MUNCH WALLET</span>
                  <span>✦</span>
                </div>
                <p>
                  {he
                    ? "קצת משחק. הרבה טעם."
                    : "A little play. A lot of flavor."}
                </p>
                <div className="wallet-balance">
                  {profile?.balance || 0}
                  <span>Munch Coins</span>
                </div>
                <div className="wallet-bottom">
                  <span>
                    {he ? "צוברים עם כל משחק" : "Collect as you play"}
                  </span>
                  <span>MC ✦</span>
                </div>
              </section>
              <section className="club-card join-card">
                <span className="club-kicker">BETTER TOGETHER</span>
                <h2>
                  {profile?.user.registered
                    ? he
                      ? "כיף שאתם במועדון"
                      : "You’re in the club"
                    : he
                      ? "שמרו מקום ליד השולחן"
                      : "Save a seat at the table"}
                </h2>
                <p>
                  {profile?.user.registered
                    ? he
                      ? "המטבעות, ההישגים והמועדפים מחכים לכם גם במכשיר הבא."
                      : "Your coins, badges and favorites follow you to your next device."
                    : he
                      ? "הירשמו כדי לשמור את ההתקדמות ולחזור אליה מכל מכשיר. אפשר גם פשוט לשחק כאורחים."
                      : "Sign in to keep your progress across devices. Or just keep playing as a guest."}
                </p>
                {!profile?.user.registered && (
                  <>
                    <GoogleLogin locale={locale} />
                    {!profile && (
                      <button
                        className="soft-button"
                        disabled={busy}
                        onClick={() => void action({ action: "guest" })}
                      >
                        {he ? "ממשיכים כאורחים" : "Continue as guest"}
                      </button>
                    )}
                    <small>
                      {he
                        ? "חשבון Google חדש שומר את התקדמות האורח. בחשבון קיים נטענת ההתקדמות שכבר נשמרה בו."
                        : "A new Google account keeps guest progress. An existing account loads its saved progress."}
                    </small>
                  </>
                )}
                {!!profile?.user.registered && (
                  <button
                    className="soft-button"
                    disabled={busy}
                    onClick={() => void action({ action: "logout" })}
                  >
                    {he ? "התנתקות" : "Sign out"}
                  </button>
                )}
              </section>
            </div>
            <section className="club-card">
              <div className="club-section-title">
                <div>
                  <span className="club-kicker">LITTLE WINS, BIG SMILES</span>
                  <h2>{he ? "אוסף ההישגים שלכם" : "Your badge collection"}</h2>
                </div>
                <span>
                  {badges.filter((b) => b.unlocked).length} / {badges.length}
                </span>
              </div>
              <div className="badge-grid">
                {badges.map((b) => (
                  <div
                    className={`badge-card ${b.unlocked ? "earned" : "locked"}`}
                    key={b.icon}
                  >
                    <span className="badge-medallion" aria-hidden="true">
                      {b.icon}
                    </span>
                    <h3>{b.name}</h3>
                    <p>{b.desc}</p>
                    <small>
                      {b.unlocked
                        ? he
                          ? "הושג ✓"
                          : "Unlocked ✓"
                        : he
                          ? "עוד רגע שלכם"
                          : "Waiting for you"}
                    </small>
                  </div>
                ))}
              </div>
            </section>
            <div className="profile-columns">
              <section className="club-card">
                <span className="club-kicker">SAVED WITH LOVE</span>
                <h2>{he ? "המקומות שלכם" : "Your favorite spots"}</h2>
                {profile?.favorites.length ? (
                  <ul className="club-list">
                    {profile.favorites.map((f) => (
                      <li key={f.id}>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=restaurant&query_place_id=${encodeURIComponent(f.id)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          ♥ {f.label} ↗
                        </a>
                        <button
                          aria-label={`${he ? "הסרת" : "Remove"} ${f.label}`}
                          disabled={busy}
                          onClick={() =>
                            void action({
                              action: "favorite",
                              placeId: f.id,
                              label: f.label,
                              remove: true,
                            })
                          }
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    {he
                      ? "מצאתם מקום ששווה לחזור אליו? לחצו על הלב בכרטיס המסעדה והוא יחכה כאן."
                      : "Found a place worth returning to? Save it from the restaurant details and find it here."}
                  </p>
                )}
                <Link href="/" className="club-text-link">
                  {he ? "מוצאים משהו טעים ↗" : "Find something tasty ↗"}
                </Link>
              </section>
              <section className="club-card history-card">
                <span className="club-kicker">YOUR COIN STORY</span>
                <h2>{he ? "הסיבובים האחרונים" : "Your latest rounds"}</h2>
                {profile?.history.length ? (
                  <ul className="club-list">
                    {profile.history.map((row) => (
                      <li key={row.id}>
                        <div>
                          <b>
                            {row.game === "number"
                              ? he
                                ? "ניחוש מספר"
                                : "Number guess"
                              : row.game === "wheel"
                                ? he
                                  ? "גלגל ההפתעות"
                                  : "Surprise wheel"
                                : he
                                  ? "חברים בקוביות"
                                  : "Brick buddies"}
                          </b>
                          <small>
                            {new Date(row.created).toLocaleDateString(
                              he ? "he-IL" : "en-US",
                            )}
                          </small>
                        </div>
                        <strong>+{row.amount} MC</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    {he
                      ? "הסיבוב הראשון שלכם עוד לפניכם."
                      : "Your first round is waiting."}
                  </p>
                )}
              </section>
            </div>
            <section className="rewards-teaser">
              <span aria-hidden="true">🎁</span>
              <div>
                <span className="club-kicker">SOMETHING GOOD IS COOKING</span>
                <h2>
                  {he
                    ? "בעתיד: עוד סיבות לחייך"
                    : "More reasons to smile, coming later"}
                </h2>
                <p>
                  {he
                    ? "אנחנו מתכננים פרסים. כרגע המטבעות הם נקודות משחק בלבד, ללא ערך כספי, רכישה, העברה או מימוש. תנאי הפרסים יפורסמו אם וכאשר יושקו."
                    : "We’re planning rewards. For now, coins are play points only, with no cash value, purchases, transfers or redemption. Reward terms will be published if and when rewards launch."}
                </p>
              </div>
            </section>
            {profile && (
              <section className="club-card account-settings">
                <h2>{he ? "בקטנה, עליכם" : "Make yourself at home"}</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void action({ action: "name", name });
                  }}
                >
                  <label htmlFor="profile-name">
                    {he ? "איך לקרוא לכם?" : "What should we call you?"}
                  </label>
                  <input
                    id="profile-name"
                    value={name}
                    maxLength={40}
                    placeholder={profile.user.name}
                    required
                    onChange={(e) => setName(e.target.value)}
                  />
                  <button className="dark-button" disabled={busy}>
                    {he ? "שמירה" : "Save"}
                  </button>
                </form>
                <p>
                  {he
                    ? "אורחים מזוהים באמצעות עוגייה חיונית ל־30 יום. מחיקת העוגייה עלולה לנתק את הגישה להתקדמות האורח."
                    : "Guests use an essential 30-day cookie. Clearing it may remove access to guest progress."}
                </p>
                <button
                  className="club-text-link"
                  onClick={() => setConfirm(!confirm)}
                >
                  {he
                    ? "מחיקת הפרופיל וההתקדמות"
                    : "Delete profile and progress"}
                </button>
                {confirm && (
                  <div role="alert">
                    <p>
                      {he
                        ? "המטבעות, ההישגים והמועדפים יימחקו לצמיתות. למחוק?"
                        : "Coins, badges and favorites will be permanently deleted. Continue?"}
                    </p>
                    <button
                      className="soft-button"
                      disabled={busy}
                      onClick={() => void action({ action: "delete" })}
                    >
                      {he ? "כן, למחוק" : "Yes, delete"}
                    </button>
                    <button
                      className="soft-button"
                      onClick={() => setConfirm(false)}
                    >
                      {he ? "ביטול" : "Cancel"}
                    </button>
                  </div>
                )}
              </section>
            )}
            <p role="status">{message}</p>
          </>
        )}
        <footer className="club-footer">
          <Link href="/privacy">{he ? "פרטיות" : "Privacy"}</Link> ·{" "}
          <Link href="/terms">{he ? "תנאים" : "Terms"}</Link> · Powered by
          Clickabily
        </footer>
      </main>
    </div>
  );
}
