"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getDict, type Locale } from "@/i18n";

const navKeys = ["home", "cars", "gallery", "services", "about", "contact"] as const;

const navHrefs: Record<(typeof navKeys)[number], string> = {
  home: "",
  cars: "/cars",
  gallery: "/gallery",
  services: "/services",
  about: "/about",
  contact: "/contact",
};

/** Remember the visitor's language choice for future visits (read by proxy.ts). */
function persistLocale(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
}

export default function Navbar({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const dict = getDict(lang);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Current path without the /xx locale prefix.
  const pathWithoutLocale = pathname.replace(/^\/(fr|en|ar)(?=\/|$)/, "") || "/";

  const navItems = navKeys.map((key) => ({
    href: `/${lang}${navHrefs[key]}`,
    label: dict.navbar[key],
    active: pathWithoutLocale === (navHrefs[key] || "/"),
  }));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        open || scrolled
          ? "border-white/10 bg-[#060606]/95 backdrop-blur-xl"
          : "border-transparent bg-gradient-to-b from-black/80 via-black/40 to-transparent"
      }`}
    >
      <nav
        aria-label="Main navigation"
        className="container-luxe flex h-20 items-center justify-between gap-3"
      >
        <Link
          href={`/${lang}`}
          aria-label="ATLAS DRIVE"
          className="group flex shrink-0 items-center text-lg font-black uppercase leading-none tracking-[0.24em] sm:text-xl"
        >
          <span className="text-ivory">ATLAS</span>
          <span className="text-gold transition-colors group-hover:text-gold-soft">
            DRIVE
          </span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex xl:gap-9">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`group relative flex min-h-11 items-center text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                item.active
                  ? "text-gold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
              <span
                aria-hidden
                className={`absolute inset-x-0 bottom-1.5 h-px origin-center bg-gold transition-transform duration-300 ${
                  item.active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="hidden lg:flex">
            <LanguageSwitcher lang={lang} />
          </div>

          <Link
            href={`/${lang}/booking`}
            className="btn-gold !min-h-10 !px-4 !text-[9px] sm:!min-h-11 sm:!px-5 sm:!text-[10px]"
          >
            {dict.navbar.book}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? dict.navbar.close : dict.navbar.menu}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-gold hover:text-gold lg:hidden"
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={dict.navbar.menu}
          className="fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto border-t border-white/10 bg-[#070707] lg:hidden"
        >
          <div className="container-luxe flex min-h-full flex-col py-7">
            <nav aria-label="Mobile navigation" className="flex flex-col">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={item.active ? "page" : undefined}
                  className={`flex min-h-14 items-center justify-between border-b border-white/10 py-2 text-xl font-semibold tracking-tight transition-colors ${
                    item.active ? "text-gold" : "text-ivory hover:text-gold-soft"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-white/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="mt-7">
              <p className="eyebrow eyebrow-center">{dict.common.switchLanguage}</p>
              <div className="mt-4 flex justify-center lg:hidden">
                <LanguageSwitcher lang={lang} />
              </div>
            </div>

            <div className="mt-auto space-y-4 pt-8">
              <Link
                href={`/${lang}/booking`}
                onClick={() => setOpen(false)}
                className="btn-gold w-full"
              >
                {dict.navbar.book}
              </Link>
              <a
                href="mailto:contact@atlasdrive.ma"
                className="block text-center text-sm text-white/50 transition-colors hover:text-gold"
              >
                contact@atlasdrive.ma
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
