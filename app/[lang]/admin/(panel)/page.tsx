import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { resolveLocale } from "@/i18n";
import { RESERVED_BOOKING_STATUSES } from "@/lib/booking-availability";
import AtlasDashboard from "@/components/admin/dashboard/atlas-dashboard";
import type { BookingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

/** Bookings whose contracted total still counts toward the estimate. */
const BILLABLE_STATUSES: BookingStatus[] = [...RESERVED_BOOKING_STATUSES, "COMPLETED"];

const TREND_MONTHS = 6;

/**
 * Month buckets [oldest..newest] labelled by their `YYYY-MM` key. Built here so
 * the client component never has to guess which months the series covers.
 */
function monthBuckets(now: Date) {
  return Array.from({ length: TREND_MONTHS }, (_, index) => {
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (TREND_MONTHS - 1 - index), 1)
    );
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    return {
      key: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`,
      start,
      end,
    };
  });
}

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "dashboard");

  const now = new Date();
  const [
    publishedCars,
    totalCars,
    pendingRequests,
    confirmedBookings,
    ongoingRentals,
    collected,
    createdDates,
    statusCountsRaw,
    upcoming,
    recentBookings,
  ] = await Promise.all([
    prisma.car.count({ where: { status: "PUBLISHED" } }),
    prisma.car.count(),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: { in: ["CONFIRMED", "READY_FOR_PICKUP"] } } }),
    prisma.booking.count({ where: { status: "IN_PROGRESS" } }),
    // Only money that exists as a recorded payment is "encaissée" (PRD 193).
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.booking.findMany({ select: { createdAt: true } }),
    prisma.booking.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.booking.findMany({
      where: { status: { in: RESERVED_BOOKING_STATUSES }, pickupAt: { gte: now } },
      take: 5,
      orderBy: { pickupAt: "asc" },
      include: { car: true },
    }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { car: true },
    }),
  ]);

  const estimated = await prisma.booking.aggregate({
    where: { status: { in: BILLABLE_STATUSES } },
    _sum: { totalPrice: true },
  });

  const buckets = monthBuckets(now);
  const monthly = buckets.map((bucket) => ({
    month: bucket.key,
    count: createdDates.filter((b) => b.createdAt >= bucket.start && b.createdAt < bucket.end).length,
  }));

  const label = (car: { name: string | null; brand: string; model: string } | null) =>
    car ? car.name || `${car.brand} ${car.model}` : "-";

  const statusCounts = statusCountsRaw
    .map((row) => ({ status: row.status, count: row._count._all }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);

  const mapBooking = (b: (typeof recentBookings)[number]) => ({
    id: b.id,
    publicRef: b.publicRef,
    customerName: b.customerName,
    carName: label(b.car),
    pickupAt: b.pickupAt,
    returnAt: b.returnAt,
    pickupLocation: b.pickupLocation,
    status: b.status,
    totalPrice: Number(b.totalPrice),
  });

  return (
    <AtlasDashboard
      lang={lang}
      stats={{
        publishedCars,
        totalCars,
        pendingRequests,
        confirmedBookings,
        ongoingRentals,
        collected: Number(collected._sum.amount ?? 0),
        estimated: Number(estimated._sum.totalPrice ?? 0),
      }}
      monthly={monthly}
      monthCount={TREND_MONTHS}
      statusCounts={statusCounts}
      totalBookings={statusCounts.reduce((sum, row) => sum + row.count, 0)}
      upcoming={upcoming.map(mapBooking)}
      recentBookings={recentBookings.map(mapBooking)}
    />
  );
}
