import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";

import { getDict, type Locale } from "@/i18n";
import { readSettings, settingOr } from "@/lib/settings";
import { getOwnerWhatsAppNumber } from "@/lib/whatsapp";

/**
 * Public footer: forest green, four columns (brand, quick links, locations,
 * contact) and a legal bar. Gallery/services/FAQ stay reachable from Resources.
 */
export default async function Footer({ lang }: { lang: Locale }) {
  const dict = getDict(lang);

  const quickLinks = [
    { key: "home" as const, path: "" },
    { key: "cars" as const, path: "/cars" },
    { key: "gallery" as const, path: "/gallery" },
    { key: "services" as const, path: "/services" },
    { key: "about" as const, path: "/about" },
    { key: "contactLink" as const, path: "/contact" },
  ];

  const resourceLinks = [
    { label: dict.navbar.destinations, href: `/${lang}/destinations` },
    { label: dict.footer.faq, href: `/${lang}/faq` },
    { label: dict.footer.terms, href: `/${lang}/terms` },
    { label: dict.footer.privacy, href: `/${lang}/privacy` },
  ];

  const locations = dict.destinations.items.slice(0, 4);
  const whatsappNumber = await getOwnerWhatsAppNumber();
  // A value the owner set in /admin/settings replaces the built-in wording.
  const settings = await readSettings();
  const contactEmail = settingOr(settings, "contact_email", dict.contact.emailValue);
  const contactHours = settingOr(settings, "contact_hours", dict.contact.hoursValue);
  const contactAddress = settingOr(settings, "contact_address", dict.footer.address);

  return (
    <footer className="bg-forest text-white/70">
      <div className="container-site py-14 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.9fr_1.1fr] lg:gap-12">
          <div>
            <Link
              href={`/${lang}`}
              aria-label="ATLAS DRIVE"
              className="inline-flex items-center gap-2.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-bronze/40 bg-bronze/15">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-bronze-light"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M3 20 9 8l4 7 2-3 6 8Z" />
                  <path d="M9 8 7 12" opacity=".5" />
                </svg>
              </span>
              <span className="font-display text-lg font-bold tracking-[0.16em] text-white">
                ATLAS <span className="text-bronze-light">DRIVE</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/55">
              {dict.footer.tagline}
            </p>

            <div className="mt-6 flex items-center gap-2">
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white/70 transition-colors hover:border-bronze-light hover:text-bronze-light"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                </a>
              )}
              <a
                href={`mailto:${contactEmail}`}
                aria-label="Email"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white/70 transition-colors hover:border-bronze-light hover:text-bronze-light"
              >
                <Mail className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-bronze-light">
              {dict.footer.quickLinks}
            </h2>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={`/${lang}${link.path}`}
                    className="inline-flex min-h-8 items-center text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {dict.footer[link.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-bronze-light">
              {dict.navbar.destinations}
            </h2>
            <ul className="mt-5 space-y-3">
              {locations.map((place) => (
                <li key={place.slug}>
                  <Link
                    href={`/${lang}/destinations#${place.slug}`}
                    className="inline-flex min-h-8 items-center text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {place.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="mt-8 text-[11px] font-bold uppercase tracking-[0.2em] text-bronze-light">
              {dict.footer.resources}
            </h2>
            <ul className="mt-4 space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-8 items-center text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-bronze-light">
              {dict.footer.contact}
            </h2>
            <ul className="mt-5 space-y-4 text-sm text-white/60">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bronze-light" aria-hidden />
                <span>{contactAddress}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-bronze-light" aria-hidden />
                <a
                  href={`mailto:${contactEmail}`}
                  className="break-all transition-colors hover:text-white"
                >
                  {contactEmail}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-bronze-light" aria-hidden />
                <span>{contactHours}</span>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-bronze-light" aria-hidden />
                <span>{dict.footer.support}</span>
              </li>
            </ul>

            <Link
              href={`/${lang}/booking`}
              className="btn-primary mt-7 w-full !min-h-11 sm:w-auto"
            >
              {dict.navbar.book}
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} ATLAS DRIVE. {dict.footer.rights}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href={`/${lang}/privacy`}
              className="uppercase tracking-[0.12em] transition-colors hover:text-white"
            >
              {dict.footer.privacy}
            </Link>
            <Link
              href={`/${lang}/terms`}
              className="uppercase tracking-[0.12em] transition-colors hover:text-white"
            >
              {dict.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
