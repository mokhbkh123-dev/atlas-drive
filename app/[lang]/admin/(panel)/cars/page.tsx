import Link from "next/link";
import { Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { getDict, resolveLocale } from "@/i18n";
import FleetTable from "@/components/admin/fleet/FleetTable";
import type { FleetRow } from "@/components/admin/fleet/types";

const ACTIVE_BOOKING_STATUSES = [
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "IN_PROGRESS",
] as const;

export default async function AdminCarsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "fleet");
  const t = getDict(lang).fleet.list;

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const [cars, locations] = await Promise.all([
    prisma.car.findMany({
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        location: { select: { id: true, name: true, city: true } },
        _count: { select: { bookings: true, maintenances: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.location.findMany({
      where: { isActive: true },
      select: { id: true, name: true, city: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const carIds = cars.map((car) => car.id);

  const [activeBookings, activeMaintenance] = await Promise.all([
    prisma.booking.findMany({
      where: {
        carId: { in: carIds },
        status: { in: [...ACTIVE_BOOKING_STATUSES] },
        pickupAt: { lte: now },
        returnAt: { gte: now },
      },
      select: { carId: true },
    }),
    prisma.maintenance.findMany({
      where: {
        carId: { in: carIds },
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        startAt: { lte: endOfToday },
        endAt: { gte: startOfToday },
      },
      select: { carId: true },
    }),
  ]);

  const rentedCarIds = new Set(activeBookings.map((booking) => booking.carId));
  const maintenanceCarIds = new Set(
    activeMaintenance.map((maintenance) => maintenance.carId)
  );

  const rows: FleetRow[] = cars.map((car) => {
    const primary = car.images.find((image) => image.isPrimary) ?? car.images[0] ?? null;
    return {
      id: car.id,
      name: car.name || `${car.brand} ${car.model}`,
      brand: car.brand,
      model: car.model,
      year: car.year,
      plateNumber: car.plateNumber,
      category: car.category,
      transmission: car.transmission,
      fuelType: car.fuelType,
      seats: car.seats,
      doors: car.doors,
      dailyPrice: Number(car.dailyPrice),
      status: car.status,
      locationId: car.locationId,
      locationName: car.location?.name ?? null,
      imageUrl: primary?.url ?? null,
      imageAlt: primary?.alt ?? null,
      availability: rentedCarIds.has(car.id)
        ? "rented"
        : maintenanceCarIds.has(car.id)
          ? "maintenance"
          : "available",
      bookingsCount: car._count.bookings,
      maintenancesCount: car._count.maintenances,
      createdAt: car.createdAt.toISOString(),
    };
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-[#f4f5f7]">{t.title}</h1>
          <p className="mt-1 text-xs text-[#8190a1]">{t.subtitle}</p>
        </div>
        <Link
          href={`/${lang}/admin/cars/new`}
          className="inline-flex items-center gap-1.5 rounded bg-[#e5b94f] px-3 py-1.5 text-xs font-medium text-[#0a0a0a] hover:bg-[#f6d57a] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {t.add}
        </Link>
      </div>

      <FleetTable lang={lang} rows={rows} locations={locations} />
    </div>
  );
}
