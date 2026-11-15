"use client";
import { useEffect, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/places";
const key = "munchadoo.language";
let fallback = "auto";
function preference() {
  try {
    const value = localStorage.getItem(key);
    return value === "he" || value === "en" ? value : "auto";
  } catch {
    return fallback;
  }
}
function snapshot() {
  const selected = preference();
  const language = (
    navigator.languages?.[0] ||
    navigator.language ||
    "en"
  ).toLowerCase();
  const locale =
    selected === "auto"
      ? /^(he|iw)(-|$)/.test(language)
        ? "he"
        : "en"
      : selected;
  return `${selected}:${locale}`;
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("munch-language", listener);
  window.addEventListener("languagechange", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("munch-language", listener);
    window.removeEventListener("languagechange", listener);
  };
}
export function useLanguage() {
  const value = useSyncExternalStore(subscribe, snapshot, () => "auto:he");
  const [selected, locale] = value.split(":") as ["auto" | Locale, Locale];
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
  }, [locale]);
  function setLanguage(next: "auto" | Locale) {
    fallback = next;
    try {
      if (next === "auto") localStorage.removeItem(key);
      else localStorage.setItem(key, next);
    } catch {}
    window.dispatchEvent(new Event("munch-language"));
  }
  return { locale, selected, setLanguage };
}
