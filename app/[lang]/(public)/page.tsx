import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import CarCard, { type CarCardData } from "@/components/CarCard";
import CarCategories from "@/components/CarCategories";
import { prisma } from "@/lib/prisma";
import { getDict, resolveLocale, tEnum } from "@/i18n";
import { formatCurrency } from "@/lib/utils";

const advantageIcons = [ShieldCheck, Wallet, MapPin, Clock];

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
    orderBy: { dailyPrice: "desc" },
    take: 4,
  });

  const toCard = (car: (typeof cars)[number]): CarCardData => {
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
  };

  const featured = cars[0] ? toCard(cars[0]) : null;
  const fleet = (cars.length > 3 ? cars.slice(1, 4) : cars.slice(0, 3)).map(toCard);

  return (
    <div className="bg-[#050505]">
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {featured?.imageUrl ? (
            <img
              src={featured.imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-[70%_50%] sm:object-[65%_50%] lg:object-[58%_50%]"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-[position:70%_50%] bg-no-repeat" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/98 via-35% to-[#050505]/10 sm:via-45% lg:via-40% lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
          <div className="hero-grid absolute inset-0 opacity-60" aria-hidden="true" />
          <div
            aria-hidden="true"
            className="absolute -start-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-gold/10 blur-[140px]"
          />
        </div>

        <div className="container-luxe relative flex min-h-[calc(100svh-5rem)] items-center py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl animate-fade-up">
            <p className="eyebrow">{dict.home.heroBadge}</p>

            <h1 className="mt-6 text-balance text-[clamp(2.8rem,9vw,6rem)] font-black uppercase leading-[0.92] tracking-[-0.03em]">
              {dict.home.heroTitleLine1}
              <span
                className={`mt-2 block text-gold ${
                  lang === "ar" ? "" : "font-serif font-medium italic tracking-[-0.02em]"
                }`}
              >
                {dict.home.heroTitleLine2}
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-white/70 sm:text-lg">
              {dict.home.heroText}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link href={`/${lang}/cars`} className="btn-gold w-full sm:w-auto">
                {dict.home.heroCtaPrimary}
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
              </Link>
              <Link href={`/${lang}/booking`} className="btn-ghost w-full sm:w-auto">
                {dict.home.heroCtaSecondary}
              </Link>
            </div>

            <dl className="mt-11 grid max-w-lg grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-5 rtl:divide-x-reverse">
              {dict.about.stats.map((stat) => (
                <div key={stat.label} className="px-4 first:ps-0 last:pe-0">
                  <dt className="text-[10px] uppercase leading-4 tracking-[0.14em] text-white/45">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-ivory sm:text-3xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ---------------------------- Fleet -------------------------------- */}
      <section className="border-t border-white/5 py-16 sm:py-20 lg:py-24">
        <div className="container-luxe">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">{dict.home.fleetEyebrow}</p>
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-ivory sm:text-4xl lg:text-5xl">
                {dict.home.fleetTitle}
              </h2>
            </div>
            <Link
              href={`/${lang}/cars`}
              className="inline-flex min-h-11 items-center gap-2 self-start text-[11px] font-bold uppercase tracking-[0.16em] text-white/60 transition-colors hover:text-gold sm:self-auto"
            >
              {dict.home.fleetSeeAll}
              <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            </Link>
          </div>

          {fleet.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fleet.map((car) => (
                <CarCard key={car.id} car={car} lang={lang} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-white/10 p-8 text-center text-white/50">
              {dict.cars.empty}
            </p>
          )}
        </div>
      </section>

      {/* --------------------------- Advantages ---------------------------- */}
      <section className="border-y border-white/5 bg-[#080808] py-16 sm:py-20 lg:py-24">
        <div className="container-luxe">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow eyebrow-center justify-center">{dict.home.advantagesEyebrow}</p>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-ivory sm:text-4xl">
              {dict.home.advantagesTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/55 sm:text-base">
              {dict.home.advantagesText}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-4">
            {dict.home.advantages.map((advantage, index) => {
              const Icon = advantageIcons[index] ?? ShieldCheck;
              return (
                <div
                  key={advantage.title}
                  className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition-colors duration-300 hover:border-gold/40 hover:bg-gold/[0.04]"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-ivory">
                    {advantage.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    {advantage.desc}
                  </p>
                  <span
                    aria-hidden
                    className="mt-5 block h-px w-8 bg-gold/50 transition-all duration-300 group-hover:w-14"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------ CTA -------------------------------- */}
      <section className="relative isolate overflow-hidden py-20 sm:py-24 lg:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/85 to-[#050505]/60" />
        </div>

        <div className="container-luxe">
          <div className="max-w-2xl">
            <p className="eyebrow">{dict.about.eyebrow}</p>
            <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight text-ivory sm:text-4xl lg:text-5xl">
              {dict.home.ctaTitle}
            </h2>
            <p className="mt-5 text-base leading-7 text-white/60 sm:text-lg">
              {dict.home.ctaText}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/${lang}/cars`} className="btn-gold w-full sm:w-auto">
                {dict.home.ctaPrimary}
              </Link>
              <Link href={`/${lang}/contact`} className="btn-ghost w-full sm:w-auto">
                {dict.home.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
