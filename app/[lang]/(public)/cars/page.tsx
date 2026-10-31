import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { getDict, resolveLocale, tEnum } from "@/i18n";
import CarCard, { type CarCardData } from "@/components/CarCard";

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

  // Filters driven by the home-page category cards.
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const transmission =
    typeof sp.transmission === "string" ? sp.transmission : undefined;
  const maxPriceRaw = Number(
    typeof sp.maxPrice === "string" ? sp.maxPrice : NaN
  );
  const maxPrice =
    Number.isFinite(maxPriceRaw) && maxPriceRaw > 0 ? maxPriceRaw : undefined;

  const activeLabel = category
    ? tEnum(dict, "category", category)
    : transmission
      ? tEnum(dict, "transmission", transmission)
      : maxPrice
        ? dict.cars.priceUpTo.replace("{price}", formatCurrency(maxPrice, lang))
        : null;

  const cars = await prisma.car.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category } : {}),
      ...(transmission ? { transmission } : {}),
      ...(maxPrice ? { dailyPrice: { lte: maxPrice } } : {}),
    },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  const cards: CarCardData[] = cars.map((car) => {
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

  return (
    <div className="bg-[#050505]">
      <section className="relative overflow-hidden border-b border-white/5 py-14 sm:py-20 lg:py-24">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(201,169,97,0.16),transparent_70%)]" />
        <div className="container-luxe relative">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow eyebrow-center justify-center">{dict.cars.eyebrow}</p>
            <h1 className="mt-5 text-balance text-[clamp(2.6rem,8vw,5rem)] font-black uppercase leading-[0.95] tracking-tight">
              {dict.cars.fleetTitle}{" "}
              <span
                className={`text-gold ${
                  lang === "ar" ? "" : "font-serif font-medium italic tracking-normal"
                }`}
              >
                {dict.cars.fleetHighlight}
              </span>
            </h1>
            <p className="mt-5 text-xs uppercase tracking-[0.2em] text-white/45 sm:text-sm">
              {dict.cars.tagline}
            </p>

            {activeLabel ? (
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-soft">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {dict.cars.filterActive}: {activeLabel}
                </span>
                <Link
                  href={`/${lang}/cars`}
                  className="inline-flex min-h-9 items-center text-[10px] font-bold uppercase tracking-[0.14em] text-white/50 underline decoration-white/20 underline-offset-4 transition-colors hover:text-gold"
                >
                  {dict.cars.clearFilter}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14 lg:py-16">
        <div className="container-luxe">
          {cards.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
              <p className="text-white/55">{dict.cars.empty}</p>
              <Link href={`/${lang}/cars`} className="btn-ghost mt-6">
                {dict.cars.clearFilter}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {cards.map((car, index) => (
                <CarCard key={car.id} car={car} lang={lang} eager={index < 3} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
