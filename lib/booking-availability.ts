import type { BookingStatus, Prisma } from "@prisma/client";

/**
 * Availability checks for a booking period.
 *
 * Both a booking and a maintenance job occupy the vehicle, so a period is free
 * only when it overlaps neither. Pass a `tx` client so the check and the write
 * that follows it happen in the same transaction.
 */

/**
 * Booking statuses that actually hold the vehicle.
 *
 * A PENDING request is only an enquiry: it has no agreed rate and no pickup, so
 * it must not block anything. Treating it as blocking deadlocks the vehicle —
 * two enquiries on the same period would each refuse to be confirmed.
 */
export const RESERVED_BOOKING_STATUSES: BookingStatus[] = ["CONFIRMED", "READY_FOR_PICKUP", "IN_PROGRESS"];

/** Maintenance jobs that still hold the vehicle. */
const ACTIVE_MAINTENANCE_STATUSES = ["SCHEDULED", "IN_PROGRESS"];

export type PeriodConflict = "BOOKING_CONFLICT" | "MAINTENANCE_CONFLICT";

export async function findPeriodConflict(
  client: Prisma.TransactionClient,
  input: {
    carId: string;
    pickupAt: Date;
    returnAt: Date;
    bookingStatuses: BookingStatus[];
    /** Exclude a booking from the overlap scan, used when confirming itself. */
    ignoreBookingId?: string;
  }
): Promise<PeriodConflict | null> {
  const { carId, pickupAt, returnAt, bookingStatuses, ignoreBookingId } = input;

  // Half-open interval [pickup, return): a return at 10:00 and a pickup at
  // 10:00 on the same day do not overlap.
  const overlap = {
    pickupAt: { lt: returnAt },
    returnAt: { gt: pickupAt },
  };

  const conflictingBooking = await client.booking.findFirst({
    where: {
      carId,
      status: { in: bookingStatuses },
      ...(ignoreBookingId ? { id: { not: ignoreBookingId } } : {}),
      ...overlap,
    },
    select: { id: true },
  });
  if (conflictingBooking) return "BOOKING_CONFLICT";

  const conflictingMaintenance = await client.maintenance.findFirst({
    where: {
      carId,
      status: { in: ACTIVE_MAINTENANCE_STATUSES },
      startAt: { lt: returnAt },
      endAt: { gt: pickupAt },
    },
    select: { id: true },
  });
  if (conflictingMaintenance) return "MAINTENANCE_CONFLICT";

  return null;
}

/**
 * Car ids held by a reserved booking or an active maintenance job during
 * [pickupAt, returnAt). Used by the public fleet listing so a period search
 * cannot offer a vehicle that is already spoken for.
 */
export async function findUnavailableCarIds(
  client: Prisma.TransactionClient,
  input: { pickupAt: Date; returnAt: Date }
): Promise<Set<string>> {
  const { pickupAt, returnAt } = input;
  const [bookings, jobs] = await Promise.all([
    client.booking.findMany({
      where: {
        status: { in: RESERVED_BOOKING_STATUSES },
        pickupAt: { lt: returnAt },
        returnAt: { gt: pickupAt },
      },
      select: { carId: true },
    }),
    client.maintenance.findMany({
      where: {
        status: { in: ACTIVE_MAINTENANCE_STATUSES },
        startAt: { lt: returnAt },
        endAt: { gt: pickupAt },
      },
      select: { carId: true },
    }),
  ]);
  return new Set([...bookings, ...jobs].map((row) => row.carId));
}
