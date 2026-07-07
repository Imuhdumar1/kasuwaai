"use client";

import * as React from "react";
import { Lang, translate } from "@/lib/i18n";
import { ToastProvider } from "@/components/toast";

/* ─── i18n context ────────────────────────────────────────────────────── */
type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};
const I18nContext = React.createContext<I18nValue | null>(null);

export function useI18n(): I18nValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <Providers>");
  return ctx;
}
/** Convenience: just the translate function. */
export function useT() {
  return useI18n().t;
}

/* ─── theme context ───────────────────────────────────────────────────── */
type Theme = "light" | "dark";
type ThemeValue = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };
const ThemeContext = React.createContext<ThemeValue | null>(null);

export function useTheme(): ThemeValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <Providers>");
  return ctx;
}

const LANG_KEY = "kasuwa_lang";
const THEME_KEY = "kasuwa_theme";

export function Providers({
  children,
  initialLang = "en",
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = React.useState<Lang>(initialLang);
  const [theme, setThemeState] = React.useState<Theme>("light");

  // Hydrate preferences from storage after mount (avoids SSR mismatch).
  React.useEffect(() => {
    const storedLang = localStorage.getItem(LANG_KEY) as Lang | null;
    if (storedLang === "en" || storedLang === "ha") setLangState(storedLang);

    const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    const initial =
      storedTheme ??
      (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setThemeState(initial);
  }, []);

  // Reflect theme onto <html> and persist.
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
    document.documentElement.lang = l;
  }, []);

  const i18n = React.useMemo<I18nValue>(
    () => ({ lang, setLang, t: (key, vars) => translate(lang, key, vars) }),
    [lang, setLang],
  );
  const themeValue = React.useMemo<ThemeValue>(
    () => ({
      theme,
      setTheme: setThemeState,
      toggle: () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={themeValue}>
      <I18nContext.Provider value={i18n}>
        <ToastProvider>{children}</ToastProvider>
      </I18nContext.Provider>
    </ThemeContext.Provider>
  );
}
