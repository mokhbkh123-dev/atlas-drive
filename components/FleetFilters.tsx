"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { getDict, type Locale } from "@/i18n";

export type FilterOption = { value: string; label: string };

type FilterParam = "category" | "transmission" | "fuel" | "seats";

export type FleetFiltersProps = {
  lang: Locale;
  categories: FilterOption[];
  transmissions: FilterOption[];
  fuels: FilterOption[];
  seats: FilterOption[];
  selected: Record<FilterParam, string[]>;
  /** Query params the sidebar must keep untouched when a box is toggled. */
  preserve: Record<string, string>;
};

export default function FleetFilters({
  lang,
  categories,
  transmissions,
  fuels,
  seats,
  selected,
  preserve,
}: FleetFiltersProps) {
  const dict = getDict(lang);
  const router = useRouter();

  const groups: {
    param: FilterParam;
    title: string;
    options: FilterOption[];
  }[] = [
    { param: "category", title: dict.cars.carType, options: categories },
    { param: "transmission", title: dict.cars.transmission, options: transmissions },
    { param: "fuel", title: dict.cars.fuelType, options: fuels },
    { param: "seats", title: dict.cars.seats, options: seats },
  ];

  const toggle = (param: FilterParam, value: string) => {
    const next = new Set(selected[param]);
    if (next.has(value)) next.delete(value);
    else next.add(value);

    const params = new URLSearchParams(preserve);
    const list = [...next];
    // Multi-select travels as one comma-separated param (e.g. ?category=SUV,Berline).
    if (list.length > 0) params.set(param, list.join(","));
    else params.delete(param);
    params.delete("page");

    const query = params.toString();
    router.push(`/${lang}/cars${query ? `?${query}` : ""}`);
  };

  return (
    <aside className="card-site h-fit p-5 lg:sticky lg:top-24">
      <h2 className="heading-display text-lg">{dict.cars.filters}</h2>
      <div className="rule-gold mt-3" />

      {groups.map((group) => (
        <fieldset key={group.param} className="mt-5">
          <legend className="field-label">{group.title}</legend>
          <ul className="mt-2 space-y-1">
            {group.options.map((option) => {
              const checked = selected[group.param].includes(option.value);
              return (
                <li key={option.value}>
                  <label
                    className={`flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md px-1 text-sm transition-colors hover:bg-forest-tint ${
                      checked ? "font-semibold text-ink" : "text-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(group.param, option.value)}
                      className="h-4 w-4 shrink-0 rounded border-line-strong accent-bronze"
                    />
                    <span className="min-w-0 truncate">{option.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}

      <Link href={`/${lang}/cars`} className="btn-outline-dark mt-6 w-full !min-h-10 !text-xs">
        {dict.cars.resetFilters}
      </Link>
    </aside>
  );
}
