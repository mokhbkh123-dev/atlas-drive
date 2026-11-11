import Link from "next/link";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";

import ContactForm from "@/components/ContactForm";
import { getDict, resolveLocale } from "@/i18n";
import { buildWhatsAppUrl, getOwnerWhatsAppNumber } from "@/lib/whatsapp";
import { readSettings, settingOr } from "@/lib/settings";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  const whatsappNumber = await getOwnerWhatsAppNumber();
  const settings = await readSettings();
  const address = settingOr(settings, "contact_address", dict.contact.addressValue);
  const email = settingOr(settings, "contact_email", dict.contact.emailValue);
  const hours = settingOr(settings, "contact_hours", dict.contact.hoursValue);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;

  const rows = [
    {
      icon: MapPin,
      label: dict.contact.addressLabel,
      value: address,
      href: null as string | null,
    },
    {
      icon: Mail,
      label: dict.contact.emailLabel,
      value: email,
      href: `mailto:${email}`,
    },
    {
      icon: Clock,
      label: dict.contact.hoursLabel,
      value: hours,
      href: null,
    },
  ];

  return (
    <div>
      {/* ------------------------------ Header ------------------------------- */}
      <section className="relative isolate overflow-hidden border-b border-line bg-cream-2">
        <div aria-hidden className="paper-grid absolute inset-0" />
        <div className="container-site relative py-12 sm:py-16">
          <nav
            aria-label={dict.footer.navigation}
            className="flex flex-wrap items-center gap-2 text-xs text-muted"
          >
            <Link href={`/${lang}`} className="transition-colors hover:text-bronze-dark">
              {dict.navbar.home}
            </Link>
            <ArrowRight className="h-3.5 w-3.5 text-line-strong rtl:-scale-x-100" aria-hidden />
            <span className="text-ink">{dict.navbar.contact}</span>
          </nav>

          <div className="mt-7 max-w-3xl">
            <p className="eyebrow">{dict.contact.eyebrow}</p>
            <h1 className="heading-display mt-4 text-balance text-4xl sm:text-5xl lg:text-[3.25rem]">
              {dict.contact.title}{" "}
              <span className="text-bronze">{dict.contact.titleHighlight}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted">
              {dict.contact.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------- Info + form ------------------------------ */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="container-site">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
            <div className="space-y-6">
              <div className="card-site divide-y divide-line overflow-hidden">
                {rows.map((row) => (
                  <div key={row.label} className="flex items-start gap-4 p-5 sm:p-6">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-forest-tint text-forest-ink">
                      <row.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="field-label">{row.label}</p>
                      {row.href ? (
                        <a
                          href={row.href}
                          className="mt-1.5 block break-all text-base font-semibold text-ink transition-colors hover:text-bronze-dark"
                        >
                          {row.value}
                        </a>
                      ) : (
                        <p className="mt-1.5 text-base font-semibold text-ink">{row.value}</p>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex items-start gap-4 p-5 sm:p-6">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-bronze-soft text-bronze-dark">
                    <MessageCircle className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="field-label">WhatsApp</p>
                    {whatsappNumber ? (
                      <>
                        <a
                          href={buildWhatsAppUrl(
                            whatsappNumber,
                            `ATLAS DRIVE - ${dict.contact.eyebrow}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          dir="ltr"
                          className="mt-1.5 block text-base font-semibold text-ink transition-colors hover:text-bronze-dark"
                        >
                          +{whatsappNumber}
                        </a>
                        <p className="mt-1 text-xs leading-5 text-muted">
                          {dict.footer.support}
                        </p>
                      </>
                    ) : (
                      <p className="mt-1.5 text-sm leading-6 text-muted">
                        {dict.booking.whatsappMissing}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative isolate overflow-hidden rounded-xl bg-forest p-6 sm:p-7">
                <div aria-hidden className="zellige absolute inset-0 opacity-50" />
                <div className="relative">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-bronze-light">
                    {dict.contact.addressLabel}
                  </p>
                  <p className="mt-3 text-base font-semibold text-white">
                    {address}
                  </p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline mt-5 w-full sm:w-auto"
                  >
                    <MapPin className="h-4 w-4" aria-hidden />
                    Google Maps
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </div>
              </div>
            </div>

            <div className="card-site p-6 sm:p-8">
              <h2 className="heading-display text-2xl sm:text-[1.75rem]">
                {dict.contact.eyebrow}
              </h2>
              <div className="rule-gold mt-4 w-28" />
              <div className="mt-6">
                <ContactForm
                  lang={lang}
                  agencyEmail={email}
                  subject={`ATLAS DRIVE - ${dict.contact.eyebrow}`}
                  labels={{
                    intro: dict.booking.subtitle,
                    name: dict.booking.labels.name,
                    email: dict.contact.emailLabel,
                    submit: dict.booking.submit,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------- Shortcut ---------------------------- */}
      <section className="border-t border-line bg-cream-2 py-12 sm:py-14">
        <div className="container-site flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <h2 className="heading-display text-xl sm:text-2xl">{dict.home.ctaTitle}</h2>
            <p className="mt-2 text-sm leading-7 text-muted">{dict.home.ctaText}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/${lang}/booking`} className="btn-dark">
              {dict.navbar.book}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            </Link>
            <Link href={`/${lang}/cars`} className="btn-outline-dark">
              {dict.home.ctaPrimary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
