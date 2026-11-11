import { intlLocaleOf, type Locale } from "@/i18n/config";

export function formatCurrency(
  amount: number | string | bigint,
  locale: Locale = "fr"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  return new Intl.NumberFormat(intlLocaleOf[locale], {
    style: "currency",
    currency: "MAD",
  }).format(num);
}

/** Locale-aware short date (e.g. 21/10/2026). */
export function formatDate(
  date: Date | string | number,
  locale: Locale = "fr"
): string {
  return new Date(date).toLocaleDateString(intlLocaleOf[locale]);
}

/** Locale-aware date + time (e.g. 21/10/2026 14:30). */
export function formatDateTime(
  date: Date | string | number,
  locale: Locale = "fr"
): string {
  // The default toLocaleString appends seconds, which is noise for a rental
  // window that is always booked on a whole minute. dateStyle:"short" would
  // drop them but also abbreviates the year, so the fields are listed instead.
  return new Date(date).toLocaleString(intlLocaleOf[locale], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Locale-aware month header, e.g. "novembre 2026" / "نوفمبر ٢٠٢٦". */
export function formatMonth(date: Date | string | number, locale: Locale = "fr"): string {
  return new Intl.DateTimeFormat(intlLocaleOf[locale], {
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Accept only a real `YYYY-MM-DD` calendar date from a URL. A shape-only test
 * lets `2026-13-45` through, which then renders as "Invalid Date".
 */
export function dateParam(value?: string): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  const roundTrips =
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;
  return roundTrips ? value : undefined;
}

export type SearchContext = {
  pickupDate?: string;
  returnDate?: string;
  city?: string;
};

/**
 * Appends the period and pickup city chosen in the search bar to a fleet or
 * booking link, so the request form opens prefilled instead of empty.
 */
export function withSearchContext(href: string, context: SearchContext): string {
  const query = new URLSearchParams();
  if (context.pickupDate) query.set("pickupDate", context.pickupDate);
  if (context.returnDate) query.set("returnDate", context.returnDate);
  if (context.city) query.set("city", context.city);
  const params = query.toString();
  if (!params) return href;
  return `${href}${href.includes("?") ? "&" : "?"}${params}`;
}
