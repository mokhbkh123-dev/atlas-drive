import Link from "next/link";
import { CarFront, Fuel, Gauge, Users } from "lucide-react";

import { formatCurrency, withSearchContext, type SearchContext } from "@/lib/utils";
import { categoryBadgeColor } from "@/lib/category-styles";
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

/** Fleet card used on the home page and the cars listing (cream theme). */
export default function CarCard({
  car,
  lang,
  eager = false,
  searchContext,
}: {
  car: CarCardData;
  lang: Locale;
  eager?: boolean;
  searchContext?: SearchContext;
}) {
  const dict = getDict(lang);
  const label = car.name || `${car.brand} ${car.model}`;
  const detailHref = withSearchContext(`/${lang}/cars/${car.slug}`, searchContext ?? {});

  const specs = [
    { icon: Users, text: dict.cars.seatsCount.replace("{seats}", String(car.seats)) },
    { icon: Gauge, text: tEnum(dict, "transmission", car.transmission) },
    { icon: Fuel, text: tEnum(dict, "fuel", car.fuelType) },
  ];

  return (
    <article className="card-site card-hover group flex h-full flex-col overflow-hidden">
      <Link
        href={detailHref}
        aria-label={`${label} — ${dict.cars.details}`}
        className="relative block aspect-[16/10] w-full overflow-hidden bg-cream-2"
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
            <CarFront className="h-12 w-12 text-line-strong" aria-hidden />
          </span>
        )}
        <span
          className="badge-category absolute start-3 top-3"
          style={{ backgroundColor: categoryBadgeColor(car.category) }}
        >
          {tEnum(dict, "category", car.category)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold tracking-tight text-ink">
          <Link href={detailHref} className="transition-colors hover:text-bronze-dark">
            {label}
          </Link>
        </h3>

        <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
          {specs.map((spec) => (
            <li key={spec.text} className="flex items-center gap-1.5">
              <spec.icon className="h-3.5 w-3.5 text-bronze" aria-hidden />
              <span>{spec.text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-line pt-4">
          <p className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold text-ink">
              {formatCurrency(Number(car.dailyPrice), lang)}
            </span>
            <span className="text-xs text-muted">{dict.cars.perDay}</span>
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href={withSearchContext(`/${lang}/booking?carId=${car.id}`, searchContext ?? {})}
              className="btn-dark !min-h-10 !px-3 !text-xs"
            >
              {dict.booking.ctaBookNow || dict.cars.bookCta}
            </Link>
            <Link href={detailHref} className="btn-outline-dark !min-h-10 !px-3 !text-xs">
              {dict.cars.details}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
