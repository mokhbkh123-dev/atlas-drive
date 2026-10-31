import "server-only";

import type { BookingSource, BookingStatus } from "@prisma/client";

import { intlLocaleOf, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";

import {
  addDays,
  dateKey,
  eachDay,
  previousRange,
  startOfDay,
  endOfDay,
  type PreparedRange,
} from "./date-range";
import type {
  ActivityRowData,
  BookingRowData,
  DashboardData,
  DashboardKpis,
  DashboardSections,
  DeltaInfo,
  MaintenanceRowData,
  StatusCount,
} from "./types";

const ACTIVE_STATUSES: BookingStatus[] = [
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "IN_PROGRESS",
  "COMPLETED",
];

const UTILIZATION_STATUSES: BookingStatus[] = [
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "IN_PROGRESS",
  "COMPLETED",
];

const ALL_STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
];

const ALL_SOURCES: BookingSource[] = ["WEB", "ADMIN", "PHONE", "WALK_IN"];

const SECTION_LIMIT = 6;

function computeDelta(
  current: number,
  previous: number,
  hasPrevious: boolean
): DeltaInfo {
  // Without previous data (or with a zero baseline) a percentage change would
  // be fabricated — the UI renders "—" instead.
  if (!hasPrevious || previous <= 0) return null;
  const percent = ((current - previous) / previous) * 100;
  const direction =
    Math.abs(percent) < 0.05 ? "flat" : percent > 0 ? "up" : "down";
  return { available: true, percent, direction };
}

function carName(car: { name: string; brand: string; model: string }): string {
  return car.name || `${car.brand} ${car.model}`;
}

type BookingShape = {
  id: string;
  publicRef: string;
  customerName: string;
  status: BookingStatus;
  totalPrice: unknown;
  pickupAt: Date;
  returnAt: Date;
  createdAt: Date;
  car: { name: string; brand: string; model: string };
};

function mapBooking(
  booking: BookingShape,
  balance: number | null = null
): BookingRowData {
  return {
    id: booking.id,
    ref: booking.publicRef,
    customer: booking.customerName,
    car: carName(booking.car),
    status: booking.status,
    amount: Number(booking.totalPrice),
    balance,
    pickupAt: booking.pickupAt.toISOString(),
    returnAt: booking.returnAt.toISOString(),
    createdAt: booking.createdAt.toISOString(),
  };
}

type UtilizationBooking = {
  carId: string;
  pickupAt: Date;
  returnAt: Date;
};

/** Distinct rented car-days (one booking per car per day, overlaps deduped). */
function countRentedCarDays(
  bookings: UtilizationBooking[],
  publishedIds: Set<string>,
  range: PreparedRange
): number {
  const rented = new Set<string>();
  const rangeLastDay = startOfDay(range.end);

  for (const booking of bookings) {
    if (!publishedIds.has(booking.carId)) continue;
    const pickupDay = startOfDay(booking.pickupAt);
    const returnDay = startOfDay(booking.returnAt);
    let cursor = pickupDay > range.start ? pickupDay : range.start;
    const last = returnDay < rangeLastDay ? returnDay : rangeLastDay;
    while (cursor <= last) {
      rented.add(`${booking.carId}|${dateKey(cursor)}`);
      cursor = addDays(cursor, 1);
    }
  }

  return rented.size;
}

export async function getDashboardData(
  lang: Locale,
  range: PreparedRange
): Promise<DashboardData> {
  const prev = previousRange(range);
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const [
    rangePayments,
    previousRevenue,
    rangeBookings,
    previousBookingsCount,
    publishedCars,
    rentedBookings,
    maintenanceNow,
    newCustomersCount,
    previousNewCustomersCount,
    totalCustomers,
    activeBookings,
    currentUtilizationBookings,
    previousUtilizationBookings,
    todayPickups,
    todayPickupsCount,
    todayReturns,
    todayReturnsCount,
    pendingBookings,
    pendingCount,
    overdueBookings,
    overdueCount,
    maintenanceAttention,
    maintenanceAttentionCount,
    recentBookings,
    recentActivity,
  ] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "PAID", paidAt: { gte: range.start, lte: range.end } },
      select: {
        amount: true,
        paidAt: true,
        booking: {
          select: {
            car: { select: { id: true, name: true, brand: true, model: true } },
          },
        },
      },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: prev.start, lte: prev.end } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: range.start, lte: range.end } },
      select: { status: true, source: true, createdAt: true },
    }),
    prisma.booking.count({
      where: { createdAt: { gte: prev.start, lte: prev.end } },
    }),
    prisma.car.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true },
    }),
    prisma.booking.findMany({
      where: { status: "IN_PROGRESS" },
      select: { carId: true },
    }),
    prisma.maintenance.findMany({
      where: {
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        startAt: { lte: todayEnd },
        endAt: { gte: todayStart },
      },
      select: { carId: true },
    }),
    prisma.customer.count({
      where: { createdAt: { gte: range.start, lte: range.end } },
    }),
    prisma.customer.count({
      where: { createdAt: { gte: prev.start, lte: prev.end } },
    }),
    prisma.customer.count(),
    prisma.booking.findMany({
      where: { status: { in: ACTIVE_STATUSES } },
      select: {
        id: true,
        publicRef: true,
        customerName: true,
        status: true,
        totalPrice: true,
        pickupAt: true,
        returnAt: true,
        createdAt: true,
        car: { select: { name: true, brand: true, model: true } },
        payments: { where: { status: "PAID" }, select: { amount: true } },
      },
    }),
    prisma.booking.findMany({
      where: {
        status: { in: UTILIZATION_STATUSES },
        pickupAt: { lte: range.end },
        returnAt: { gte: range.start },
      },
      select: { carId: true, pickupAt: true, returnAt: true },
    }),
    prisma.booking.findMany({
      where: {
        status: { in: UTILIZATION_STATUSES },
        pickupAt: { lte: prev.end },
        returnAt: { gte: prev.start },
      },
      select: { carId: true, pickupAt: true, returnAt: true },
    }),
    prisma.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "READY_FOR_PICKUP"] },
        pickupAt: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { pickupAt: "asc" },
      take: SECTION_LIMIT,
      select: {
        id: true,
        publicRef: true,
        customerName: true,
        status: true,
        totalPrice: true,
        pickupAt: true,
        returnAt: true,
        createdAt: true,
        car: { select: { name: true, brand: true, model: true } },
      },
    }),
    prisma.booking.count({
      where: {
        status: { in: ["CONFIRMED", "READY_FOR_PICKUP"] },
        pickupAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.booking.findMany({
      where: {
        status: { in: ["IN_PROGRESS", "CONFIRMED"] },
        returnAt: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { returnAt: "asc" },
      take: SECTION_LIMIT,
      select: {
        id: true,
        publicRef: true,
        customerName: true,
        status: true,
        totalPrice: true,
        pickupAt: true,
        returnAt: true,
        createdAt: true,
        car: { select: { name: true, brand: true, model: true } },
      },
    }),
    prisma.booking.count({
      where: {
        status: { in: ["IN_PROGRESS", "CONFIRMED"] },
        returnAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.booking.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: SECTION_LIMIT,
      select: {
        id: true,
        publicRef: true,
        customerName: true,
        status: true,
        totalPrice: true,
        pickupAt: true,
        returnAt: true,
        createdAt: true,
        car: { select: { name: true, brand: true, model: true } },
      },
    }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.findMany({
      where: {
        status: "IN_PROGRESS",
        returnAt: { lt: now },
      },
      orderBy: { returnAt: "asc" },
      take: SECTION_LIMIT,
      select: {
        id: true,
        publicRef: true,
        customerName: true,
        status: true,
        totalPrice: true,
        pickupAt: true,
        returnAt: true,
        createdAt: true,
        car: { select: { name: true, brand: true, model: true } },
      },
    }),
    prisma.booking.count({
      where: { status: "IN_PROGRESS", returnAt: { lt: now } },
    }),
    prisma.maintenance.findMany({
      where: {
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        endAt: { gte: todayStart },
      },
      orderBy: [{ status: "asc" }, { startAt: "asc" }],
      take: SECTION_LIMIT,
      select: {
        id: true,
        type: true,
        status: true,
        startAt: true,
        endAt: true,
        car: { select: { id: true, name: true, brand: true, model: true } },
      },
    }),
    prisma.maintenance.count({
      where: {
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        endAt: { gte: todayStart },
      },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        publicRef: true,
        customerName: true,
        status: true,
        totalPrice: true,
        pickupAt: true,
        returnAt: true,
        createdAt: true,
        car: { select: { name: true, brand: true, model: true } },
      },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        action: true,
        summary: true,
        userLabel: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
  ]);

  // --- Revenue ---------------------------------------------------------------
  const revenue = rangePayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );
  const previousRevenueValue = Number(previousRevenue._sum.amount ?? 0);
  const previousRevenueCount = previousRevenue._count._all;
  const revenueDelta = computeDelta(
    revenue,
    previousRevenueValue,
    previousRevenueCount > 0
  );

  const revenueByDay = new Map<string, number>();
  const vehicleRevenue = new Map<
    string,
    { id: string; name: string; revenue: number }
  >();
  for (const payment of rangePayments) {
    const key = dateKey(payment.paidAt);
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + Number(payment.amount));

    const car = payment.booking.car;
    const entry = vehicleRevenue.get(car.id) ?? {
      id: car.id,
      name: carName(car),
      revenue: 0,
    };
    entry.revenue += Number(payment.amount);
    vehicleRevenue.set(car.id, entry);
  }

  // --- Bookings --------------------------------------------------------------
  const statusCounts = new Map<BookingStatus, number>();
  const sourceCounts = new Map<BookingSource, number>();
  for (const booking of rangeBookings) {
    statusCounts.set(
      booking.status,
      (statusCounts.get(booking.status) ?? 0) + 1
    );
    sourceCounts.set(
      booking.source,
      (sourceCounts.get(booking.source) ?? 0) + 1
    );
  }

  const statuses: StatusCount[] = ALL_STATUSES.map((status) => ({
    status,
    count: statusCounts.get(status) ?? 0,
  }));

  const bookingsDelta = computeDelta(
    rangeBookings.length,
    previousBookingsCount,
    previousBookingsCount > 0
  );

  const bookingsByDay = new Map<string, number>();
  for (const booking of rangeBookings) {
    const key = dateKey(booking.createdAt);
    bookingsByDay.set(key, (bookingsByDay.get(key) ?? 0) + 1);
  }

  const dayLabel = new Intl.DateTimeFormat(intlLocaleOf[lang], {
    day: "numeric",
    month: "short",
  });
  const days = eachDay(range.start, range.end);
  const revenueSeries = days.map((day) => {
    const key = dateKey(day);
    return { date: key, label: dayLabel.format(day), value: revenueByDay.get(key) ?? 0 };
  });
  const bookingSeries = days.map((day) => {
    const key = dateKey(day);
    return { date: key, label: dayLabel.format(day), value: bookingsByDay.get(key) ?? 0 };
  });

  const topVehicles = [...vehicleRevenue.values()]
    .filter((vehicle) => vehicle.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const sources = ALL_SOURCES.map((source) => ({
    source,
    count: sourceCounts.get(source) ?? 0,
  }));

  // --- Outstanding / unpaid --------------------------------------------------
  let outstanding = 0;
  const unpaid: BookingRowData[] = [];
  for (const booking of activeBookings) {
    const paid = booking.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
    const balance = Number(booking.totalPrice) - paid;
    if (balance > 0.005) {
      outstanding += balance;
      unpaid.push(mapBooking(booking, balance));
    }
  }
  unpaid.sort((a, b) => (b.balance ?? 0) - (a.balance ?? 0));

  // --- Fleet -----------------------------------------------------------------
  const publishedIds = new Set(publishedCars.map((car) => car.id));
  const rentedIds = new Set(
    rentedBookings
      .map((booking) => booking.carId)
      .filter((carId) => publishedIds.has(carId))
  );
  const maintenanceIds = new Set(
    maintenanceNow
      .map((maintenance) => maintenance.carId)
      .filter((carId) => publishedIds.has(carId))
  );
  const unavailableIds = new Set([...rentedIds, ...maintenanceIds]);
  const availableNow = Math.max(0, publishedIds.size - unavailableIds.size);

  // --- Utilization -----------------------------------------------------------
  const rentedDays = countRentedCarDays(
    currentUtilizationBookings,
    publishedIds,
    range
  );
  const capacityDays = publishedIds.size * range.days;
  const utilizationPercent =
    capacityDays > 0 ? (rentedDays / capacityDays) * 100 : 0;

  const previousRentedDays = countRentedCarDays(
    previousUtilizationBookings,
    publishedIds,
    prev
  );
  const previousCapacityDays = publishedIds.size * prev.days;
  const previousUtilizationPercent =
    previousCapacityDays > 0
      ? (previousRentedDays / previousCapacityDays) * 100
      : 0;
  const utilizationDelta = computeDelta(
    utilizationPercent,
    previousUtilizationPercent,
    previousRentedDays > 0 && previousCapacityDays > 0
  );

  const newCustomersDelta = computeDelta(
    newCustomersCount,
    previousNewCustomersCount,
    previousNewCustomersCount > 0
  );

  const kpis: DashboardKpis = {
    revenue: { value: revenue, delta: revenueDelta },
    outstanding: { value: outstanding, count: unpaid.length },
    bookings: {
      value: rangeBookings.length,
      delta: bookingsDelta,
      byStatus: statuses.filter((status) => status.count > 0),
    },
    utilization: {
      percent: utilizationPercent,
      delta: utilizationDelta,
      rentedDays,
      capacityDays,
    },
    fleet: {
      published: publishedIds.size,
      rented: rentedIds.size,
      available: availableNow,
      maintenance: maintenanceIds.size,
    },
    newCustomers: {
      value: newCustomersCount,
      delta: newCustomersDelta,
      total: totalCustomers,
    },
  };

  // --- Operational sections --------------------------------------------------
  const maintenanceRows: MaintenanceRowData[] = maintenanceAttention.map(
    (maintenance) => ({
      id: maintenance.id,
      carId: maintenance.car.id,
      car: carName(maintenance.car),
      type: maintenance.type,
      status: maintenance.status,
      startAt: maintenance.startAt.toISOString(),
      endAt: maintenance.endAt.toISOString(),
    })
  );

  const activityRows: ActivityRowData[] = recentActivity.map((entry) => {
    const label = entry.userLabel.split("<")[0].trim();
    return {
      id: entry.id,
      action: entry.action,
      summary: entry.summary ?? entry.action,
      actor: entry.user?.name ?? (entry.userLabel === "system" ? "" : label),
      createdAt: entry.createdAt.toISOString(),
    };
  });

  const sections: DashboardSections = {
    pickups: {
      count: todayPickupsCount,
      items: todayPickups.map((booking) => mapBooking(booking)),
    },
    returns: {
      count: todayReturnsCount,
      items: todayReturns.map((booking) => mapBooking(booking)),
    },
    pending: {
      count: pendingCount,
      items: pendingBookings.map((booking) => mapBooking(booking)),
    },
    overdue: {
      count: overdueCount,
      items: overdueBookings.map((booking) => mapBooking(booking)),
    },
    unpaid: {
      count: unpaid.length,
      items: unpaid.slice(0, SECTION_LIMIT),
    },
    maintenance: {
      count: maintenanceAttentionCount,
      items: maintenanceRows,
    },
    recentBookings: {
      count: recentBookings.length,
      items: recentBookings.map((booking) => mapBooking(booking)),
    },
    activity: {
      count: activityRows.length,
      items: activityRows,
    },
  };

  return {
    range: {
      from: range.fromKey,
      to: range.toKey,
      days: range.days,
    },
    kpis,
    charts: {
      revenue: revenueSeries,
      bookings: bookingSeries,
      statuses,
      topVehicles,
      sources,
      utilization: {
        percent: utilizationPercent,
        rentedDays,
        capacityDays,
        previousPercent:
          previousRentedDays > 0 && previousCapacityDays > 0
            ? previousUtilizationPercent
            : null,
      },
    },
    sections,
  };
}
