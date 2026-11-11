import Link from "next/link";
import {
  ArrowRight,
  CarFront,
  Headset,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import CarCategories from "@/components/CarCategories";
import DestinationCard from "@/components/DestinationCard";
import FleetGrid from "@/components/FleetGrid";
import HeroCarousel from "@/components/HeroCarousel";
import SearchBar from "@/components/SearchBar";
import { prisma } from "@/lib/prisma";
import { cityFacets, citySelectOptions } from "@/lib/locations";
import { getDict, resolveLocale, tEnum } from "@/i18n";

const advantageIcons = [ShieldCheck, Wallet, MapPin, Headset];
const trustIcons = [CarFront, Headset, ShieldCheck, MapPin];

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2070&auto=format&fit=crop";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  const cars = await prisma.car.findMany({
    where: { status: "PUBLISHED" },
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
    },
    orderBy: { createdAt: "desc" },
  });

  const cards = cars.map((car) => {
    const image = car.images.find((img) => img.isPrimary) ?? car.images[0];
    return {
      id: car.id,
      slug: car.slug,
      name: car.name,
      brand: car.brand,
      model: car.model,
      category: car.category,
      transmission: car.transmission,
      fuelType: car.fuelType,
      seats: car.seats,
      dailyPrice: car.dailyPrice.toString(),
      imageUrl: image?.url ?? null,
      imageAlt: image?.alt ?? null,
    };
  });

  const createdAt = Object.fromEntries(
    cars.map((car) => [car.id, car.createdAt.toISOString()])
  ) as Record<string, string>;

  const slides = cards
    .filter((car) => car.imageUrl)
    .slice(0, 5)
    .map((car) => ({
      id: car.id,
      imageUrl: car.imageUrl,
      alt: car.imageAlt || car.name || `${car.brand} ${car.model}`,
      name: car.name || `${car.brand} ${car.model}`,
      href: `/${lang}/cars/${car.slug}`,
    }));

  // Only categories that actually exist in the published fleet.
  const categoryValues = Array.from(new Set(cars.map((car) => car.category)));
  const categoryOptions = categoryValues.map((value) => ({
    value,
    label: tEnum(dict, "category", value),
  }));

  const agencies = await prisma.location.findMany({
    where: { isActive: true },
    select: { id: true, city: true },
  });
  const cityOptions = citySelectOptions(cityFacets(agencies), dict.destinations.items);

  return (
    <div>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative isolate overflow-hidden">
        <HeroCarousel slides={slides} fallbackImage={HERO_FALLBACK}>
          <div className="container-site relative flex min-h-[78svh] items-center py-16 sm:py-20">
            <div className="max-w-2xl animate-fade-up pb-28">
              <p className="eyebrow eyebrow-light">{dict.home.heroBadge}</p>

              <h1 className="mt-6 text-balance font-display text-[clamp(2.6rem,7vw,4.75rem)] font-bold leading-[1.02] tracking-tight text-white">
                {dict.home.heroTitleLine1}
                <span className="mt-1 block text-bronze-light">
                  {dict.home.heroTitleLine2}
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
                {dict.home.heroText}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href={`/${lang}/cars`} className="btn-primary w-full sm:w-auto">
                  {dict.home.heroCtaPrimary}
                  <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
                </Link>
                <Link href={`/${lang}/booking`} className="btn-outline w-full sm:w-auto">
                  {dict.home.heroCtaSecondary}
                </Link>
              </div>

              <ul className="mt-10 grid max-w-3xl grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                {dict.home.trustChips.map((chip, index) => {
                  const Icon = trustIcons[index] ?? ShieldCheck;
                  return (
                    <li key={chip.title} className="flex items-start gap-2.5">
                      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-bronze/45 bg-bronze/15 text-bronze-light">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span>
                        <span className="block text-[13px] font-semibold leading-5 text-white">
                          {chip.title}
                        </span>
                        <span className="block text-[11px] leading-4 text-white/55">
                          {chip.desc}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </HeroCarousel>
      </section>

      {/* ----------------------------- Search ------------------------------ */}
      <section className="container-site relative z-20 -mt-14 sm:-mt-16">
        <SearchBar lang={lang} categories={categoryOptions} cities={cityOptions} />
      </section>

      {/* ------------------------------- Fleet ----------------------------- */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="container-site">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">{dict.home.fleetEyebrow}</p>
              <h2 className="heading-display mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]">
                {dict.home.fleetTitle}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">{dict.home.fleetText}</p>
            </div>
          </div>

          <FleetGrid cars={cards} lang={lang} createdAt={createdAt} />
        </div>
      </section>

      {/* ---------------------------- Categories --------------------------- */}
      <section className="border-y border-line bg-cream-2 py-14 sm:py-16 lg:py-20">
        <CarCategories lang={lang} />
      </section>

      {/* --------------------------- Advantages ---------------------------- */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="container-site">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow eyebrow-center justify-center">{dict.home.advantagesEyebrow}</p>
            <h2 className="heading-display mt-3 text-3xl sm:text-4xl">
              {dict.home.advantagesTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
              {dict.home.advantagesText}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dict.home.advantages.map((advantage, index) => {
              const Icon = advantageIcons[index] ?? ShieldCheck;
              return (
                <div
                  key={advantage.title}
                  className="card-site card-hover group p-6"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-forest-tint text-forest-ink">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-ink">{advantage.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{advantage.desc}</p>
                  <span
                    aria-hidden
                    className="mt-5 block h-0.5 w-8 rounded-full bg-bronze/60 transition-all duration-300 group-hover:w-14"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------- Destinations --------------------------- */}
      <section className="bg-cream-2 py-14 sm:py-16 lg:py-20">
        <div className="container-site">
          <div className="mb-8 max-w-2xl">
            <p className="eyebrow">{dict.home.destinationsEyebrow}</p>
            <h2 className="heading-display mt-3 text-2xl sm:text-3xl">
              {dict.home.destinationsTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">{dict.home.destinationsText}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dict.destinations.items.slice(0, 4).map((item) => (
              <DestinationCard
                key={item.slug}
                item={item}
                lang={lang}
                ctaLabel={dict.destinations.viewDetails}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link href={`/${lang}/destinations`} className="btn-dark">
              {dict.home.destinationsCta}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------- CTA ------------------------------- */}
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
              <Link href={`/${lang}/cars`} className="btn-primary w-full sm:w-auto">
                {dict.home.ctaPrimary}
              </Link>
              <Link href={`/${lang}/contact`} className="btn-outline w-full sm:w-auto">
                {dict.home.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
