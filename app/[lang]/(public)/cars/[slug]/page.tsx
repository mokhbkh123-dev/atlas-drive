import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  DoorOpen,
  Fuel,
  Gauge,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import {
  dateParam,
  formatCurrency,
  formatDate,
  withSearchContext,
} from "@/lib/utils";
import { categoryBadgeColor } from "@/lib/category-styles";
import { cityFacets, citySelectOptions } from "@/lib/locations";
import {
  cityParam,
  getDict,
  intlLocaleOf,
  resolveLocale,
  tEnum,
} from "@/i18n";
import CarGallery, { type GalleryImage } from "@/components/CarGallery";
import CarDetailTabs, { type DetailTab } from "@/components/CarDetailTabs";
import SearchBar from "@/components/SearchBar";

function parseFeatures(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is string => typeof item === "string" && item.trim() !== ""
        )
      : [];
  } catch {
    return [];
  }
}

export default async function CarDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ pickupDate?: string; returnDate?: string; city?: string }>;
}) {
  const lang = await resolveLocale(params);
  const { slug } = await params;
  const dict = getDict(lang);

  // A visitor arriving from a period search keeps that period all the way to
  // the request form, so what they searched is what they book.
  const raw = await searchParams;
  const searchContext = {
    pickupDate: dateParam(raw.pickupDate),
    returnDate: dateParam(raw.returnDate),
    city: cityParam(raw.city),
  };

  const car = await prisma.car.findUnique({
    where: { slug },
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
    },
  });

  if (!car || car.status !== "PUBLISHED") {
    notFound();
  }

  const [reviewRows, publishedCars] = await Promise.all([
    prisma.review.findMany({
      where: { published: true, booking: { carId: car.id } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.car.findMany({
      where: { status: "PUBLISHED" },
      distinct: ["category"],
      select: { category: true },
    }),
  ]);

  const label = car.name || `${car.brand} ${car.model}`;
  const deposit = Number(car.deposit);
  const images: GalleryImage[] = car.images.map((image) => ({
    src: image.url,
    alt: image.alt || label,
  }));

  const featureList = parseFeatures(car.features);
  const derivedFeatures = car.airConditioning ? [dict.cars.featureAirCon] : [];
  const allFeatures = [...featureList, ...derivedFeatures];

  const specRows = [
    {
      label: dict.cars.specs.transmission,
      value: tEnum(dict, "transmission", car.transmission),
      icon: Gauge,
    },
    {
      label: dict.cars.specs.fuel,
      value: tEnum(dict, "fuel", car.fuelType),
      icon: Fuel,
    },
    {
      label: dict.cars.specs.seats,
      value: dict.cars.seatsCount.replace("{seats}", String(car.seats)),
      icon: Users,
    },
    { label: dict.cars.specs.doors, value: String(car.doors), icon: DoorOpen },
    ...(car.year
      ? [{ label: dict.cars.featureYear, value: String(car.year), icon: ShieldCheck }]
      : []),
    ...(car.mileage != null
      ? [
          {
            label: dict.cars.featureMileage,
            value: `${new Intl.NumberFormat(intlLocaleOf[lang]).format(car.mileage)} km`,
            icon: Gauge,
          },
        ]
      : []),
    {
      label: dict.cars.featureCategory,
      value: tEnum(dict, "category", car.category),
      icon: Check,
    },
  ];

  const whyBullets = [
    {
      label: dict.cars.specs.seats,
      value: dict.cars.seatsCount.replace("{seats}", String(car.seats)),
    },
    {
      label: dict.cars.specs.transmission,
      value: tEnum(dict, "transmission", car.transmission),
    },
    { label: dict.cars.specs.fuel, value: tEnum(dict, "fuel", car.fuelType) },
    { label: dict.cars.featureDoors, value: String(car.doors) },
    ...(car.airConditioning
      ? [{ label: dict.cars.featureAirCon, value: null as string | null }]
      : []),
    ...(car.year ? [{ label: dict.cars.featureYear, value: String(car.year) }] : []),
    ...(car.mileage != null
      ? [
          {
            label: dict.cars.featureMileage,
            value: `${new Intl.NumberFormat(intlLocaleOf[lang]).format(car.mileage)} km`,
          },
        ]
      : []),
  ];

  const tabs: DetailTab[] = [
    {
      id: "overview",
      label: dict.cars.tabs.overview,
      panel: (
        <div>
          {car.description && (
            <>
              <h2 className="heading-display text-xl sm:text-2xl">
                {dict.cars.descriptionHeading}
              </h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted sm:text-base">
                {car.description}
              </p>
            </>
          )}
          <ul className="mt-5 flex flex-wrap gap-2">
            {[car.brand, car.model, ...(car.year ? [String(car.year)] : [])].map(
              (chip) => (
                <li key={chip} className="chip">
                  {chip}
                </li>
              )
            )}
          </ul>
        </div>
      ),
    },
    {
      id: "specifications",
      label: dict.cars.tabs.specifications,
      panel: (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {specRows.map((row) => (
            <div
              key={row.label}
              className="card-site flex items-center gap-3 p-4"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-tint text-forest-ink">
                <row.icon className="h-4 w-4" aria-hidden />
              </span>
              <span>
                <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
                  {row.label}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">{row.value}</dd>
              </span>
            </div>
          ))}
        </dl>
      ),
    },
    ...(allFeatures.length > 0
      ? [
          {
            id: "features",
            label: dict.cars.tabs.features,
            panel: (
              <ul className="flex flex-wrap gap-2">
                {allFeatures.map((feature) => (
                  <li key={feature} className="chip">
                    <Check className="h-3.5 w-3.5 text-bronze" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
            ),
          },
        ]
      : []),
    ...(reviewRows.length > 0
      ? [
          {
            id: "reviews",
            label: dict.cars.tabs.reviews,
            panel: (
              <div>
                <p className="text-sm font-semibold text-ink">
                  {dict.cars.reviewsCount.replace(
                    "{count}",
                    new Intl.NumberFormat(intlLocaleOf[lang]).format(reviewRows.length)
                  )}
                </p>
                <ul className="mt-4 space-y-4">
                  {reviewRows.map((review) => (
                    <li key={review.id} className="card-site p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-ink">{review.author}</p>
                        <ul className="flex items-center gap-0.5" aria-hidden>
                          {Array.from({ length: 5 }, (_, index) => (
                            <li key={index}>
                              <Star
                                className={`h-3.5 w-3.5 ${
                                  index < review.rating
                                    ? "fill-bronze text-bronze"
                                    : "text-line-strong"
                                }`}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted">{review.content}</p>
                      <p className="mt-2 text-xs text-muted">
                        {formatDate(review.createdAt, lang)}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs leading-5 text-muted">
                  {dict.cars.yourReviewNote}
                </p>
              </div>
            ),
          },
        ]
      : []),
  ];

  const categoryOptions = publishedCars.map((row) => ({
    value: row.category,
    label: tEnum(dict, "category", row.category),
  }));
  const agencies = await prisma.location.findMany({
    where: { isActive: true },
    select: { id: true, city: true },
  });
  const cityOptions = citySelectOptions(cityFacets(agencies), dict.destinations.items);

  const specStrip = [
    { icon: Users, text: dict.cars.seatsCount.replace("{seats}", String(car.seats)) },
    { icon: Gauge, text: tEnum(dict, "transmission", car.transmission) },
    { icon: Fuel, text: tEnum(dict, "fuel", car.fuelType) },
    { icon: DoorOpen, text: String(car.doors) },
  ];

  return (
    <div>
      <div className="container-site py-8 sm:py-10 lg:py-12">
        <nav aria-label={label}>
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
            <li>
              <Link href={`/${lang}`} className="transition-colors hover:text-bronze-dark">
                {dict.navbar.home}
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
            <li>
              <Link href={`/${lang}/cars`} className="transition-colors hover:text-bronze-dark">
                {dict.navbar.cars}
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
            <li className="font-semibold text-ink">{label}</li>
          </ol>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div className="animate-fade-up">
            <CarGallery images={images} label={label} />
          </div>

          <div className="animate-fade-up">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="heading-display text-balance text-3xl sm:text-4xl">
                {label}
              </h1>
              <span
                className="badge-category mt-1"
                style={{ backgroundColor: categoryBadgeColor(car.category) }}
              >
                {tEnum(dict, "category", car.category)}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              {car.brand} {car.model}
              {car.year ? ` · ${car.year}` : ""}
            </p>

            <ul className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink">
              {specStrip.map((item) => (
                <li key={item.text} className="flex items-center gap-1.5">
                  <item.icon className="h-4 w-4 text-bronze" aria-hidden />
                  <span className="font-medium">{item.text}</span>
                </li>
              ))}
            </ul>

            <div className="rule-gold mt-6" />

            <div className="card-site mt-6 p-5 sm:p-6">
              <p className="flex flex-wrap items-baseline gap-2">
                <span className="text-3xl font-bold text-ink sm:text-4xl">
                  {formatCurrency(Number(car.dailyPrice), lang)}
                </span>
                <span className="text-sm text-muted">{dict.cars.perDay}</span>
              </p>
              {/* A zero deposit means the agency has not set one; showing
                  "0,00 MAD" would read as a claim rather than as missing data. */}
              {deposit > 0 && (
                <p className="mt-2 flex flex-wrap items-baseline gap-2 text-sm">
                  <span className="font-semibold text-muted">
                    {dict.cars.featureDeposit}
                  </span>
                  <span className="font-semibold text-ink">
                    {formatCurrency(deposit, lang)}
                  </span>
                </p>
              )}

              <Link
                href={withSearchContext(`/${lang}/booking?carId=${car.id}`, searchContext)}
                className="btn-primary mt-5 w-full"
              >
                {dict.booking.ctaBookNow || dict.cars.bookCta}
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
              </Link>

              <div className="mt-5 space-y-2 border-t border-line pt-4 text-xs leading-5 text-muted">
                <p>{dict.booking.minDurationHint}</p>
                <p>{dict.booking.whatsappNote}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
          <CarDetailTabs tabs={tabs} tablistLabel={dict.cars.details} />

          <aside className="card-site h-fit p-6">
            <h2 className="heading-display text-lg">{dict.cars.whyChooseHeading}</h2>
            <ul className="mt-4 space-y-3">
              {whyBullets.map((bullet) => (
                <li key={bullet.label} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-bronze" aria-hidden />
                  <span className="text-muted">
                    {bullet.label}
                    {bullet.value ? (
                      <span className="font-semibold text-ink"> — {bullet.value}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
            {deposit > 0 && (
              <p className="mt-5 flex items-start gap-2 border-t border-line pt-4 text-xs leading-5 text-muted">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-ink" aria-hidden />
                <span>
                  {dict.cars.featureDeposit} — {formatCurrency(deposit, lang)}
                </span>
              </p>
            )}
          </aside>
        </div>
      </div>

      <section className="relative isolate overflow-hidden bg-forest py-14 sm:py-16">
        <div aria-hidden className="zellige absolute inset-0 opacity-50" />
        <div className="container-site relative">
          <div className="max-w-2xl">
            <h2 className="text-balance font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
              {dict.cars.bookRideTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/70 sm:text-base">
              {dict.cars.bookRideText}
            </p>
          </div>
          <div className="mt-8">
            <SearchBar
              lang={lang}
              categories={categoryOptions}
              cities={cityOptions}
              initialCategory={car.category}
              initialPickupDate={searchContext.pickupDate}
              initialReturnDate={searchContext.returnDate}
              initialCity={searchContext.city ?? ""}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
