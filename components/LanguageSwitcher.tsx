"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { getDict, locales, type Locale } from "@/i18n";

const languageCodes: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
  ar: "AR",
};

/** Remember the visitor's language choice for future visits (read by proxy.ts). */
function persistLocale(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
}

/** Compact `FR | EN | AR` switch used in the header and the mobile drawer. */
export default function LanguageSwitcher({
  lang,
  tone = "dark",
}: {
  lang: Locale;
  /** `dark` sits on the green header, `light` on a cream surface. */
  tone?: "dark" | "light";
}) {
  // Reading the query string bails out to client rendering up to the nearest
  // boundary; the fallback is the identical markup minus the query.
  return (
    <Suspense fallback={<Switcher lang={lang} tone={tone} query="" />}>
      <QueryAwareSwitcher lang={lang} tone={tone} />
    </Suspense>
  );
}

function QueryAwareSwitcher({ lang, tone }: { lang: Locale; tone?: "dark" | "light" }) {
  const searchParams = useSearchParams();
  const serialized = searchParams?.toString() ?? "";
  return <Switcher lang={lang} tone={tone} query={serialized ? `?${serialized}` : ""} />;
}

function Switcher({
  lang,
  tone = "dark",
  query,
}: {
  lang: Locale;
  tone?: "dark" | "light";
  query: string;
}) {
  const pathname = usePathname();
  const dict = getDict(lang);

  // Current path without the /xx locale prefix.
  const pathWithoutLocale = pathname.replace(/^\/(fr|en|ar)(?=\/|$)/, "") || "/";
  const base = pathWithoutLocale === "/" ? "" : pathWithoutLocale;

  const onBar = tone === "dark";

  return (
    <nav
      aria-label={dict.common.switchLanguage}
      role="group"
      className="flex items-center gap-1"
    >
      {locales.map((locale, index) => {
        const active = locale === lang;
        return (
          <span key={locale} className="flex items-center gap-1">
            {index > 0 && (
              <span
                aria-hidden
                className={`text-xs ${onBar ? "text-white/40" : "text-line-strong"}`}
              >
                |
              </span>
            )}
            <Link
              href={`/${locale}${base}${query}`}
              hrefLang={locale}
              lang={locale}
              aria-current={active ? "true" : undefined}
              onClick={() => persistLocale(locale)}
              className={`flex min-h-8 items-center px-1 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                active
                  ? onBar
                    ? "text-bronze-light"
                    : "text-bronze-dark"
                  : onBar
                    ? "text-white/55 hover:text-white"
                    : "text-muted hover:text-ink"
              }`}
            >
              {languageCodes[locale]}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
