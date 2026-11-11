import Link from "next/link";
import {
  ArrowRight,
  Check,
  Headset,
  MapPin,
  Quote,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getDict, resolveLocale } from "@/i18n";

const advantageIcons = [ShieldCheck, Wallet, MapPin, Headset];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  const [featuredCar, publishedCars, categories] = await Promise.all([
    prisma.car.findFirst({
      where: { status: "PUBLISHED", images: { some: {} } },
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
      },
    }),
    prisma.car.count({ where: { status: "PUBLISHED" } }),
    prisma.car.findMany({
      where: { status: "PUBLISHED" },
      distinct: ["category"],
      select: { category: true },
    }),
  ]);

  // Every figure shown on this page comes from the live fleet, never from
  // marketing copy: no invented years of experience or client counts.
  const stats = [
    { value: String(publishedCars), label: dict.about.statsFleet },
    { value: String(categories.length), label: dict.about.statsCategories },
    { value: String(dict.destinations.items.length), label: dict.about.statsDestinations },
  ];

  const photo = featuredCar?.images[0] ?? null;

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
            <span className="text-ink">{dict.navbar.about}</span>
          </nav>

          <div className="mt-7 max-w-3xl">
            <p className="eyebrow">{dict.about.eyebrow}</p>
            <h1 className="heading-display mt-4 text-balance text-4xl sm:text-5xl lg:text-[3.5rem]">
              ATLAS <span className="text-bronze">DRIVE</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
              {dict.about.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------- Story ------------------------------- */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="container-site">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
            <div>
              <div className="rule-gold w-24" />
              <p className="mt-6 text-sm leading-7 text-muted sm:text-base sm:leading-8">
                {dict.about.intro1}
              </p>
              <p className="mt-4 text-sm leading-7 text-muted sm:text-base sm:leading-8">
                {dict.about.intro2}
              </p>

              <dl className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="card-site card-hover p-5 text-center"
                  >
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <span className="block font-display text-3xl font-bold text-bronze-dark sm:text-4xl">
                        {stat.value}
                      </span>
                      <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                        {stat.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href={`/${lang}/cars`} className="btn-dark">
                  {dict.home.ctaPrimary}
                  <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
                </Link>
                <Link href={`/${lang}/contact`} className="btn-outline-dark">
                  {dict.navbar.contact}
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="card-site overflow-hidden">
                {photo ? (
                  <img
                    src={photo.url}
                    alt={photo.alt || featuredCar?.name || "ATLAS DRIVE"}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="zellige aspect-[4/3] w-full bg-gradient-to-br from-forest-soft via-forest to-forest-deep" />
                )}
              </div>

              <figure className="relative isolate mt-6 overflow-hidden rounded-xl bg-forest p-7 sm:mt-8 sm:p-8">
                <div aria-hidden className="zellige absolute inset-0 opacity-50" />
                <div className="relative">
                  <Quote className="h-7 w-7 text-bronze-light rtl:-scale-x-100" aria-hidden />
                  <blockquote className="mt-4 text-balance font-display text-lg leading-8 text-white sm:text-xl sm:leading-9">
                    {dict.home.heroText}
                  </blockquote>
                  <figcaption className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-bronze-light">
                    ATLAS DRIVE
                  </figcaption>
                </div>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ Advantages --------------------------- */}
      <section className="border-y border-line bg-cream-2 py-14 sm:py-16 lg:py-20">
        <div className="container-site">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow eyebrow-center justify-center">
              {dict.home.advantagesEyebrow}
            </p>
            <h2 className="heading-display mt-3 text-3xl sm:text-4xl">
              {dict.home.advantagesTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
              {dict.home.advantagesText}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {dict.home.advantages.map((advantage, index) => {
              const Icon = advantageIcons[index] ?? ShieldCheck;
              return (
                <div key={advantage.title} className="card-site card-hover flex gap-4 p-6">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-forest-tint text-forest-ink">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-ink">{advantage.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted">{advantage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------- Services ---------------------------- */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="container-site">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">{dict.services.subtitle}</p>
              <h2 className="heading-display mt-3 text-3xl sm:text-4xl">
                {dict.services.title} <span className="text-bronze">{dict.services.titleHighlight}</span>
              </h2>
            </div>
            <Link href={`/${lang}/services`} className="btn-outline-dark self-start sm:self-auto">
              {dict.navbar.services}
            </Link>
          </div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dict.services.items.map((service) => (
              <li key={service.title} className="card-site card-hover p-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-bronze-soft text-bronze-dark">
                  <Check className="h-4 w-4" aria-hidden />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-ink">{service.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted">{service.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* -------------------------------- CTA -------------------------------- */}
      <section className="relative isolate overflow-hidden bg-forest py-16 sm:py-20">
        <div aria-hidden className="zellige absolute inset-0 opacity-60" />
        <div className="container-site relative">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="eyebrow eyebrow-light">{dict.home.heroBadge}</p>
              <h2 className="mt-3 text-balance font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                {dict.home.ctaTitle}
              </h2>
              <p className="mt-4 text-base leading-7 text-white/70">{dict.home.ctaText}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/${lang}/booking`} className="btn-primary w-full sm:w-auto">
                {dict.navbar.book}
              </Link>
              <Link href={`/${lang}/destinations`} className="btn-outline w-full sm:w-auto">
                {dict.home.destinationsCta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
