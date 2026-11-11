import Link from "next/link";
import { ArrowUpRight, CarFront } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getDict, canonicalEnum, type Locale } from "@/i18n";

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

  // "Budget" is relative to this fleet: the cheaper half of the published cars.
  // The card is skipped when that cut would just repeat the whole fleet.
  const sortedPrices = cars
    .map((car) => Number(car.dailyPrice))
    .sort((a, b) => a - b);
  const budgetCeiling = sortedPrices[Math.floor((sortedPrices.length - 1) / 2)] ?? 0;

  const definitions: {
    key: CategoryKey;
    href: string;
    match: (car: CarRow) => boolean;
  }[] = [
    {
      key: "sedan",
      href: `/${lang}/cars?category=Berline`,
      match: (car) => canonicalEnum("category", car.category) === "Berline",
    },
    {
      key: "suv",
      href: `/${lang}/cars?category=SUV`,
      match: (car) => canonicalEnum("category", car.category) === "SUV",
    },
    {
      key: "sport",
      href: `/${lang}/cars?category=Sport`,
      match: (car) => canonicalEnum("category", car.category) === "Sport",
    },
    {
      key: "supercar",
      href: `/${lang}/cars?category=Supercar`,
      match: (car) => canonicalEnum("category", car.category) === "Supercar",
    },
    {
      key: "automatic",
      href: `/${lang}/cars?transmission=Automatique`,
      match: (car) => canonicalEnum("transmission", car.transmission) === "Automatique",
    },
    {
      key: "budget",
      href: `/${lang}/cars?maxPrice=${budgetCeiling}`,
      match: (car) => Number(car.dailyPrice) <= budgetCeiling,
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
    // A "budget" card listing every car says nothing; skip it.
    if (definition.key === "budget" && matching.length === cars.length) continue;

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
    <div className="container-site" aria-labelledby="categories-title">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">{t.categoriesEyebrow}</p>
          <h2 id="categories-title" className="heading-display mt-3 text-3xl sm:text-4xl">
            {t.categoriesTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted">{t.categoriesSubtitle}</p>
        </div>

        <Link
          href={`/${lang}/cars`}
          className="inline-flex min-h-10 items-center gap-2 self-start text-xs font-semibold text-forest-ink transition-colors hover:text-bronze-dark md:self-auto"
        >
          {t.fleetSeeAll}
          <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const countLabel =
            card.count === 1
              ? t.categoriesCountOne
              : t.categoriesCountMany.replace("{count}", String(card.count));

          return (
            <Link
              key={card.key}
              href={card.href}
              className="card-site card-hover group flex flex-col overflow-hidden"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-cream-2">
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
                    <CarFront className="h-12 w-12 text-line-strong" aria-hidden />
                  </div>
                )}
                <span className="chip absolute start-3 top-3 !border-transparent !bg-paper/90 !text-ink">
                  <span className="h-1.5 w-1.5 rounded-full bg-bronze" aria-hidden />
                  {countLabel}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold tracking-tight text-ink">{card.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted">{card.description}</p>

                <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                  <span className="btn-dark !min-h-9 !px-3.5 !text-[11px]">
                    {t.categoriesCta}
                    <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
                  </span>
                  <span
                    aria-hidden
                    className="h-0.5 w-8 rounded-full bg-bronze/50 transition-all duration-300 group-hover:w-12"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
