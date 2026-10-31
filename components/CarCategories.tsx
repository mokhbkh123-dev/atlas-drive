import Link from "next/link";
import { ArrowUpRight, CarFront } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getDict, type Locale } from "@/i18n";

type CategoryKey = "sport" | "sedan" | "suv" | "supercar" | "automatic" | "budget";

type CarRow = Awaited<ReturnType<typeof loadCars>>[number];

function loadCars() {
  return prisma.car.findMany({
    where: { status: "PUBLISHED" },
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
    },
    orderBy: { dailyPrice: "desc" },
  });
}

function primaryImageUrl(car: CarRow): string | null {
  const image = car.images.find((img) => img.isPrimary) ?? car.images[0];
  return image?.url ?? null;
}

/**
 * Premium car-category showcase for the home page (light band, navy type,
 * gold accents). Cards are built from the real published fleet and link to
 * the filtered listing (`/cars?category=…`, `?transmission=…`, `?maxPrice=…`).
 */
export default async function CarCategories({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  const t = dict.home;

  const cars = await loadCars();
  if (cars.length === 0) return null;

  const definitions: {
    key: CategoryKey;
    href: string;
    match: (car: CarRow) => boolean;
  }[] = [
    {
      key: "sedan",
      href: `/${lang}/cars?category=Berline`,
      match: (car) => car.category === "Berline",
    },
    {
      key: "suv",
      href: `/${lang}/cars?category=SUV`,
      match: (car) => car.category === "SUV",
    },
    {
      key: "sport",
      href: `/${lang}/cars?category=Sport`,
      match: (car) => car.category === "Sport",
    },
    {
      key: "supercar",
      href: `/${lang}/cars?category=Supercar`,
      match: (car) => car.category === "Supercar",
    },
    {
      key: "automatic",
      href: `/${lang}/cars?transmission=Automatique`,
      match: (car) => car.transmission === "Automatique",
    },
    {
      key: "budget",
      href: `/${lang}/cars?maxPrice=2500`,
      match: (car) => Number(car.dailyPrice) <= 2500,
    },
  ];

  // Pick a representative image per card, avoiding duplicates across cards.
  const usedImages = new Set<string>();
  const cards: {
    key: CategoryKey;
    href: string;
    image: string | null;
    count: number;
    name: string;
    description: string;
  }[] = [];

  for (const definition of definitions) {
    const matching = cars.filter(definition.match);
    if (matching.length === 0) continue;

    const pick =
      matching.find((car) => {
        const url = primaryImageUrl(car);
        return url !== null && !usedImages.has(url);
      }) ?? matching[0];

    const image = primaryImageUrl(pick);
    if (image) usedImages.add(image);

    cards.push({
      key: definition.key,
      href: definition.href,
      image,
      count: matching.length,
      name: t.categories[definition.key].name,
      description: t.categories[definition.key].desc,
    });
  }

  if (cards.length === 0) return null;

  return (
    <section
      aria-labelledby="categories-title"
      className="relative overflow-hidden bg-[#f5f4f0] py-20 text-[#0b1630] sm:py-24 lg:py-28"
    >
      {/* Subtle gold ambience */}
      <div
        aria-hidden
        className="pointer-events-none absolute -end-32 -top-32 h-80 w-80 rounded-full bg-[#c9a227]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -start-24 h-72 w-72 rounded-full bg-[#0b1630]/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-10 bg-[#c9a227]" aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#a17f1e]">
                {t.categoriesEyebrow}
              </span>
            </div>
            <h2
              id="categories-title"
              className="text-3xl font-black uppercase tracking-tight text-[#0b1630] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
            >
              {t.categoriesTitle}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#0b1630]/60 sm:text-base">
              {t.categoriesSubtitle}
            </p>
          </div>

          <Link
            href={`/${lang}/cars`}
            className="inline-flex items-center gap-2 self-start text-xs font-bold uppercase tracking-[0.18em] text-[#0b1630] transition-colors hover:text-[#a17f1e] md:self-auto"
          >
            {t.fleetSeeAll}
            <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {cards.map((card) => {
            const countLabel =
              card.count === 1
                ? t.categoriesCountOne
                : t.categoriesCountMany.replace("{count}", String(card.count));

            return (
              <Link
                key={card.key}
                href={card.href}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#0b1630]/10 bg-white shadow-[0_1px_2px_rgba(11,22,48,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a227]/50 hover:shadow-[0_24px_48px_-24px_rgba(11,22,48,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a227]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#0b1630]">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <CarFront className="h-12 w-12 text-white/20" aria-hidden />
                    </div>
                  )}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b1630]/45 via-transparent to-transparent opacity-60"
                  />
                  <span className="absolute start-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#0b1630] shadow-sm backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c9a227]" aria-hidden />
                    {countLabel}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="text-xl font-semibold tracking-tight text-[#0b1630]">
                    {card.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#0b1630]/60">
                    {card.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-[#0b1630]/10 pt-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#0b1630] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-300 group-hover:bg-[#c9a227] group-hover:text-[#0b1630]">
                      {t.categoriesCta}
                      <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
                    </span>
                    <span
                      aria-hidden
                      className="h-px w-8 bg-[#c9a227]/60 transition-all duration-300 group-hover:w-12"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
