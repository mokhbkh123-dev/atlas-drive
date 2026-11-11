"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { getDict, type Locale } from "@/i18n";

/** Same key the no-flash script in app/[lang]/layout.tsx reads at first paint. */
const STORAGE_KEY = "atlas-theme";

export default function ThemeToggle({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  const [isDark, setIsDark] = useState(false);

  // The inline script already decided the class before paint; mirror it here
  // so the icon and the accessible name match what the user actually sees.
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    setIsDark(next === "dark");
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage disabled (private mode): the switch still works for this page.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? dict.common.themeToLight : dict.common.themeToDark}
      aria-pressed={isDark}
      title={isDark ? dict.common.themeToLight : dict.common.themeToDark}
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white/80 transition-colors hover:border-bronze-light hover:text-bronze-light"
    >
      <Moon className="h-5 w-5 dark:hidden" aria-hidden />
      <Sun className="hidden h-5 w-5 dark:block" aria-hidden />
    </button>
  );
}
