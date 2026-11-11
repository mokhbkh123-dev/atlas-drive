"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ListFilter, SlidersHorizontal } from "lucide-react";

import CarCard, { type CarCardData } from "@/components/CarCard";
import { getDict, type Locale } from "@/i18n";
import { type SearchContext } from "@/lib/utils";

type SortKey = "newest" | "priceAsc" | "priceDesc" | "name";

/**
 * Fleet grid with client-side ordering. There is no popularity metric in the
 * database, so the sort options are limited to what the data really supports.
 */
export default function FleetGrid({
  cars,
  lang,
  createdAt,
  searchContext,
}: {
  cars: CarCardData[];
  lang: Locale;
  /** Creation dates keyed by car id, used by the `newest` ordering. */
  createdAt?: Record<string, string>;
  /** Period and city from the search bar, forwarded to each card link. */
  searchContext?: SearchContext;
}) {
  const dict = getDict(lang);

  const [sort, setSort] = useState<SortKey>("newest");

  const sorted = useMemo(() => {
    const list = [...cars];
    switch (sort) {
      case "priceAsc":
        return list.sort((a, b) => Number(a.dailyPrice) - Number(b.dailyPrice));
      case "priceDesc":
        return list.sort((a, b) => Number(b.dailyPrice) - Number(a.dailyPrice));
      case "name":
        return list.sort((a, b) =>
          (a.name || `${a.brand} ${a.model}`).localeCompare(b.name || `${b.brand} ${b.model}`)
        );
      default:
        return list.sort((a, b) =>
          String(createdAt?.[b.id] ?? "").localeCompare(String(createdAt?.[a.id] ?? ""))
        );
    }
  }, [cars, sort, createdAt]);

  const options: { value: SortKey; label: string }[] = [
    { value: "newest", label: dict.cars.sortNewest },
    { value: "priceAsc", label: dict.cars.sortPriceAsc },
    { value: "priceDesc", label: dict.cars.sortPriceDesc },
    { value: "name", label: dict.common.sortByName },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/${lang}/cars`}
          className="btn-outline-dark inline-flex items-center gap-2 !min-h-10 !text-xs"
        >
          <ListFilter className="h-4 w-4" aria-hidden />
          {dict.cars.filter}
        </Link>

        <label className="flex items-center gap-2 text-xs text-muted">
          <SlidersHorizontal className="h-4 w-4 text-bronze" aria-hidden />
          <span className="font-semibold">{dict.cars.sortBy}</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="field !min-h-10 !w-auto !py-1.5 !text-xs"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {sorted.length === 0 ? (
        <p className="card-site p-10 text-center text-sm text-muted">{dict.cars.empty}</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((car, index) => (
            <CarCard key={car.id} car={car} lang={lang} eager={index < 4} searchContext={searchContext} />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center lg:justify-end">
        <Link href={`/${lang}/cars`} className="btn-outline-dark inline-flex items-center gap-2">
          {dict.home.fleetSeeAll}
          <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
