import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import Link from "next/link";
import type { BookingStatus, Prisma } from "@prisma/client";
import { getDict, resolveLocale, tEnum } from "@/i18n";
import { dateParam } from "@/lib/utils";

const STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
];

/** Badge colour per status; the wording comes from the dictionary, never from here. */
const statusTone: Record<BookingStatus, string> = {
  PENDING: "bg-[#f4c34f]/10 text-[#f4c34f]",
  CONFIRMED: "bg-[#27d99a]/10 text-[#27d99a]",
  READY_FOR_PICKUP: "bg-[#27d99a]/10 text-[#27d99a]",
  IN_PROGRESS: "bg-[#4aa3ff]/10 text-[#4aa3ff]",
  COMPLETED: "bg-[#a78bfa]/10 text-[#a78bfa]",
  REJECTED: "bg-[#fa655e]/10 text-[#fa655e]",
  CANCELLED: "bg-[#fa655e]/10 text-[#fa655e]",
};

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function AdminBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);
  await requireModule(lang, "reservations");

  const raw = await searchParams;
  const statusParam = first(raw.status);
  const status = STATUSES.includes(statusParam as BookingStatus)
    ? (statusParam as BookingStatus)
    : undefined;

  const cars = await prisma.car.findMany({
    select: { id: true, name: true, brand: true, model: true },
    orderBy: { createdAt: "desc" },
  });
  // An invented car id would silently return nothing; ignoring it keeps the
  // result count honest about what actually filtered.
  const carId = cars.find((car) => car.id === first(raw.carId))?.id;

  const from = dateParam(first(raw.from));
  const to = dateParam(first(raw.to));
  const q = (first(raw.q) ?? "").trim().slice(0, 60);

  const where: Prisma.BookingWhereInput = {
    ...(status ? { status } : {}),
    ...(carId ? { carId } : {}),
    ...(from || to
      ? {
          pickupAt: {
            ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
            // Half-open like the availability rules: the "to" day counts fully.
            ...(to ? { lt: new Date(new Date(`${to}T00:00:00`).getTime() + 86_400_000) } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { customerName: { contains: q } },
            { customerPhone: { contains: q } },
            { publicRef: { contains: q } },
          ],
        }
      : {}),
  };

  const bookings = await prisma.booking.findMany({
    where,
    include: { car: true },
    orderBy: { createdAt: "desc" },
  });

  const isFiltered = Boolean(status || carId || from || to || q);
  const formatDate = (d: Date) => d.toLocaleDateString("fr-FR");
  const carLabel = (car: { name: string | null; brand: string; model: string }) =>
    car.name || `${car.brand} ${car.model}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#f4f5f7]">{dict.admin.bookings.title}</h1>
      </div>

      {/* A plain GET form: the filters live in the URL, so a search is shareable
          and survives a reload without any client-side state. */}
      <form method="get" className="flex flex-wrap items-center gap-2">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded border border-[#202c3a] bg-[#0d141e] px-2 py-1.5 text-xs text-[#b5c0cd]"
        >
          <option value="">{dict.admin.bookings.filters.allStatuses}</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {tEnum(dict, "bookingStatus", value)}
            </option>
          ))}
        </select>

        <select
          name="carId"
          defaultValue={carId ?? ""}
          className="rounded border border-[#202c3a] bg-[#0d141e] px-2 py-1.5 text-xs text-[#b5c0cd]"
        >
          <option value="">{dict.admin.bookings.filters.allVehicles}</option>
          {cars.map((car) => (
            <option key={car.id} value={car.id}>
              {carLabel(car)}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="from"
          defaultValue={from ?? ""}
          aria-label={dict.admin.bookings.filters.from}
          className="rounded border border-[#202c3a] bg-[#0d141e] px-2 py-1.5 text-xs text-[#b5c0cd]"
        />
        <input
          type="date"
          name="to"
          defaultValue={to ?? ""}
          aria-label={dict.admin.bookings.filters.to}
          className="rounded border border-[#202c3a] bg-[#0d141e] px-2 py-1.5 text-xs text-[#b5c0cd]"
        />

        <input
          type="search"
          name="q"
          defaultValue={q}
          maxLength={60}
          placeholder={dict.admin.bookings.filters.search}
          className="rounded border border-[#202c3a] bg-[#0d141e] px-2 py-1.5 text-xs text-[#b5c0cd] w-52"
        />

        <button
          type="submit"
          className="rounded bg-[#e5b94f] px-3 py-1.5 text-xs font-medium text-[#0a0a0a] hover:bg-[#f6d57a]"
        >
          {dict.admin.bookings.filters.apply}
        </button>

        {isFiltered && (
          <Link
            href={`/${lang}/admin/bookings`}
            className="rounded border border-[#202c3a] px-3 py-1.5 text-xs text-[#b5c0cd] hover:bg-white/5"
          >
            {dict.admin.bookings.filters.reset}
          </Link>
        )}
      </form>

      <p className="text-xs text-[#8190a1]">
        {dict.admin.bookings.filters.results.replace(
          "{count}",
          String(bookings.length)
        )}
      </p>

      <div className="rounded-lg border border-[#202c3a] bg-[#0d141e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#202c3a]">
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">
                  {dict.admin.bookings.table.reference}
                </th>
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">
                  {dict.admin.bookings.table.customer}
                </th>
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">
                  {dict.admin.bookings.table.vehicle}
                </th>
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">
                  {dict.admin.bookings.table.dates}
                </th>
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">
                  {dict.admin.bookings.table.status}
                </th>
                <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">
                  {dict.admin.bookings.table.amount}
                </th>
                <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-[#8190a1]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202c3a]/50">
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-xs text-[#8190a1]">
                    {dict.admin.bookings.filters.noResults}
                  </td>
                </tr>
              )}
              {bookings.map((booking) => {
                const tone = statusTone[booking.status] ?? statusTone.PENDING;
                return (
                  <tr key={booking.id} className="hover:bg-white/2">
                    <td className="px-4 py-2.5 font-mono text-xs text-[#b5c0cd]">
                      {booking.publicRef}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a2332] text-xs text-[#e5b94f]">
                          {booking.customerName
                            .split(" ")
                            .map((n) => n[0])
                            .filter(Boolean)
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span className="text-xs text-[#f4f5f7]">{booking.customerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[#b5c0cd]">
                      {booking.car ? carLabel(booking.car) : "-"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[#b5c0cd]">
                      {formatDate(booking.pickupAt)} - {formatDate(booking.returnAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${tone}`}
                      >
                        {tEnum(dict, "bookingStatus", booking.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-[#f4f5f7]">
                      {Number(booking.totalPrice).toLocaleString("fr-FR")} MAD
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href={`/${lang}/admin/bookings/${booking.id}`}
                        className="rounded border border-[#202c3a] px-2 py-1 text-[10px] text-[#b5c0cd] hover:bg-white/5 hover:text-[#e5b94f]"
                      >
                        {dict.admin.bookings.details}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
