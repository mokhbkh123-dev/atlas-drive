import Link from "next/link";
import { ArrowRight, CarFront, Compass, MapPin, Route } from "lucide-react";

import DestinationCard from "@/components/DestinationCard";
import { prisma } from "@/lib/prisma";
import { publicAsset } from "@/lib/site-images";
import { formatCurrency } from "@/lib/utils";
import { getDict, resolveLocale, tEnum } from "@/i18n";

/**
 * The fleet only stores Sport | SUV | Berline | Supercar | Utility, so the
 * "compact city car" and "estate" wording of the destination blurbs both
 * reduce to Berline, and every "4x4 / taller vehicle" hint reduces to SUV.
 */
const RECOMMENDED_CATEGORY: Record<string, string> = {
  marrakech: "Berline",
  agadir: "Berline",
  fes: "Berline",
  tanger: "Berline",
  chefchaouen: "SUV",
  essaouira: "Berline",
  sahara: "SUV",
  ouarzazate: "SUV",
};

export default async function DestinationsPage({
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
    orderBy: { dailyPrice: "asc" },
  });

  const carsByCategory: Record<string, typeof cars> = {};
  for (const car of cars) {
    (carsByCategory[car.category] ??= []).push(car);
  }

  const bannerCar = cars.find((car) => car.images.length > 0);
  const bannerImage = bannerCar?.images[0]?.url ?? null;

  return (
    <div>
      {/* ------------------------------- Banner ------------------------------ */}
      <section className="relative isolate overflow-hidden bg-forest">
        {bannerImage ? (
          <img
            src={bannerImage}
            alt=""
            decoding="async"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
        ) : (
          <div aria-hidden className="zellige absolute inset-0 -z-10 opacity-70" />
        )}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-deep via-forest-deep/75 to-forest/45"
        />

        <div className="container-site py-14 sm:py-20 lg:py-24">
          <nav aria-label={dict.footer.navigation} className="flex flex-wrap items-center gap-2 text-xs text-white/60">
            <Link href={`/${lang}`} className="transition-colors hover:text-bronze-light">
              {dict.navbar.home}
            </Link>
            <span aria-hidden className="text-white/30">
              /
            </span>
            <span className="text-white/85">{dict.navbar.destinations}</span>
          </nav>

          <div className="mt-6 max-w-2xl">
            <p className="eyebrow eyebrow-light">{dict.destinations.eyebrow}</p>
            <h1 className="mt-4 text-balance font-display text-[clamp(2.25rem,6vw,4rem)] font-bold leading-[1.05] text-white">
              {dict.destinations.title}{" "}
              <span className="text-bronze-light">{dict.destinations.titleHighlight}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/70">
              {dict.destinations.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------- Tiles ------------------------------- */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="container-site">
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {dict.destinations.items.map((item) => {
              const category = RECOMMENDED_CATEGORY[item.slug] ?? "Berline";
              const matches = (carsByCategory[category] ?? []).slice(0, 3);
              const hasPhoto = publicAsset(`/destinations/${item.slug}.jpg`);

              return (
                <section
                  key={item.slug}
                  id={item.slug}
                  className="flex flex-col scroll-mt-32"
                  aria-labelledby={`destination-${item.slug}`}
                >
                  <h2 id={`destination-${item.slug}`} className="sr-only">
                    {item.name}
                  </h2>

                  <DestinationCard
                    item={item}
                    lang={lang}
                    ctaLabel={dict.destinations.viewDetails}
                  />

                  <p className="mt-4 text-sm leading-6 text-muted">{item.desc}</p>

                  {!hasPhoto ? (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                      <MapPin className="h-3.5 w-3.5 text-bronze" aria-hidden />
                      {dict.destinations.imageMissing}
                    </p>
                  ) : null}

                  <div className="mt-4 flex items-start gap-2 border-t border-line pt-4">
                    <Route className="mt-0.5 h-4 w-4 shrink-0 text-bronze" aria-hidden />
                    <p className="text-xs leading-5">
                      <span className="me-1.5 font-bold uppercase tracking-[0.1em] text-ink">
                        {dict.destinations.roadTip}
                      </span>
                      <span className="text-muted">{item.road}</span>
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="field-label">{dict.cars.carType}</p>
                    <span className="chip mt-2">
                      <Compass className="h-3.5 w-3.5 text-bronze-dark" aria-hidden />
                      {tEnum(dict, "category", category)}
                    </span>

                    {matches.length > 0 ? (
                      <ul className="mt-3 space-y-2">
                        {matches.map((car) => (
                          <li key={car.id}>
                            <Link
                              href={`/${lang}/cars/${car.slug}`}
                              className="flex items-center justify-between gap-3 rounded-lg border border-line bg-paper px-3 py-2 transition-colors hover:border-bronze"
                            >
                              <span className="flex min-w-0 items-center gap-2 text-sm text-ink">
                                <CarFront
                                  className="h-4 w-4 shrink-0 text-bronze"
                                  aria-hidden
                                />
                                <span className="truncate">
                                  {car.name || `${car.brand} ${car.model}`}
                                </span>
                              </span>
                              <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-bronze-dark">
                                {formatCurrency(car.dailyPrice.toString(), lang)}
                                <span className="ms-1 text-[11px] font-normal text-muted">
                                  {dict.cars.perDay}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href={`/${lang}/cars?category=${encodeURIComponent(category)}`}
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-bronze-dark transition-colors hover:text-ink"
                          >
                            {dict.home.categoriesCta}
                            <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
                          </Link>
                        </li>
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-muted">{dict.cars.empty}</p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------- CTA -------------------------------- */}
      <section className="relative isolate overflow-hidden bg-forest py-16 sm:py-20">
        <div aria-hidden className="zellige absolute inset-0 opacity-60" />
        <div className="container-site relative">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="eyebrow eyebrow-light">{dict.destinations.eyebrow}</p>
              <h2 className="mt-3 text-balance font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                {dict.destinations.ctaTitle}
              </h2>
              <p className="mt-4 text-base leading-7 text-white/70">
                {dict.destinations.ctaText}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/${lang}/booking`} className="btn-primary w-full sm:w-auto">
                {dict.destinations.ctaPrimary}
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
              </Link>
              <Link href={`/${lang}/cars`} className="btn-outline w-full sm:w-auto">
                {dict.home.fleetSeeAll}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
