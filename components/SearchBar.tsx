"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, ChevronDown, MapPin, Search, SlidersHorizontal } from "lucide-react";

import { getDict, type Locale } from "@/i18n";

export type SearchOption = { value: string; label: string };

/**
 * Home-page rental search. It filters the fleet listing by category and
 * carries the chosen dates and pickup city through to the booking request.
 */
export default function SearchBar({
  lang,
  categories,
  cities,
  initialCategory = "",
  initialCity = "",
  initialPickupDate = "",
  initialReturnDate = "",
}: {
  lang: Locale;
  categories: SearchOption[];
  cities: SearchOption[];
  initialCategory?: string;
  initialCity?: string;
  initialPickupDate?: string;
  initialReturnDate?: string;
}) {
  const dict = getDict(lang);
  const router = useRouter();

  const [city, setCity] = useState(initialCity);
  const [pickupDate, setPickupDate] = useState(initialPickupDate);
  const [returnDate, setReturnDate] = useState(initialReturnDate);
  const [category, setCategory] = useState(initialCategory);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    if (pickupDate) params.set("pickupDate", pickupDate);
    if (returnDate) params.set("returnDate", returnDate);
    const query = params.toString();
    router.push(`/${lang}/cars${query ? `?${query}` : ""}`);
  };

  const swapDates = () => {
    if (!pickupDate && !returnDate) return;
    setPickupDate(returnDate);
    setReturnDate(pickupDate);
  };

  return (
    <form
      onSubmit={submit}
      className="card-site grid gap-3 p-3 shadow-[var(--shadow-raised)] sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr_1fr_auto] lg:items-end"
    >
      <Cell
        icon={<MapPin className="h-4 w-4" aria-hidden />}
        label={dict.booking.labels.pickupLocation}
        isSelect
      >
        <select
          name="city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className="w-full appearance-none bg-transparent pe-5 text-sm font-medium text-ink focus:outline-none"
          aria-label={dict.booking.labels.pickupLocation}
        >
          <option value="">{dict.search.anyCity}</option>
          {cities.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Cell>

      <Cell icon={<CalendarDays className="h-4 w-4" aria-hidden />} label={dict.search.pickupDate}>
        <input
          type="date"
          name="pickupDate"
          value={pickupDate}
          onChange={(event) => setPickupDate(event.target.value)}
          className="w-full bg-transparent text-sm font-medium text-ink focus:outline-none"
          aria-label={dict.search.pickupDate}
        />
      </Cell>

      <Cell
        icon={
          <button
            type="button"
            onClick={swapDates}
            className="rounded p-0.5 text-bronze transition-colors hover:bg-bronze-soft"
            aria-label={dict.search.swapDates}
          >
            <CalendarDays className="h-4 w-4" aria-hidden />
          </button>
        }
        label={dict.search.returnDate}
      >
        <input
          type="date"
          name="returnDate"
          value={returnDate}
          min={pickupDate || undefined}
          onChange={(event) => setReturnDate(event.target.value)}
          className="w-full bg-transparent text-sm font-medium text-ink focus:outline-none"
          aria-label={dict.search.returnDate}
        />
      </Cell>

      <Cell
        icon={<SlidersHorizontal className="h-4 w-4" aria-hidden />}
        label={dict.search.carType}
        isSelect
      >
        <select
          name="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full appearance-none bg-transparent pe-5 text-sm font-medium text-ink focus:outline-none"
          aria-label={dict.search.carType}
        >
          <option value="">{dict.search.anyCar}</option>
          {categories.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Cell>

      <button type="submit" className="btn-primary h-full min-h-12 w-full lg:w-auto lg:px-6">
        <Search className="h-4 w-4" aria-hidden />
        <span>{dict.search.submit}</span>
      </button>
    </form>
  );
}

function Cell({
  icon,
  label,
  children,
  isSelect = false,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  /** Native selects would paint their own light box on a dark card. */
  isSelect?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 transition-colors focus-within:border-bronze hover:border-line-strong">
      <span className="text-bronze">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
          {label}
        </span>
        <span className="relative mt-0.5 block">
          {children}
          {isSelect && (
            <ChevronDown
              className="pointer-events-none absolute end-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
              aria-hidden
            />
          )}
        </span>
      </span>
    </label>
  );
}
