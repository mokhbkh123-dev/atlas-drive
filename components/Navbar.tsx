"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, Menu, Mountain, X } from "lucide-react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { getDict, type Locale } from "@/i18n";

const navKeys = ["home", "cars", "destinations", "about", "contact"] as const;

const navHrefs: Record<(typeof navKeys)[number], string> = {
  home: "",
  cars: "/cars",
  destinations: "/destinations",
  about: "/about",
  contact: "/contact",
};

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
    const onScroll = () => setScrolled(window.scrollY > 8);
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
      className={`sticky inset-x-0 top-0 z-50 border-b bg-forest transition-shadow duration-300 ${
        scrolled
          ? "border-white/10 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.9)]"
          : "border-white/5"
      }`}
    >
      <nav
        aria-label="Main navigation"
        className="container-site flex h-16 items-center justify-between gap-4"
      >
        <Link
          href={`/${lang}`}
          aria-label="ATLAS DRIVE"
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-bronze/40 bg-bronze/15 transition-colors group-hover:bg-bronze/25">
            <Mountain className="h-5 w-5 text-bronze-light" aria-hidden />
          </span>
          <span className="leading-none">
            <span className="block font-display text-base font-bold tracking-[0.16em] text-white sm:text-lg">
              ATLAS <span className="text-bronze-light">DRIVE</span>
            </span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.22em] text-white/70">
              {dict.navbar.logoTagline}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex xl:gap-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`group relative flex min-h-11 items-center text-[13px] font-medium transition-colors ${
                item.active ? "text-white" : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
              <span
                aria-hidden
                className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-center rounded-full bg-bronze-light transition-transform duration-300 ${
                  item.active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle lang={lang} />

          <div className="hidden lg:block">
            <LanguageSwitcher lang={lang} />
          </div>

          <Link
            href={`/${lang}/booking`}
            className="hidden min-h-9 items-center rounded-full bg-bronze px-4 text-[11px] font-bold uppercase tracking-[0.1em] text-bronze-foreground transition-colors hover:bg-bronze-dark sm:inline-flex"
          >
            {dict.navbar.book}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? dict.navbar.close : dict.navbar.menu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white transition-colors hover:border-bronze-light hover:text-bronze-light lg:hidden"
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
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-forest-deep lg:hidden"
        >
          <div className="container-site flex min-h-full flex-col py-6">
            <nav aria-label="Mobile navigation" className="flex flex-col">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={item.active ? "page" : undefined}
                  className={`flex min-h-14 items-center justify-between border-b border-white/10 text-lg font-medium transition-colors ${
                    item.active ? "text-bronze-light" : "text-white/85 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-bronze/60" />
                </Link>
              ))}
            </nav>

            <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                {dict.common.switchLanguage}
              </p>
              <LanguageSwitcher lang={lang} />
            </div>

            <div className="mt-auto space-y-3 pt-8">
              <Link
                href={`/${lang}/booking`}
                onClick={() => setOpen(false)}
                className="btn-primary w-full"
              >
                {dict.navbar.book}
              </Link>
              <a
                href="mailto:contact@atlasdrive.ma"
                className="flex min-h-11 items-center justify-center gap-2 text-sm text-white/55 transition-colors hover:text-bronze-light"
              >
                <Mail className="h-4 w-4" aria-hidden />
                contact@atlasdrive.ma
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
