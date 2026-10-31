import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin } from "lucide-react";

import {
  getDict,
  languageNames,
  locales,
  type Locale,
} from "@/i18n";

export default function Footer({ lang }: { lang: Locale }) {
  const dict = getDict(lang);

  const navLinks = [
    { key: "home" as const, path: "" },
    { key: "cars" as const, path: "/cars" },
    { key: "gallery" as const, path: "/gallery" },
    { key: "services" as const, path: "/services" },
    { key: "about" as const, path: "/about" },
    { key: "contactLink" as const, path: "/contact" },
  ];

  const infoLinks = [
    { key: "terms" as const, path: "/terms" },
    { key: "privacy" as const, path: "/privacy" },
  ];

  return (
    <footer className="border-t border-white/10 bg-[#070707]">
      <div className="container-luxe py-14 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr_1.2fr] lg:gap-12">
          <div>
            <Link
              href={`/${lang}`}
              aria-label="ATLAS DRIVE"
              className="inline-flex items-center text-xl font-black uppercase leading-none tracking-[0.24em]"
            >
              <span className="text-ivory">ATLAS</span>
              <span className="text-gold">DRIVE</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/55">
              {dict.footer.tagline}
            </p>
            <Link
              href={`/${lang}/booking`}
              className="btn-gold mt-7 !min-h-11 !px-5 !text-[10px]"
            >
              {dict.navbar.book}
              <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            </Link>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
              {dict.footer.navigation}
            </h2>
            <ul className="mt-5 space-y-3">
              {navLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={`/${lang}${link.path}`}
                    className="inline-flex min-h-8 items-center text-sm text-white/60 transition-colors hover:text-gold-soft"
                  >
                    {dict.footer[link.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
              {dict.footer.information}
            </h2>
            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  href={`/${lang}/faq`}
                  className="inline-flex min-h-8 items-center text-sm text-white/60 transition-colors hover:text-gold-soft"
                >
                  {dict.footer.faq}
                </Link>
              </li>
              {infoLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={`/${lang}${link.path}`}
                    className="inline-flex min-h-8 items-center text-sm text-white/60 transition-colors hover:text-gold-soft"
                  >
                    {dict.footer[link.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
              {dict.footer.contact}
            </h2>
            <ul className="mt-5 space-y-4 text-sm text-white/60">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                <span>{dict.footer.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                <a
                  href={`mailto:${dict.contact.emailValue}`}
                  className="break-all transition-colors hover:text-gold-soft"
                >
                  {dict.contact.emailValue}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                <span>{dict.contact.hoursValue}</span>
              </li>
            </ul>

            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1">
              {locales.map((locale) => (
                <Link
                  key={locale}
                  href={`/${locale}`}
                  hrefLang={locale}
                  lang={locale}
                  className={`inline-flex min-h-8 items-center text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    locale === lang
                      ? "text-gold"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {languageNames[locale]}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} ATLAS DRIVE. {dict.footer.rights}
          </p>
          <p className="uppercase tracking-[0.18em]">
            Casablanca · Maroc
          </p>
        </div>
      </div>
    </footer>
  );
}
