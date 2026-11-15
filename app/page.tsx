"use client";
import Link from "next/link";
import { useLanguage } from "./use-language";
import { Arcade } from "./arcade";
import { FavoriteButton } from "./member";
import { InstallCard, useInstall } from "./install";
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
  Heart,
  MapPin,
  LocateFixed,
  RotateCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Utensils,
  UserRound,
  X,
} from "lucide-react";
import {
  choosePlace,
  distanceKm,
  type Cuisine,
  type Place,
  type Point,
} from "@/lib/places";
import { liveProvider } from "@/lib/live-places";
import {
  readLocation,
  saveLocation,
  clearLocation,
} from "@/lib/saved-location";
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
  const install = useInstall();
  const [installHelp, setInstallHelp] = useState(false);
  const { locale } = useLanguage();
  const t = copy[locale];
  const [view, setView] = useState<"discover" | "play">("discover");
  const [mode, setMode] = useState<"eat" | "order">("eat");
  const [area, setArea] = useState("");
  const [editingLocation, setEditingLocation] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const autocompleteToken = useRef("");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationMatches, setLocationMatches] = useState<
    import("@/lib/live-places").LocationMatch[]
  >([]);
  const [locationMessage, setLocationMessage] = useState("");
  const [center, setCenter] = useState<Point | null>(null);
  const [radius, setRadius] = useState(3);
  const [cuisine, setCuisine] = useState<Cuisine>("all");
  const [openOnly, setOpenOnly] = useState(true);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [savedDevice, setSavedDevice] = useState(false);
  const [locationRestored, setLocationRestored] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState<{
    point: Point;
    accuracy: number;
    address: string | null;
    pending: boolean;
  } | null>(null);
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
    const saved = readLocation();
    if (saved) {
      // Restore browser-only storage after hydration; the server cannot read it.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCenter(saved.point);
      setArea("device");
      setDeviceDetails({ ...saved, address: null, pending: false });
      setSavedDevice(true);
      setLocationRestored(true);
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
  }, [locale]);
  useEffect(() => {
    if (!center) return;
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
    setLoading(Boolean(center));
    setPlaces([]);
    setError(null);
  };
  useEffect(() => {
    if (!editingLocation || locationQuery.trim().length < 3) return;
    const controller = new AbortController();
    const request = locationEpoch.current;
    const timer = setTimeout(async () => {
      setLocationBusy(true);
      autocompleteToken.current ||= crypto.randomUUID();
      try {
        const matches = await liveProvider.autocomplete(
          locationQuery.trim(),
          locale,
          autocompleteToken.current,
          controller.signal,
        );
        if (!controller.signal.aborted && request === locationEpoch.current) {
          setLocationMatches(matches);
          setActiveSuggestion(-1);
          setLocationMessage(matches.length ? "" : t.noLocations);
        }
      } catch {
        if (!controller.signal.aborted && request === locationEpoch.current)
          setLocationMessage(t.locationFailed);
      } finally {
        if (!controller.signal.aborted && request === locationEpoch.current)
          setLocationBusy(false);
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [editingLocation, locationQuery, locale, t.noLocations, t.locationFailed]);
  async function chooseLocation(
    match: import("@/lib/live-places").LocationMatch,
  ) {
    const request = ++locationEpoch.current;
    setEditingLocation(false);
    setLocationBusy(true);
    setLocationMatches([]);
    try {
      const point =
        match.point ??
        (await liveProvider.resolveLocation(
          match.id,
          locale,
          autocompleteToken.current,
        ));
      if (request !== locationEpoch.current) return;
      invalidate();
      clearLocation();
      setSavedDevice(false);
      setLocationRestored(false);
      setDeviceDetails(null);
      setCenter(point);
      setArea(match.label);
      setLocationQuery(match.label);
      setLocationMessage("");
    } catch {
      if (request === locationEpoch.current)
        setLocationMessage(t.locationFailed);
    } finally {
      if (request === locationEpoch.current) {
        setLocationBusy(false);
        autocompleteToken.current = "";
      }
    }
  }
  function locate() {
    setEditingLocation(false);
    autocompleteToken.current = "";
    if (!navigator.geolocation) {
      setError("unavailable");
      return;
    }
    setLocationBusy(true);
    setLocationMatches([]);
    setLocationMessage("");
    setError(null);
    const request = ++locationEpoch.current;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (request !== locationEpoch.current) return;
        invalidate();
        const point = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocationRestored(false);
        if (savedDevice) saveLocation(point, position.coords.accuracy);
        setCenter(point);
        setArea("device");
        setLocationQuery(
          locale === "he" ? "המיקום הנוכחי שלי" : "My current location",
        );
        setDeviceDetails({
          point,
          accuracy: position.coords.accuracy,
          address: null,
          pending: true,
        });
        setLocationBusy(false);
        liveProvider
          .reverseLocation(point, locale)
          .then((address) => {
            if (request !== locationEpoch.current) return;
            setDeviceDetails({
              point,
              accuracy: position.coords.accuracy,
              address,
              pending: false,
            });
            if (address) setLocationQuery(address);
            else
              setLocationMessage(
                locale === "he"
                  ? "המיקום זוהה, אך לא התקבלה כתובת. החיפוש משתמש במיקום שזוהה."
                  : "Location found, but no address was returned. Search uses your detected location.",
              );
          })
          .catch(() => {
            if (request === locationEpoch.current) {
              setLocationMessage(
                locale === "he"
                  ? "המיקום זוהה, אך לא התקבלה כתובת. החיפוש משתמש במיקום שזוהה."
                  : "Location found, but no address was returned. Search uses your detected location.",
              );
              setDeviceDetails({
                point,
                accuracy: position.coords.accuracy,
                address: null,
                pending: false,
              });
            }
          });
      },
      (e) => {
        if (request !== locationEpoch.current) return;
        setError(
          e.code === 1 ? "denied" : e.code === 3 ? "timeout" : "unavailable",
        );
        setLocationBusy(false);
      },
      { timeout: 15000, maximumAge: 30000, enableHighAccuracy: true },
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
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
          document.documentElement.hasAttribute("data-reduce-motion")
          ? 0
          : 850,
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
    <div className="app">
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
              aria-current={view === "discover" ? "page" : undefined}
              onClick={() => setView("discover")}
            >
              <Compass size={17} />
              {t.discover}
            </button>
            <button
              className={view === "play" ? "nav-item active" : "nav-item"}
              aria-current={view === "play" ? "page" : undefined}
              onClick={showGames}
            >
              <Gamepad2 size={18} />
              {t.play}
            </button>
          </nav>
          <div className="header-actions">
            <Link
              href="/profile"
              className="profile-icon"
              aria-label={locale === "he" ? "הפרופיל שלי" : "My profile"}
              title={locale === "he" ? "הפרופיל שלי" : "My profile"}
            >
              <UserRound size={21} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>
      <div className="demo-strip">
        <span className="status-dot" />
        {t.demo}
        <span className="strip-divider">/</span>
        <span>{t.strip}</span>
      </div>
      <main id="main-content" tabIndex={-1}>
        {view === "discover" ? (
          <>
            <section className="app-intro shell">
              <div>
                <h1>
                  {t.heroA} <span>{t.heroB}</span>
                </h1>
                <p>
                  {locale === "he"
                    ? "בוחרים מיקום. מגרילים. אוכלים."
                    : "Pick a spot. Shuffle. Eat."}
                </p>
              </div>
              <div className="app-intro-mascot" aria-hidden="true">
                <Mascot />
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
                  <div className="address-bar">
                    <input
                      id="area"
                      role="combobox"
                      aria-autocomplete="list"
                      aria-expanded={locationMatches.length > 0}
                      aria-controls="address-suggestions"
                      aria-activedescendant={
                        activeSuggestion >= 0 &&
                        locationMatches[activeSuggestion]
                          ? `address-option-${activeSuggestion}`
                          : undefined
                      }
                      autoComplete="off"
                      value={locationQuery}
                      maxLength={200}
                      placeholder={
                        area === "device" ? t.device : t.locationPlaceholder
                      }
                      onChange={(e) => {
                        locationEpoch.current++;
                        setEditingLocation(true);
                        setLocationBusy(false);
                        setLocationMatches([]);
                        setActiveSuggestion(-1);
                        setLocationMessage("");
                        setLocationQuery(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setEditingLocation(false);
                          setLocationMatches([]);
                          setActiveSuggestion(-1);
                        }
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setActiveSuggestion((v) =>
                            Math.min(v + 1, locationMatches.length - 1),
                          );
                        }
                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setActiveSuggestion((v) => Math.max(v - 1, 0));
                        }
                        if (e.key === "Enter" && locationMatches.length) {
                          e.preventDefault();
                          void chooseLocation(
                            locationMatches[Math.max(0, activeSuggestion)],
                          );
                        }
                      }}
                    />
                    <button
                      className="location-icon"
                      type="button"
                      onClick={locate}
                      disabled={locationBusy}
                      aria-label={t.locate}
                      title={t.locate}
                      aria-describedby="location-notice"
                    >
                      <LocateFixed size={23} />
                    </button>
                  </div>
                  {area === "device" &&
                    deviceDetails?.pending &&
                    !editingLocation && (
                      <span className="field-hint" role="status">
                        {locale === "he"
                          ? "מזהים את הכתובת…"
                          : "Finding your address…"}
                      </span>
                    )}
                  {locationBusy && (
                    <span className="field-hint" role="status">
                      {t.locating}
                    </span>
                  )}
                  <p className="field-hint" role="status">
                    {center
                      ? `${t.searchAround} ${area === "device" ? (deviceDetails?.address ?? t.device) : area}`
                      : t.pickLocation}
                  </p>
                  <details className="location-details">
                    <summary>
                      {locale === "he"
                        ? "פרטי מיקום ושמירה"
                        : "Location details and storage"}
                    </summary>
                    {area === "device" && deviceDetails && (
                      <div className="field-hint">
                        {locationRestored && (
                          <p role="status">
                            {locale === "he"
                              ? "משתמשים במיקום האחרון שנשמר. עברתם מקום? לחצו על קרוב אליי לעדכון."
                              : "Using your last saved location. Moved? Use Near me to update."}
                          </p>
                        )}
                        <label>
                          <input
                            type="checkbox"
                            checked={savedDevice}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const saved = saveLocation(
                                  deviceDetails.point,
                                  deviceDetails.accuracy,
                                );
                                setSavedDevice(saved);
                                if (!saved)
                                  setLocationMessage(
                                    locale === "he"
                                      ? "הדפדפן אינו מאפשר לשמור מיקום."
                                      : "Your browser could not save the location.",
                                  );
                              } else {
                                clearLocation();
                                setSavedDevice(false);
                                setLocationRestored(false);
                              }
                            }}
                          />{" "}
                          {locale === "he"
                            ? "זכרו את מיקום המכשיר ל־7 ימים במכשיר הזה"
                            : "Remember device location for 7 days on this device"}
                        </label>
                        {deviceDetails.address && (
                          <span translate="no">Google Maps</span>
                        )}
                      </div>
                    )}
                    {area === "device" && deviceDetails && (
                      <div className="field-hint" role="status">
                        <p>
                          {locale === "he"
                            ? "דיוק משוער:"
                            : "Estimated accuracy:"}{" "}
                          {Math.ceil(deviceDetails.accuracy)}{" "}
                          {locale === "he" ? "מטרים" : "metres"}
                        </p>
                        {!deviceDetails.address && (
                          <p>
                            {deviceDetails.pending
                              ? locale === "he"
                                ? "מזהים את שם המקום…"
                                : "Finding the address…"
                              : locale === "he"
                                ? "המיקום זוהה, אך שם הכתובת אינו זמין. החיפוש מתבצע סביב הנקודה הזו:"
                                : "Location found, but the address is unavailable. Searching around this point:"}{" "}
                            <bdi>
                              {deviceDetails.point.lat.toFixed(5)},{" "}
                              {deviceDetails.point.lng.toFixed(5)}
                            </bdi>
                          </p>
                        )}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${deviceDetails.point.lat},${deviceDetails.point.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {locale === "he"
                            ? "בדיקת המיקום במפה"
                            : "Check location on map"}
                        </a>
                      </div>
                    )}
                    <span id="location-notice" className="field-hint">
                      {locationBusy ? t.locating : t.demoArea}
                    </span>{" "}
                  </details>
                  {locationMessage && <p role="status">{locationMessage}</p>}
                  {locationMatches.length > 0 && (
                    <ul
                      className="location-matches"
                      id="address-suggestions"
                      role="listbox"
                      aria-label={t.locationResults}
                    >
                      {locationMatches.map((match, index) => (
                        <li
                          key={match.id}
                          role="option"
                          aria-selected={activeSuggestion === index}
                          id={`address-option-${index}`}
                        >
                          <button
                            type="button"
                            onClick={() => chooseLocation(match)}
                          >
                            {match.label}
                          </button>
                        </li>
                      ))}
                      <li
                        role="presentation"
                        className="field-hint"
                        translate="no"
                      >
                        Google Maps
                      </li>
                    </ul>
                  )}
                </div>
              </div>
              <details className="search-filters">
                <summary>
                  <SlidersHorizontal size={16} />
                  {locale === "he" ? "סינון והתאמה" : "Filters"} · {radius}{" "}
                  {t.km} · {cuisine === "all" ? t.any : t[cuisine]}
                </summary>
                <div className="controls filter-controls">
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
              </details>
              {error && (
                <p role="alert" className="error">
                  {t[error]}
                  <button
                    className="secondary"
                    onClick={() => {
                      if (!center) {
                        document.getElementById("area")?.focus();
                        return;
                      }
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
                <p role="status">
                  {loading
                    ? locale === "he"
                      ? "מחפשים מסעדות בסביבה…"
                      : "Searching nearby restaurants…"
                    : !center
                      ? t.pickLocation
                      : !error && !openPlaces.length && places.length > 0
                        ? locale === "he"
                          ? `נמצאו ${places.length} מקומות, אך אף אחד מהם לא מסומן כפתוח עכשיו. ההגרלה זמינה רק למקומות פתוחים.`
                          : `${places.length} places found, but none is confirmed open now. Drawing requires an open place.`
                        : !error && !places.length
                          ? locale === "he"
                            ? "לא נמצאו מקומות מתאימים בתוצאות שהתקבלו. נסו מיקום או סינון אחר."
                            : "No matching places in the returned results. Try another location or filter."
                          : openPlaces.length === 1
                            ? t.one
                            : t.fair}
                </p>
                {!loading && center && !error && !openPlaces.length && (
                  <p className="field-hint">
                    {locale === "he"
                      ? "נבדקות עד 20 תוצאות קרובות — לא כל המסעדות ברדיוס. ביטול מסנן הפתוחות מציג גם סגורות ושעות לא ידועות; הוא אינו מכניס אותן להגרלה."
                      : "Up to 20 nearby results are checked, not every restaurant in the radius. Turning off Open now shows closed and unknown-hours places, but does not add them to the draw."}
                  </p>
                )}
                {!loading && places.length > 0 && (
                  <a href="#restaurant-results">
                    {locale === "he"
                      ? `לצפייה ב־${places.length} המקומות שנמצאו ↓`
                      : `View ${places.length} places found ↓`}
                  </a>
                )}
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
            {center && (
              <section
                id="restaurant-results"
                className="results shell"
                aria-busy={loading}
              >
                <p className="sr-only" role="status">
                  {loading
                    ? locale === "he"
                      ? "מחפשים מסעדות…"
                      : "Searching for restaurants…"
                    : `${places.length} ${t.results}`}
                </p>
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
                {loading ? (
                  <p role="status">
                    {locale === "he"
                      ? "מחפשים מסעדות…"
                      : "Searching for restaurants…"}
                  </p>
                ) : places.length ? (
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
                            }).format(distanceKm(center!, p.point))}{" "}
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
                ) : error ? null : (
                  <div className="empty">
                    <Search size={36} />
                    <h3>{center ? t.empty : t.pickLocation}</h3>
                    <p>{center ? t.emptyBody : t.locationPlaceholder}</p>
                    <button
                      className="secondary"
                      onClick={() => {
                        if (!center) {
                          document.getElementById("area")?.focus();
                          return;
                        }
                        invalidate();
                        setRefresh((value) => value + 1);
                        setRadius(3);
                        setCuisine("all");
                      }}
                    >
                      {center ? t.reset : t.locationSearch}
                    </button>
                  </div>
                )}
                <p className="disclaimer">
                  <span>ⓘ</span>
                  {t.disclaimer}
                </p>
              </section>
            )}

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
            <Arcade locale={locale} />
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
                    <InstallCard
                      locale={locale}
                      install={install}
                      placement="game"
                    />
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
                      <span role="status">
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
      </main>
      {installHelp && (
        <div className="shell">
          <InstallCard
            locale={locale}
            install={install}
            manual
            placement="footer"
            onClose={() => setInstallHelp(false)}
          />
        </div>
      )}
      <footer
        className="shell"
        aria-label={
          locale === "he" ? "Munchadoo והתקנה" : "Munchadoo and installation"
        }
      >
        {install.state.ready && !install.state.installed && (
          <button
            className="text-button"
            aria-expanded={installHelp}
            onClick={() => setInstallHelp((v) => !v)}
          >
            {locale === "he" ? "הוספה למסך הבית" : "Add to home screen"}
          </button>
        )}
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
            <FavoriteButton id={winner.id} locale={locale} />
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
              }).format(distanceKm(center!, winner.point))}{" "}
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
            <InstallCard
              locale={locale}
              install={install}
              placement="restaurant"
            />
          </div>
        )}
      </dialog>
    </div>
  );
}
