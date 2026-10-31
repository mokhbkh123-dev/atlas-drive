/**
 * Central business rules for the public booking request flow.
 *
 * These rules are shared by the client-side form and the server-side API so
 * the browser can never submit a total or a duration that the server would
 * disagree with.
 *
 * NOTE: vehicle catalogue prices (`Car.dailyPrice`) are intentionally left
 * untouched. The booking request uses the requested daily rental price below.
 */

/** Minimum number of calendar days a rental request may cover. */
export const MIN_RENTAL_DAYS = 3;

/** Requested daily rental price for a booking request, in MAD. */
export const REQUESTED_DAILY_PRICE = 250;

export type RentalCalculation = {
  /** Non-negative calendar-day difference between pickup and return. */
  days: number;
  /** Requested daily rental price, in MAD. */
  dailyPrice: number;
  /** days × dailyPrice. */
  total: number;
  /** Whether the return date is after the pickup date. */
  validRange: boolean;
  /** Whether the duration respects MIN_RENTAL_DAYS. */
  meetsMinimum: boolean;
  /** Minimum duration, exposed for UI messages. */
  minDays: number;
};

function calendarDayNumber(value: string | Date): number | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  }

  if (typeof value !== "string" || !value.trim()) return null;

  // Date inputs and this API use ISO calendar dates (YYYY-MM-DD). Read the
  // date portion directly so the calculation stays timezone-independent.
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate());
}

/**
 * Calendar-day difference between the pickup date and the return date.
 * Returns 0 when either date is missing or invalid.
 */
export function getRentalDays(pickupAt: string | Date, returnAt: string | Date): number {
  const pickupDay = calendarDayNumber(pickupAt);
  const returnDay = calendarDayNumber(returnAt);
  if (pickupDay === null || returnDay === null) return 0;

  const diff = Math.round((returnDay - pickupDay) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

/** Whether the return calendar day is strictly after the pickup calendar day. */
export function hasValidDateRange(pickupAt: string | Date, returnAt: string | Date): boolean {
  const pickupDay = calendarDayNumber(pickupAt);
  const returnDay = calendarDayNumber(returnAt);
  if (pickupDay === null || returnDay === null) return false;
  return returnDay > pickupDay;
}

/** Calculate duration, requested daily price and estimated total. */
export function calculateRental(pickupAt: string | Date, returnAt: string | Date): RentalCalculation {
  const days = getRentalDays(pickupAt, returnAt);
  const validRange = hasValidDateRange(pickupAt, returnAt);

  return {
    days,
    dailyPrice: REQUESTED_DAILY_PRICE,
    total: days * REQUESTED_DAILY_PRICE,
    validRange,
    meetsMinimum: validRange && days >= MIN_RENTAL_DAYS,
    minDays: MIN_RENTAL_DAYS,
  };
}
