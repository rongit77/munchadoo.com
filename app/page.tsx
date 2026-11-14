"use client";
import { Mascot, FoodArt } from "./illustrations";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Dice5,
  Gamepad2,
  Globe2,
  Heart,
  MapPin,
  Navigation,
  RotateCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";
import {
  areas,
  choosePlace,
  distanceKm,
  type Cuisine,
  type Locale,
  type Place,
  type Point,
} from "@/lib/places";
import { liveProvider } from "@/lib/live-places";
import { copy } from "@/lib/copy";
import { gameCards, type Audience, type GameType } from "@/lib/games";

const cuisineIcons: Record<Cuisine, string> = {
  all: "✦",
  pizza: "🍕",
  burger: "🍔",
  asian: "🍜",
  mediterranean: "🥙",
  cafe: "☕",
};
export default function Home() {
  const [locale, setLocale] = useState<Locale>("he");
  const t = copy[locale];
  const [view, setView] = useState<"discover" | "play">("discover");
  const [mode, setMode] = useState<"eat" | "order">("eat");
  const [area, setArea] = useState(areas[0].id);
  const [center, setCenter] = useState<Point>(areas[0].point);
  const [radius, setRadius] = useState(3);
  const [cuisine, setCuisine] = useState<Cuisine>("all");
  const [openOnly, setOpenOnly] = useState(true);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [locationBusy, setLocationBusy] = useState(false);
  const [error, setError] = useState<keyof typeof copy.he | null>(null);
  const [winner, setWinner] = useState<Place | null>(null);
  const [previous, setPrevious] = useState<string>();
  const [drawing, setDrawing] = useState(false);
  const [randomResult, setRandomResult] = useState(true);
  const [audience, setAudience] = useState<Audience>("family");
  const [game, setGame] = useState<GameType | null>(null);
  const [round, setRound] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  const pendingResult = useRef<(() => void) | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drawEpoch = useRef(0);
  const locationEpoch = useRef(0);
  const restoreFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
  }, [locale]);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setError(null);
      setLoading(true);
      setPlaces([]);
      liveProvider
        .search(
          { center, radius, cuisine, openOnly, locale },
          controller.signal,
        )
        .then((data) => {
          if (active) {
            setPlaces(data);
            setLoading(false);
          }
        })
        .catch((e) => {
          if (active) {
            setError(
              e.message === "rate-limited"
                ? "quotaError"
                : e.message === "provider-access"
                  ? "accessError"
                  : "error",
            );
            setPlaces([]);
            setLoading(false);
          }
        });
    }, 600);
    return () => {
      clearTimeout(timer);
      controller.abort();
      active = false;
    };
  }, [center, radius, cuisine, openOnly, locale, refresh]);
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  useEffect(() => {
    if (winner) {
      restoreFocus.current = document.activeElement as HTMLElement;
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
      restoreFocus.current?.focus();
    }
  }, [winner]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view]);
  const invalidate = () => {
    drawEpoch.current++;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDrawing(false);
    setWinner(null);
    setLoading(true);
    setPlaces([]);
    setError(null);
  };
  function selectArea(value: string) {
    invalidate();
    locationEpoch.current++;
    setLocationBusy(false);
    const selected = areas.find((a) => a.id === value);
    if (selected) {
      setArea(value);
      setCenter(selected.point);
    }
  }
  function locate() {
    if (!navigator.geolocation) {
      setError("unavailable");
      return;
    }
    setLocationBusy(true);
    setError(null);
    const request = ++locationEpoch.current;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (request !== locationEpoch.current) return;
        invalidate();
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setArea("device");
        setLocationBusy(false);
      },
      (e) => {
        if (request !== locationEpoch.current) return;
        setError(
          e.code === 1 ? "denied" : e.code === 3 ? "timeout" : "unavailable",
        );
        setLocationBusy(false);
      },
      { timeout: 8000, maximumAge: 60000 },
    );
  }
  async function draw() {
    if (drawing || loading) return;
    const selected = choosePlace(places, previous);
    if (!selected) return;
    const request = ++drawEpoch.current;
    pendingResult.current = null;
    setDrawing(true);
    setError(null);
    try {
      const status = await liveProvider.status(selected.id);
      if (request !== drawEpoch.current) return;
      if (status !== "open") {
        setPlaces((current) =>
          current.map((p) => (p.id === selected.id ? { ...p, status } : p)),
        );
        setDrawing(false);
        setError("statusChanged");
        return;
      }
      const show = () => {
        if (request !== drawEpoch.current) return;
        setWinner(selected);
        setPrevious(selected.id);
        setRandomResult(true);
        setDrawing(false);
        timeoutRef.current = null;
      };
      timeoutRef.current = setTimeout(
        show,
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 850,
      );
      pendingResult.current = show;
    } catch {
      if (request === drawEpoch.current) {
        setDrawing(false);
        setError("error");
      }
    }
  }

  const openPlaces = places.filter((p) => p.status === "open");
  const cards = game ? gameCards(game, audience, locale) : [];
  function startGame(type: GameType) {
    setGame(type);
    setRound(0);
    setRevealed(false);
    setChoice(null);
  }
  function nextRound() {
    setRound((r) => r + 1);
    setRevealed(false);
    setChoice(null);
  }
  function showGames() {
    drawEpoch.current++;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    pendingResult.current = null;
    setDrawing(false);
    setView("play");
    setGame(null);
  }
  const Arrow = locale === "he" ? ChevronLeft : ChevronRight;
  return (
    <main>
      <header className="header">
        <div className="shell header-inner">
          <button
            className="wordmark"
            dir="ltr"
            onClick={() => setView("discover")}
            aria-label={t.home}
          >
            <span className="logo-face">m</span>munchadoo
            <span className="wordmark-dot">.</span>
          </button>
          <nav aria-label={t.mainNav}>
            <button
              className={view === "discover" ? "nav-item active" : "nav-item"}
              onClick={() => setView("discover")}
            >
              <Compass size={17} />
              {t.discover}
            </button>
            <button
              className={view === "play" ? "nav-item active" : "nav-item"}
              onClick={showGames}
            >
              <Gamepad2 size={18} />
              {t.play}
            </button>
          </nav>
          <button
            className="language"
            aria-label={t.language}
            onClick={() => {
              invalidate();
              setLocale(locale === "he" ? "en" : "he");
            }}
          >
            <Globe2 size={17} />
            {locale === "he" ? "EN" : "עב"}
          </button>
        </div>
      </header>
      <div className="demo-strip">
        <span className="status-dot" />
        {t.demo}
        <span className="strip-divider">/</span>
        <span>{t.strip}</span>
      </div>
      {view === "discover" ? (
        <>
          <section className="hero shell">
            <div className="hero-copy">
              <p className="eyebrow">
                <Sparkles size={15} />
                {t.tag}
              </p>
              <h1>
                {t.heroA}
                <br />
                <span>
                  {t.heroB}
                  <svg viewBox="0 0 380 20" aria-hidden="true">
                    <path
                      d="M4 14 Q180-2 373 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="hero-description">{t.intro}</p>
              <div className="hero-notes">
                <span>
                  <Check size={15} />
                  {t.noGroup}
                </span>
                <span>
                  <Check size={15} />
                  {t.noChoose}
                </span>
              </div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <span className="floating-food food-one">🍕</span>
              <span className="floating-food food-two">🥑</span>
              <span className="floating-food food-three">🍜</span>
              <span className="doodle star-one">✳</span>
              <span className="doodle star-two">✦</span>
              <div className="mascot-circle">
                <Mascot />
              </div>
              <div className="speech" dir="ltr">
                let’s munch!
              </div>
              <div className="art-caption">{t.artCaption}</div>
            </div>
          </section>
          <section className="picker shell" aria-label={t.discover}>
            <div className="mode-row">
              <div className="mode-tabs">
                <button
                  aria-pressed={mode === "eat"}
                  className={mode === "eat" ? "selected" : ""}
                  onClick={() => setMode("eat")}
                >
                  <Utensils size={18} />
                  {t.eat}
                </button>
                <button
                  aria-pressed={mode === "order"}
                  className={mode === "order" ? "selected" : ""}
                  onClick={() => setMode("order")}
                >
                  <span aria-hidden="true">⌂</span>
                  {t.order}
                </button>
              </div>
              <span className="tiny-label">
                <SlidersHorizontal size={14} />
                {t.rules}
              </span>
            </div>
            {mode === "order" && <p className="order-note">{t.orderNote}</p>}
            <div className="controls">
              <div className="location-control">
                <label htmlFor="area">
                  <MapPin size={16} />
                  {t.location}
                </label>
                <div className="area-line">
                  <select
                    id="area"
                    value={area}
                    aria-label={t.chooseArea}
                    onChange={(e) => selectArea(e.target.value)}
                  >
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name[locale]}
                      </option>
                    ))}
                    {area === "device" && (
                      <option value="device">{t.device}</option>
                    )}
                  </select>
                  <button
                    className="locate"
                    onClick={locate}
                    disabled={locationBusy}
                    title={t.locate}
                    aria-label={t.locate}
                  >
                    <Navigation size={18} />
                  </button>
                </div>
                <span className="field-hint">
                  {locationBusy ? t.locating : t.demoArea}
                </span>
              </div>
              <div className="radius-control">
                <label htmlFor="radius">
                  {t.radius}
                  <strong>
                    {radius} {t.km}
                  </strong>
                </label>
                <input
                  id="radius"
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={radius}
                  onChange={(e) => {
                    invalidate();
                    setRadius(Number(e.target.value));
                  }}
                />
                <div className="range-labels">
                  <span>1 {t.km}</span>
                  <span>20 {t.km}</span>
                </div>
              </div>
              <label className="open-toggle">
                <input
                  type="checkbox"
                  checked={openOnly}
                  onChange={(e) => {
                    invalidate();
                    setOpenOnly(e.target.checked);
                  }}
                />
                <span className="switch" />
                <span>
                  {t.openOnly}
                  <small>
                    {locale === "he"
                      ? "לא מחכים לדלת שתיפתח"
                      : "No waiting for the doors to open"}
                  </small>
                </span>
              </label>
            </div>
            <div className="cuisines" aria-label={t.cuisineLabel}>
              {(Object.keys(cuisineIcons) as Cuisine[]).map((key) => (
                <button
                  key={key}
                  aria-pressed={cuisine === key}
                  className={cuisine === key ? "chip selected" : "chip"}
                  onClick={() => {
                    if (cuisine === key) return;
                    invalidate();
                    setCuisine(key);
                  }}
                >
                  <span aria-hidden="true">{cuisineIcons[key]}</span>
                  {key === "all" ? t.any : t[key]}
                </button>
              ))}
            </div>
            {error && (
              <p role="alert" className="error">
                {t[error]}
                <button
                  className="secondary"
                  onClick={() => {
                    invalidate();
                    setRefresh((n) => n + 1);
                  }}
                >
                  {locale === "he" ? "נסו שוב" : "Try again"}
                </button>
              </p>
            )}
            <div className="draw-row">
              <button
                className={`draw-button ${drawing ? "drawing" : ""}`}
                disabled={drawing || loading || !openPlaces.length}
                onClick={draw}
              >
                <Dice5 size={23} />
                {drawing ? t.drawing : t.surprise}
                <Sparkles size={19} />
              </button>
              <p>{openPlaces.length === 1 ? t.one : t.fair}</p>
              {drawing && (
                <button
                  className="text-button"
                  onClick={() => {
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    pendingResult.current?.();
                  }}
                >
                  {t.skip}
                </button>
              )}
            </div>
          </section>
          <section className="results shell" aria-busy={loading}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t.browse}</p>
                <h2>
                  {t.near}
                  <span className="count">{places.length}</span>
                </h2>
              </div>
              <span className="result-note">
                <span className="google-attribution" translate="no">
                  Google Maps
                </span>{" "}
                · {t.distance}
              </span>
            </div>
            {places.length ? (
              <div className="restaurant-grid">
                {places.map((p) => (
                  <button
                    key={p.id}
                    className="restaurant-card"
                    onClick={() => {
                      setWinner(p);
                      setRandomResult(false);
                    }}
                    aria-label={`${p.name[locale]}, ${t[p.status === "open" ? "open" : p.status === "closed" ? "closed" : "unknown"]}`}
                  >
                    <div className={`food-panel ${p.color}`}>
                      <FoodArt kind={p.food} />
                      <span className="food-label">{t.illustration}</span>
                      <span className="card-arrow">
                        <ArrowUpRight size={18} />
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="card-title">
                        <h3>{p.name[locale]}</h3>
                        <span className="price">
                          {p.price ? "₪".repeat(p.price) : ""}
                        </span>
                      </div>
                      {p.attributions?.map((a, i) => (
                        <small key={i}>{a.provider}</small>
                      ))}
                      <p>
                        {p.cuisine === "all" ? t.restaurant : t[p.cuisine]}
                        <span>·</span>
                        {new Intl.NumberFormat(locale, {
                          maximumFractionDigits: 1,
                        }).format(distanceKm(center, p.point))}{" "}
                        {t.km}
                      </p>
                      <span className={`place-status ${p.status}`}>
                        <i />
                        {
                          t[
                            p.status === "open"
                              ? "open"
                              : p.status === "closed"
                                ? "closed"
                                : "unknown"
                          ]
                        }
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty">
                <Search size={36} />
                <h3>{t.empty}</h3>
                <p>{t.emptyBody}</p>
                <button
                  className="secondary"
                  onClick={() => {
                    selectArea(areas[0].id);
                    setRadius(3);
                    setCuisine("all");
                  }}
                >
                  {t.reset}
                </button>
              </div>
            )}
            <p className="disclaimer">
              <span>ⓘ</span>
              {t.disclaimer}
            </p>
          </section>
          <section className="play-banner shell">
            <div className="banner-art" aria-hidden="true">
              <span>✦</span>
              <Gamepad2 size={78} strokeWidth={1.3} />
              <span>✳</span>
            </div>
            <div>
              <p className="eyebrow">{t.waitTag}</p>
              <h2>{t.waitTitle}</h2>
              <p>{t.waitBody}</p>
            </div>
            <button className="dark-button" onClick={showGames}>
              {t.gamesCta}
              <Arrow size={18} />
            </button>
          </section>
        </>
      ) : (
        <section className="games-page shell">
          <p className="eyebrow">
            <Sparkles size={16} />
            {t.gamesTag}
          </p>
          <h1>
            {t.gamesTitle}
            <br />
            <span>{t.gamesAccent}</span>
          </h1>
          <p className="games-intro">{t.gamesIntro}</p>
          {!game ? (
            <>
              <fieldset className="audiences">
                <legend>{t.audience}</legend>
                {(["family", "couple", "friends", "work"] as Audience[]).map(
                  (a, i) => (
                    <button
                      key={a}
                      aria-pressed={audience === a}
                      className={audience === a ? "chip selected" : "chip"}
                      onClick={() => setAudience(a)}
                    >
                      <span aria-hidden="true">
                        {["🏡", "💛", "✌️", "☕"][i]}
                      </span>
                      {t[a]}
                    </button>
                  ),
                )}
              </fieldset>
              <div className="game-grid">
                {(["would", "guess"] as GameType[]).map((type) => (
                  <article className={`game-card ${type}`} key={type}>
                    <div className="game-illustration" aria-hidden="true">
                      {type === "would" ? (
                        <>
                          <span>🍕</span>
                          <b>?</b>
                          <span>🍔</span>
                        </>
                      ) : (
                        <>
                          <span>🥐</span>
                          <b>!</b>
                          <span>🍜</span>
                        </>
                      )}
                    </div>
                    <span className="game-meta">
                      {t.minutes} · {t.shared}
                    </span>
                    <h2>{t[type]}</h2>
                    <p>{t[type === "would" ? "wouldBody" : "guessBody"]}</p>
                    <button
                      className="dark-button"
                      onClick={() => startGame(type)}
                    >
                      {t.start}
                      <Arrow size={18} />
                    </button>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="game-stage">
              <button className="text-button" onClick={() => setGame(null)}>
                {t.back}
              </button>
              {round >= cards.length ? (
                <div className="game-complete">
                  <Mascot small />
                  <h2>{t.done}</h2>
                  <p>{t.doneBody}</p>
                  <button
                    className="dark-button"
                    onClick={() => startGame(game)}
                  >
                    {t.replay}
                    <RotateCw size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="round-header">
                    <h2>{t[game]}</h2>
                    <span>
                      {t.round} {round + 1} {t.of} {cards.length}
                    </span>
                  </div>
                  <progress
                    aria-label={t.gameProgress}
                    value={round + 1}
                    max={cards.length}
                  />
                  <p className="turn-note">{t.turn}</p>
                  {game === "would" ? (
                    <>
                      <p>{t.chooseHint}</p>
                      <div className="choices">
                        {cards[round].options.map((option, i) => (
                          <button
                            className={
                              choice === i ? "choice picked" : "choice"
                            }
                            key={option}
                            aria-pressed={choice === i}
                            onClick={() => setChoice(i)}
                          >
                            <span>{i === 0 ? "A" : "B"}</span>
                            {option}
                            {choice === i && <Check size={22} />}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <ol className="clues">
                        {cards[round].clues.map((clue) => (
                          <li key={clue}>{clue}</li>
                        ))}
                      </ol>
                      {revealed ? (
                        <p role="status" className="answer">
                          {cards[round].answer}
                        </p>
                      ) : (
                        <button
                          className="secondary"
                          onClick={() => setRevealed(true)}
                        >
                          {t.reveal}
                        </button>
                      )}
                    </>
                  )}
                  <div className="round-actions">
                    <button className="dark-button" onClick={nextRound}>
                      {round === cards.length - 1 ? t.finish : t.next}
                      <Arrow size={18} />
                    </button>
                    <button className="text-button" onClick={nextRound}>
                      {t.skipQuestion}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      )}
      <footer className="shell">
        <span dir="ltr" className="footer-logo">
          munchadoo.
        </span>
        <span>{t.footer}</span>
        <span className="footer-heart">
          <Heart size={14} />
          {t.demo}
        </span>
      </footer>
      <dialog
        ref={dialogRef}
        onCancel={() => setWinner(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setWinner(null);
        }}
        aria-labelledby="winner-heading"
        onClose={() => setWinner(null)}
      >
        {winner && (
          <div className="winner-content">
            <button
              className="dialog-close"
              aria-label={t.close}
              onClick={() => setWinner(null)}
            >
              <X size={22} />
            </button>
            <p className="eyebrow">
              <Sparkles size={16} />
              {randomResult ? t.winner : t.yourPick}
            </p>
            <div className={`winner-art ${winner.color}`}>
              <FoodArt kind={winner.food} />
            </div>
            <h2 id="winner-heading">{winner.name[locale]}</h2>
            <p>
              {winner.cuisine === "all" ? t.restaurant : t[winner.cuisine]} ·{" "}
              <span className="google-attribution" translate="no">
                Google Maps
              </span>
            </p>
            <p>
              {winner.street[locale]} ·{" "}
              {new Intl.NumberFormat(locale, {
                maximumFractionDigits: 1,
              }).format(distanceKm(center, winner.point))}{" "}
              {t.km}
            </p>
            <span className={`place-status ${winner.status}`}>
              <i />
              {
                t[
                  winner.status === "open"
                    ? "open"
                    : winner.status === "closed"
                      ? "closed"
                      : "unknown"
                ]
              }
            </span>
            {winner.attributions?.map((a, i) => (
              <p key={i}>
                {a.provider}
                {a.providerUri?.startsWith("https://") && (
                  <a href={a.providerUri} target="_blank" rel="noreferrer">
                    {" "}
                    ↗
                  </a>
                )}
              </p>
            ))}
            <a
              className="secondary"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(winner.name[locale])}&query_place_id=${encodeURIComponent(winner.id)}`}
              target="_blank"
              rel="noreferrer"
            >
              {t.mapsLink}
            </a>
            <div className="winner-note">
              {mode === "order" ? t.noOrder : t.noNavigation}
            </div>
            <div className="winner-actions">
              <button
                className="draw-button"
                onClick={() => {
                  setWinner(null);
                  void draw();
                }}
                disabled={drawing || !openPlaces.length}
              >
                <RotateCw size={18} />
                {t.again}
              </button>
              <button
                className="secondary"
                onClick={() => {
                  setWinner(null);
                  showGames();
                }}
              >
                <Gamepad2 size={18} />
                {t.gamesCta}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </main>
  );
}
