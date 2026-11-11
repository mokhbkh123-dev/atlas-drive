import Link from "next/link";
import { Car, CheckCircle2 } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { getDict, resolveLocale, tEnum } from "@/i18n";
import { formatDate } from "@/lib/utils";
import {
  Badge,
  EmptyState,
  PageHeader,
  Table,
  TD,
  TH,
  TR,
} from "@/components/admin/ui";
import { bookingStatusTone } from "@/components/admin/fleet/helpers";

export const dynamic = "force-dynamic";

// A pending request already blocks the vehicle: the owner has to see it before
// deciding, so it counts as reserved here.
const RESERVING_STATUSES = ["PENDING", "CONFIRMED", "READY_FOR_PICKUP", "IN_PROGRESS"] as const;

export default async function AdminAvailabilityPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "availability");

  const dict = getDict(lang);
  const t = dict.availability;

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const [cars, bookings] = await Promise.all([
    prisma.car.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ brand: "asc" }, { model: "asc" }],
    }),
    prisma.booking.findMany({
      where: {
        status: { in: [...RESERVING_STATUSES] },
        returnAt: { gte: startOfToday },
      },
      select: {
        id: true,
        publicRef: true,
        customerName: true,
        pickupAt: true,
        returnAt: true,
        status: true,
        carId: true,
      },
      orderBy: { pickupAt: "asc" },
    }),
  ]);

  const bookingsByCar = new Map<string, typeof bookings>();
  for (const booking of bookings) {
    const list = bookingsByCar.get(booking.carId);
    if (list) list.push(booking);
    else bookingsByCar.set(booking.carId, [booking]);
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t.title} description={t.subtitle} />

      {cars.length === 0 ? (
        <EmptyState icon={Car} title={t.empty} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-admin-line bg-admin-surface">
          <Table>
            <thead>
              <tr>
                <TH>{dict.admin.bookings.table.vehicle}</TH>
                <TH>{dict.fleet.list.columns.availability}</TH>
                <TH className="text-end">{dict.admin.bookings.title}</TH>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => {
                const carBookings = bookingsByCar.get(car.id) ?? [];
                return (
                  <TR key={car.id}>
                    <TD>
                      <div className="font-medium">
                        {car.name || `${car.brand} ${car.model}`}
                      </div>
                      <div className="text-xs text-admin-muted">
                        {tEnum(dict, "category", car.category)} •{" "}
                        {tEnum(dict, "transmission", car.transmission)} •{" "}
                        {tEnum(dict, "fuel", car.fuelType)} • {car.seats} {t.seats}
                      </div>
                    </TD>
                    <TD>
                      <Badge tone={carBookings.length === 0 ? "success" : "accent"}>
                        {carBookings.length === 0 ? t.available : t.booked}
                      </Badge>
                    </TD>
                    <TD className="text-end">
                      {carBookings.length === 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-admin-muted">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                          {t.noBookings}
                        </span>
                      ) : (
                        <ul className="space-y-1.5">
                          {carBookings.map((booking) => (
                            <li key={booking.id} className="text-xs text-admin-muted">
                              <Link
                                href={`/${lang}/admin/bookings/${booking.id}`}
                                className="font-medium text-admin-ink hover:text-admin-gold"
                              >
                                {booking.publicRef}
                              </Link>
                              {" — "}
                              {booking.customerName}
                              {" · "}
                              {formatDate(booking.pickupAt, lang)} → {formatDate(booking.returnAt, lang)}
                              {" · "}
                              <Badge tone={bookingStatusTone(booking.status)}>
                                {tEnum(dict, "bookingStatus", booking.status)}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      )}
                    </TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
