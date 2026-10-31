import { intlLocaleOf, type Locale } from "@/i18n";

/** Replace `{token}` placeholders with values (numbers are pre-formatted). */
export function interpolate(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}

export function formatNumber(
  value: number,
  lang: Locale,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(intlLocaleOf[lang], options).format(value);
}

/** `fraction` is 0…1 (Intl percent style). */
export function formatPercent(fraction: number, lang: Locale): string {
  return new Intl.NumberFormat(intlLocaleOf[lang], {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(fraction);
}

/** Compact axis label (e.g. 12,5 k). */
export function formatCompact(value: number, lang: Locale): string {
  return new Intl.NumberFormat(intlLocaleOf[lang], {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatShortDate(value: Date | string, lang: Locale): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(intlLocaleOf[lang], {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export type TimeAgoLabels = {
  justNow: string;
  minutes: string;
  hours: string;
  days: string;
};

/** Locale-aware relative time used by the recent-activity feed. */
export function timeAgo(
  value: Date | string,
  lang: Locale,
  labels: TimeAgoLabels,
  now = new Date()
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) return labels.justNow;
  if (minutes < 60) {
    return interpolate(labels.minutes, { count: formatNumber(minutes, lang) });
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return interpolate(labels.hours, { count: formatNumber(hours, lang) });
  }

  const days = Math.floor(hours / 24);
  return interpolate(labels.days, { count: formatNumber(days, lang) });
}
