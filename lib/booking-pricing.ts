/**
 * Central business rules for the public booking request flow.
 *
 * Duration rules are shared by the client-side form and the server-side API so
 * the browser can never submit a total that the server would disagree with.
 *
 * Pricing is server-side only: the public booking form must not display a
 * daily rate or a total, because a request is only an enquiry until the agency
 * confirms it. `quoteRental` is therefore called from API routes and is used to
 * store the agreed tariff on the booking record.
 */

import type { Car } from "@prisma/client";

/** Minimum number of calendar days a rental request may cover. */
export const MIN_RENTAL_DAYS = 3;

/** Values Prisma returns Decimal columns as, plus serialized client payloads. */
type MoneyInput = string | number | null | undefined | { toString(): string };

/** Convert a Decimal/string/number money value to a non-negative number. */
export function toMoney(value: MoneyInput): number {
  if (value === null || value === undefined) return 0;
  const parsed = Number(typeof value === "object" ? value.toString() : value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/** Round to the smallest currency unit (2 decimals) for MAD. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export type RentalDuration = {
  /** Non-negative calendar-day difference between pickup and return. */
  days: number;
  /** Whether the return date is after the pickup date. */
  validRange: boolean;
  /** Whether the duration respects MIN_RENTAL_DAYS. */
  meetsMinimum: boolean;
  /** Minimum duration, exposed for UI messages. */
  minDays: number;
};

export type RentalQuote = RentalDuration & {
  /** Catalogue daily rate of the vehicle, in MAD. */
  dailyPrice: number;
  /** Caution collected separately at pickup, in MAD. Not part of `total`. */
  deposit: number;
  /** days × dailyPrice, in MAD. */
  total: number;
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

/** Calculate the billable duration of a request, independently of any vehicle. */
export function calculateRentalDuration(pickupAt: string | Date, returnAt: string | Date): RentalDuration {
  const days = getRentalDays(pickupAt, returnAt);
  const validRange = hasValidDateRange(pickupAt, returnAt);

  return {
    days,
    validRange,
    meetsMinimum: validRange && days >= MIN_RENTAL_DAYS,
    minDays: MIN_RENTAL_DAYS,
  };
}

/**
 * Price a request from the vehicle's own catalogue rate.
 *
 * The deposit is returned separately: it is a caution held at pickup, never a
 * component of the rental price.
 */
export function quoteRental(
  car: Pick<Car, "dailyPrice" | "deposit">,
  pickupAt: string | Date,
  returnAt: string | Date
): RentalQuote {
  const duration = calculateRentalDuration(pickupAt, returnAt);
  const dailyPrice = toMoney(car.dailyPrice);

  return {
    ...duration,
    dailyPrice,
    deposit: toMoney(car.deposit),
    total: roundMoney(dailyPrice * duration.days),
  };
}
