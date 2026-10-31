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
  return new Date(date).toLocaleString(intlLocaleOf[locale]);
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

export function generateRef(prefix = "AD"): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${y}${m}${d}-${rand}`;
}
