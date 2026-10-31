/**
 * Pure date-range helpers shared by the dashboard server page and the
 * client-side range switcher. Dates are handled in the server/browser local
 * timezone; query params use the `YYYY-MM-DD` key format of `<input type="date">`.
 */

export const DAY_MS = 86_400_000;

/** Maximum selectable window, keeps chart/render volume bounded. */
export const MAX_RANGE_DAYS = 366;

export type PreparedRange = {
  start: Date;
  end: Date;
  fromKey: string;
  toKey: string;
  days: number;
};

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  );
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse a `YYYY-MM-DD` (or full ISO) value as a local calendar date. */
export function parseDateKey(value?: string | null): Date | null {
  if (!value) return null;
  const key = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  // Guard against impossible dates such as 2026-02-31.
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null;
  }
  return date;
}

export function daysBetween(start: Date, end: Date): number {
  const a = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const b = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((b - a) / DAY_MS) + 1;
}

export function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const last = startOfDay(end);
  let cursor = startOfDay(start);
  while (cursor <= last) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

/**
 * Normalize user input into an inclusive day range. Falls back to the last
 * 30 days, swaps an inverted range, and caps the window at 366 days.
 */
export function normalizeRange(from?: string | null, to?: string | null): PreparedRange {
  const today = startOfDay(new Date());
  let toDate = parseDateKey(to) ?? today;
  let fromDate = parseDateKey(from) ?? addDays(toDate, -29);

  if (fromDate > toDate) {
    const swapped = fromDate;
    fromDate = toDate;
    toDate = swapped;
  }

  if (daysBetween(fromDate, toDate) > MAX_RANGE_DAYS) {
    fromDate = addDays(toDate, -(MAX_RANGE_DAYS - 1));
  }

  return {
    start: startOfDay(fromDate),
    end: endOfDay(toDate),
    fromKey: dateKey(fromDate),
    toKey: dateKey(toDate),
    days: daysBetween(fromDate, toDate),
  };
}

/** Same-length window immediately preceding the current range. */
export function previousRange(range: PreparedRange): PreparedRange {
  const previousEndDate = addDays(range.start, -1);
  const previousStartDate = addDays(previousEndDate, -(range.days - 1));
  return {
    start: startOfDay(previousStartDate),
    end: endOfDay(previousEndDate),
    fromKey: dateKey(previousStartDate),
    toKey: dateKey(previousEndDate),
    days: range.days,
  };
}

export type RangePreset = "today" | "last7" | "last30" | "thisMonth";

/** Presets computed against the current local day (used by the switcher). */
export function presetRanges(now = new Date()): Record<RangePreset, { from: string; to: string }> {
  const today = startOfDay(now);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    today: { from: dateKey(today), to: dateKey(today) },
    last7: { from: dateKey(addDays(today, -6)), to: dateKey(today) },
    last30: { from: dateKey(addDays(today, -29)), to: dateKey(today) },
    thisMonth: { from: dateKey(monthStart), to: dateKey(today) },
  };
}
