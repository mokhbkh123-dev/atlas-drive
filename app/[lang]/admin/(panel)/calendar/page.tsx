import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { getDict, resolveLocale, tEnum } from "@/i18n";
import { formatCurrency, formatDate } from "@/lib/utils";
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

const CALENDAR_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "IN_PROGRESS",
  "COMPLETED",
] as const;

export default async function AdminCalendarPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "calendar");

  const dict = getDict(lang);
  const t = dict.calendar;
  const table = dict.admin.bookings.table;

  const bookings = await prisma.booking.findMany({
    where: { status: { in: [...CALENDAR_STATUSES] } },
    include: { car: { select: { id: true, name: true, brand: true, model: true } } },
    orderBy: { pickupAt: "asc" },
  });

  return (
    <div className="space-y-5">
      <PageHeader title={t.title} description={t.subtitle} />

      {bookings.length === 0 ? (
        <EmptyState icon={CalendarDays} title={t.empty} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-admin-line bg-admin-surface">
          <Table>
            <thead>
              <tr>
                <TH>{table.reference}</TH>
                <TH>{table.customer}</TH>
                <TH className="hidden md:table-cell">{table.vehicle}</TH>
                <TH>{table.dates}</TH>
                <TH className="text-end">{table.amount}</TH>
                <TH>{table.status}</TH>
                <TH className="sr-only">{dict.admin.bookings.details}</TH>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <TR key={booking.id}>
                  <TD className="font-medium whitespace-nowrap">{booking.publicRef}</TD>
                  <TD className="whitespace-nowrap">
                    <div>{booking.customerName}</div>
                    <div className="text-xs text-admin-muted" dir="ltr">
                      {booking.customerPhone}
                    </div>
                  </TD>
                  <TD className="hidden whitespace-nowrap text-admin-muted md:table-cell">
                    {booking.car.name || `${booking.car.brand} ${booking.car.model}`}
                  </TD>
                  <TD className="whitespace-nowrap text-admin-muted">
                    <div>
                      <span className="text-admin-muted-2">{t.pickup}:</span>{" "}
                      {formatDate(booking.pickupAt, lang)}
                    </div>
                    <div>
                      <span className="text-admin-muted-2">{t.return}:</span>{" "}
                      {formatDate(booking.returnAt, lang)}
                    </div>
                  </TD>
                  <TD className="text-end whitespace-nowrap">
                    {formatCurrency(Number(booking.totalPrice), lang)}
                  </TD>
                  <TD>
                    <Badge tone={bookingStatusTone(booking.status)}>
                      {tEnum(dict, "bookingStatus", booking.status)}
                    </Badge>
                  </TD>
                  <TD className="text-end whitespace-nowrap">
                    <Link
                      href={`/${lang}/admin/bookings/${booking.id}`}
                      className="text-admin-gold hover:text-admin-gold-light"
                    >
                      {dict.admin.bookings.details}
                    </Link>
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
