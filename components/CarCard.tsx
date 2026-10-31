import Link from "next/link";
import { ArrowUpRight, CarFront } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { getDict, tEnum, type Locale } from "@/i18n";

export type CarCardData = {
  id: string;
  slug: string;
  name: string | null;
  brand: string;
  model: string;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  dailyPrice: string | number;
  imageUrl: string | null;
  imageAlt: string | null;
};

export default function CarCard({
  car,
  lang,
  eager = false,
}: {
  car: CarCardData;
  lang: Locale;
  eager?: boolean;
}) {
  const dict = getDict(lang);
  const label = car.name || `${car.brand} ${car.model}`;

  return (
    <article className="group card-luxe flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-gold/45 hover:shadow-[0_32px_70px_-40px_rgba(201,169,97,0.35)]">
      <Link
        href={`/${lang}/cars/${car.slug}`}
        aria-label={`${label} — ${dict.cars.details}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-[#101010]"
      >
        {car.imageUrl ? (
          <img
            src={car.imageUrl}
            alt={car.imageAlt || label}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <CarFront className="h-12 w-12 text-white/15" aria-hidden />
          </span>
        )}
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent"
        />
        <span className="absolute start-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold backdrop-blur">
          {tEnum(dict, "category", car.category)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-xl font-semibold leading-snug tracking-tight text-ivory">
          <Link
            href={`/${lang}/cars/${car.slug}`}
            className="transition-colors hover:text-gold-soft"
          >
            {label}
          </Link>
        </h3>

        <p className="mt-2 text-xs leading-5 text-white/45">
          {tEnum(dict, "transmission", car.transmission)}
          <span aria-hidden className="mx-2 text-gold/50">•</span>
          {tEnum(dict, "fuel", car.fuelType)}
          <span aria-hidden className="mx-2 text-gold/50">•</span>
          {dict.cars.seatsCount.replace("{seats}", String(car.seats))}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-4">
            <p className="min-w-0">
              <span className="text-xl font-bold text-gold sm:text-2xl">
                {formatCurrency(Number(car.dailyPrice), lang)}
              </span>
              <span className="ms-1 text-[10px] uppercase tracking-[0.12em] text-white/40">
                {dict.cars.perDay}
              </span>
            </p>
            <Link
              href={`/${lang}/cars/${car.slug}`}
              className="inline-flex min-h-8 shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60 transition-colors hover:text-gold"
            >
              {dict.cars.details}
              <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href={`/${lang}/booking?carId=${car.id}`}
              className="btn-gold !min-h-11 !px-2 !text-[10px]"
            >
              {dict.booking.ctaBookNow || dict.cars.bookCta}
            </Link>
            <Link
              href={`/${lang}/cars/${car.slug}`}
              className="btn-ghost !min-h-11 !px-2 !text-[10px]"
            >
              {dict.cars.details}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
