import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  X,
} from "lucide-react";
import {
  dateParam,
  formatCurrency,
  formatDate,
  withSearchContext,
} from "@/lib/utils";
import { findUnavailableCarIds } from "@/lib/booking-availability";
import { cityFacets, cityKey } from "@/lib/locations";
import {
  canonicalEnum,
  cityParam,
  cityName,
  getDict,
  resolveLocale,
  tEnum,
} from "@/i18n";
import CarCard, { type CarCardData } from "@/components/CarCard";
import FleetFilters, { type FilterOption } from "@/components/FleetFilters";

const PAGE_SIZE = 8;

const SEAT_RANGES: Record<string, { gte: number; lte?: number }> = {
  "2-4": { gte: 2, lte: 4 },
  "5-7": { gte: 5, lte: 7 },
  "8+": { gte: 8 },
};

export default async function CarsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);
  const sp = await searchParams;

  // Repeated params are joined so `?a=1&a=2` behaves like `?a=1,2`.
  const raw: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    const single = Array.isArray(value) ? value.join(",") : value;
    if (single) raw[key] = single;
  }
  const list = (key: string) =>
    (raw[key] ?? "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  const categories = list("category").map((value) => canonicalEnum("category", value));
  const transmissions = list("transmission").map((value) =>
    canonicalEnum("transmission", value)
  );
  const fuels = list("fuel").map((value) => canonicalEnum("fuel", value));
  const seats = list("seats").filter((value) => value in SEAT_RANGES);
  const city = cityParam(raw.city);
  const pickupDate = dateParam(raw.pickupDate);
  const returnDate = dateParam(raw.returnDate);
  const maxPriceRaw = Number(raw.maxPrice);
  const maxPrice =
    Number.isFinite(maxPriceRaw) && maxPriceRaw > 0 ? maxPriceRaw : undefined;
  const sort =
    raw.sort === "priceAsc" || raw.sort === "priceDesc" ? raw.sort : "newest";

  const buildHref = (updates: Record<string, string | null>) => {
    const merged: Record<string, string> = {};
    for (const [key, value] of Object.entries({ ...raw, ...updates })) {
      if (value) merged[key] = value;
    }
    const query = new URLSearchParams(merged).toString();
    return `/${lang}/cars${query ? `?${query}` : ""}`;
  };

  // Removing one value from a multi-select param; drops the key when empty.
  const withoutValue = (key: string, value: string) => {
    const rest = list(key).filter((v) => v !== value);
    return { [key]: rest.length > 0 ? rest.join(",") : null };
  };

  const fleet = await prisma.car.findMany({
    where: { status: "PUBLISHED" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  // A city only narrows the list when the owner recorded an agency there; the
  // vehicles carry that link through Car.locationId.
  const agencies = await prisma.location.findMany({
    where: { isActive: true },
    select: { id: true, city: true },
  });
  const cityFacet = city
    ? cityFacets(agencies).find((facet) => facet.key === cityKey(city))
    : undefined;

  // Enum columns are free text, so one concept can appear as `Diesel` and
  // `DIESEL`. Options are listed once per canonical value, and a selected
  // value matches every raw spelling that resolves to it.
  type EnumField = "category" | "transmission" | "fuelType";
  const enumGroup: Record<EnumField, "category" | "transmission" | "fuel"> = {
    category: "category",
    transmission: "transmission",
    fuelType: "fuel",
  };

  const uniqueOptions = (field: EnumField): FilterOption[] => {
    const canonical = new Map<string, string>();
    for (const car of fleet) {
      const value = canonicalEnum(enumGroup[field], car[field]);
      if (!canonical.has(value)) canonical.set(value, tEnum(dict, enumGroup[field], value));
    }
    return [...canonical]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "fr"));
  };

  const rawValuesFor = (field: EnumField, selected: string[]) =>
    selected.length === 0
      ? undefined
      : Array.from(
          new Set(
            fleet
              .map((car) => car[field])
              .filter((raw) => selected.includes(canonicalEnum(enumGroup[field], raw)))
          )
        );

  const categoryOptions = uniqueOptions("category");
  const transmissionOptions = uniqueOptions("transmission");
  const fuelOptions = uniqueOptions("fuelType");
  const seatOptions = Object.keys(SEAT_RANGES).map((value) => ({
    value,
    label:
      value === "2-4"
        ? dict.cars.seatsUpTo4
        : value === "5-7"
          ? dict.cars.seats5to7
          : dict.cars.seats8plus,
  }));

  const matched = await prisma.car.findMany({
    where: {
      status: "PUBLISHED",
      ...(categories.length > 0
        ? { category: { in: rawValuesFor("category", categories) } }
        : {}),
      ...(transmissions.length > 0
        ? { transmission: { in: rawValuesFor("transmission", transmissions) } }
        : {}),
      ...(fuels.length > 0
        ? { fuelType: { in: rawValuesFor("fuelType", fuels) } }
        : {}),
      ...(maxPrice ? { dailyPrice: { lte: maxPrice } } : {}),
      ...(cityFacet ? { locationId: { in: cityFacet.ids } } : {}),
      ...(seats.length > 0
        ? {
            OR: seats.map((value) => ({
              seats: {
                gte: SEAT_RANGES[value].gte,
                ...(SEAT_RANGES[value].lte ? { lte: SEAT_RANGES[value].lte } : {}),
              },
            })),
          }
        : {}),
    },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy:
      sort === "priceAsc"
        ? { dailyPrice: "asc" }
        : sort === "priceDesc"
          ? { dailyPrice: "desc" }
          : { createdAt: "desc" },
  });

  // A chosen period has to hide cars that are already reserved or in the
  // workshop, otherwise the listing promises a vehicle the agency cannot give.
  const period =
    pickupDate && returnDate && new Date(returnDate) > new Date(pickupDate)
      ? { pickupAt: new Date(pickupDate), returnAt: new Date(returnDate) }
      : null;
  const unavailable = period
    ? await findUnavailableCarIds(prisma, period)
    : new Set<string>();
  const filtered = period
    ? matched.filter((car) => !unavailable.has(car.id))
    : matched;

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(
    Math.max(1, Number.parseInt(raw.page ?? "1", 10) || 1),
    totalPages
  );
  const pageCars = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const cards: CarCardData[] = pageCars.map((car) => {
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

  const bannerImage = fleet
    .flatMap((car) => car.images.filter((img) => img.isPrimary).map((img) => img.url))[0];

  const chips: { label: string; href: string }[] = [
    ...categories.map((value) => ({
      label: tEnum(dict, "category", value),
      href: buildHref(withoutValue("category", value)),
    })),
    ...transmissions.map((value) => ({
      label: tEnum(dict, "transmission", value),
      href: buildHref(withoutValue("transmission", value)),
    })),
    ...fuels.map((value) => ({
      label: tEnum(dict, "fuel", value),
      href: buildHref(withoutValue("fuel", value)),
    })),
    ...seats.map((value) => ({
      label: seatOptions.find((option) => option.value === value)?.label ?? value,
      href: buildHref(withoutValue("seats", value)),
    })),
    ...(maxPrice
      ? [
          {
            label: dict.cars.priceUpTo.replace(
              "{price}",
              formatCurrency(maxPrice, lang)
            ),
            href: buildHref({ maxPrice: null }),
          },
        ]
      : []),
    ...(cityFacet
      ? [
          {
            label: `${dict.search.pickupLocation}: ${cityFacet.label}`,
            href: buildHref({ city: null }),
          },
        ]
      : []),
    ...(pickupDate
      ? [
          {
            label: `${dict.search.pickupDate}: ${formatDate(pickupDate, lang)}`,
            href: buildHref({ pickupDate: null }),
          },
        ]
      : []),
    ...(returnDate
      ? [
          {
            label: `${dict.search.returnDate}: ${formatDate(returnDate, lang)}`,
            href: buildHref({ returnDate: null }),
          },
        ]
      : []),
  ];

  const sortOptions = [
    { value: "newest", label: dict.cars.sortNewest },
    { value: "priceAsc", label: dict.cars.sortPriceAsc },
    { value: "priceDesc", label: dict.cars.sortPriceDesc },
  ];

  const preserve = Object.fromEntries(
    Object.entries(raw).filter(
      ([key]) =>
        !["category", "transmission", "fuel", "seats", "page"].includes(key)
    )
  ) as Record<string, string>;

  return (
    <div>
      {/* --------------------------- Banner band --------------------------- */}
      <section className="relative isolate overflow-hidden bg-forest">
        {bannerImage ? (
          <img
            src={bannerImage}
            alt=""
            aria-hidden
            loading="eager"
            decoding="async"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
        ) : (
          <div aria-hidden className="zellige absolute inset-0 -z-10 opacity-60" />
        )}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-deep/95 via-forest-deep/80 to-forest/55"
        />

        <div className="container-site py-12 sm:py-16 lg:py-20">
          <nav aria-label={dict.navbar.cars}>
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/60">
              <li>
                <Link href={`/${lang}`} className="transition-colors hover:text-white">
                  {dict.navbar.home}
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
              </li>
              <li aria-current="page" className="font-semibold text-bronze-light">
                {dict.navbar.cars}
              </li>
            </ol>
          </nav>

          <div className="mt-6 max-w-2xl animate-fade-up">
            <p className="eyebrow eyebrow-light">{dict.cars.eyebrow}</p>
            <h1 className="heading-display mt-4 text-balance text-4xl text-white sm:text-5xl">
              {dict.cars.fleetTitle}{" "}
              <span className="text-bronze-light">{dict.cars.fleetHighlight}</span>
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
              {dict.cars.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------- Filters + grid -------------------------- */}
      <section className="container-site py-10 sm:py-12 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
          <FleetFilters
            lang={lang}
            categories={categoryOptions}
            transmissions={transmissionOptions}
            fuels={fuelOptions}
            seats={seatOptions}
            selected={{ category: categories, transmission: transmissions, fuel: fuels, seats }}
            preserve={preserve}
          />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">
                {dict.cars.resultsCount.replace("{count}", String(total))}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-muted">{dict.cars.sortBy}</span>
                {sortOptions.map((option) => {
                  const active = sort === option.value;
                  return (
                    <Link
                      key={option.value}
                      href={buildHref(
                        option.value === "newest"
                          ? { sort: null, page: null }
                          : { sort: option.value, page: null }
                      )}
                      aria-current={active ? "true" : undefined}
                      className={`chip !py-1 !text-xs transition-colors ${
                        active
                          ? "!border-bronze !bg-bronze-soft !text-bronze-dark"
                          : "hover:!border-line-strong hover:text-ink"
                      }`}
                    >
                      {option.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {chips.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-muted">
                  {dict.cars.filterActive}
                </span>
                {chips.map((chip) => (
                  <Link
                    key={`${chip.label}${chip.href}`}
                    href={chip.href}
                    className="chip gap-1.5 transition-colors hover:!border-bronze hover:text-bronze-dark"
                  >
                    <span>{chip.label}</span>
                    <X className="h-3 w-3" aria-hidden />
                  </Link>
                ))}
                <Link
                  href={`/${lang}/cars`}
                  className="ms-1 text-xs font-semibold text-bronze-dark underline underline-offset-4 hover:text-bronze"
                >
                  {dict.cars.clearFilter}
                </Link>
              </div>
            )}

            {city && !cityFacet && (
              <p className="mt-3 text-xs text-muted">
                {dict.cars.cityNote.replace("{city}", cityName(dict, city))}
              </p>
            )}

            {cards.length === 0 ? (
              <div className="card-site mt-6 p-12 text-center">
                <p className="text-sm text-muted">{dict.cars.empty}</p>
                <Link href={`/${lang}/cars`} className="btn-outline-dark mt-6">
                  {dict.cars.clearFilter}
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                {cards.map((car, index) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    lang={lang}
                    eager={index < 2}
                    searchContext={{ pickupDate, returnDate, city }}
                  />
                ))}
              </div>
            )}

            {total > 0 && (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
                <p className="text-xs text-muted">
                  {dict.cars.showing
                    .replace("{from}", String(from))
                    .replace("{to}", String(to))
                    .replace("{total}", String(total))}
                </p>

                {totalPages > 1 && (
                  <nav
                    className="flex items-center gap-1.5"
                  >
                    {page > 1 ? (
                      <Link
                        href={buildHref({ page: page === 2 ? null : String(page - 1) })}
                        className="chip !h-9 !w-9 justify-center transition-colors hover:!border-bronze"
                        aria-label={dict.cars.previous}
                      >
                        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
                      </Link>
                    ) : (
                      <span
                        aria-hidden
                        className="chip !h-9 !w-9 justify-center opacity-40"
                      >
                        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
                      </span>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) =>
                      n === page ? (
                        <span
                          key={n}
                          aria-current="page"
                          className="chip !h-9 !w-9 justify-center !border-forest !bg-forest !text-white"
                        >
                          {n}
                        </span>
                      ) : (
                        <Link
                          key={n}
                          href={buildHref({ page: n === 1 ? null : String(n) })}
                          className="chip !h-9 !w-9 justify-center transition-colors hover:!border-bronze"
                        >
                          {n}
                        </Link>
                      )
                    )}

                    {page < totalPages ? (
                      <Link
                        href={buildHref({ page: String(page + 1) })}
                        className="chip !h-9 !w-9 justify-center transition-colors hover:!border-bronze"
                        aria-label={dict.cars.next}
                      >
                        <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
                      </Link>
                    ) : (
                      <span
                        aria-hidden
                        className="chip !h-9 !w-9 justify-center opacity-40"
                      >
                        <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
                      </span>
                    )}
                  </nav>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
