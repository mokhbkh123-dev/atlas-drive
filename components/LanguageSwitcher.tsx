"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function LanguageSwitcher({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const dict = getDict(lang);

  // Current path without the /xx locale prefix.
  const pathWithoutLocale = pathname.replace(/^\/(fr|en|ar)(?=\/|$)/, "") || "/";

  return (
    <nav
      aria-label={dict.common.switchLanguage}
      className="inline-flex items-center rounded-full border border-white/15 bg-white/5 p-0.5"
      role="group"
    >
      {locales.map((locale) => {
        const active = locale === lang;
        return (
          <Link
            key={locale}
            href={`/${locale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`}
            hrefLang={locale}
            lang={locale}
            aria-current={active ? "true" : undefined}
            onClick={() => persistLocale(locale)}
            className={`flex min-h-8 items-center justify-center rounded-full px-2.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all duration-200 sm:px-3 ${
              active
                ? "bg-gold text-black shadow-[0_0_0_1px_rgba(201,169,97,0.4)]"
                : "text-white/50 hover:text-white"
            }`}
          >
            {languageCodes[locale]}
          </Link>
        );
      })}
    </nav>
  );
}
