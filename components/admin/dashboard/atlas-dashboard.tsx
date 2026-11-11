"use client";

import Link from "next/link";
import { Car, CalendarDays, Users, Wallet, ArrowRight, Clock } from "lucide-react";

import { getDict, intlLocaleOf, tEnum, type Locale } from "@/i18n";
import { formatCurrency, formatDate } from "@/lib/utils";

type Booking = {
  id: string;
  publicRef: string;
  customerName: string;
  carName: string;
  pickupAt: Date;
  returnAt: Date;
  pickupLocation: string;
  status: string;
  totalPrice: number;
};

type Stats = {
  publishedCars: number;
  totalCars: number;
  pendingRequests: number;
  confirmedBookings: number;
  ongoingRentals: number;
  collected: number;
  estimated: number;
};

/** Badge colour per status; the wording comes from the dictionary, never from here. */
const statusTone: Record<string, { dot: string; badge: string }> = {
  PENDING: { dot: "#f4c34f", badge: "bg-[#f4c34f]/10 text-[#f4c34f]" },
  CONFIRMED: { dot: "#27d99a", badge: "bg-[#27d99a]/10 text-[#27d99a]" },
  READY_FOR_PICKUP: { dot: "#4aa3ff", badge: "bg-[#4aa3ff]/10 text-[#4aa3ff]" },
  IN_PROGRESS: { dot: "#e5b94f", badge: "bg-[#e5b94f]/10 text-[#e5b94f]" },
  COMPLETED: { dot: "#a78bfa", badge: "bg-[#a78bfa]/10 text-[#a78bfa]" },
  REJECTED: { dot: "#fa655e", badge: "bg-[#fa655e]/10 text-[#fa655e]" },
  CANCELLED: { dot: "#8190a1", badge: "bg-[#8190a1]/10 text-[#8190a1]" },
};

const tone = (status: string) => statusTone[status] ?? statusTone.PENDING;

export default function AtlasDashboard({
  lang,
  stats,
  monthly,
  monthCount,
  statusCounts,
  totalBookings,
  upcoming,
  recentBookings,
}: {
  lang: Locale;
  stats: Stats;
  monthly: { month: string; count: number }[];
  monthCount: number;
  statusCounts: { status: string; count: number }[];
  totalBookings: number;
  upcoming: Booking[];
  recentBookings: Booking[];
}) {
  const dict = getDict(lang);
  const t = dict.admin.dashboard;
  const table = dict.admin.bookings.table;
  const intl = intlLocaleOf[lang];

  const monthLabel = (key: string) => {
    const [year, month] = key.split("-").map(Number);
    return new Intl.DateTimeFormat(intl, { month: "short" }).format(new Date(Date.UTC(year, month - 1, 1)));
  };

  const peak = Math.max(...monthly.map((m) => m.count), 0);
  const hasHistory = peak > 0;

  let offset = 25;
  const arcs = statusCounts.map((row) => {
    const pct = totalBookings ? (row.count / totalBookings) * 100 : 0;
    const arc = { ...row, pct, offset };
    offset -= pct;
    return arc;
  });

  const cards = [
    {
      key: "cars",
      label: t.publishedCars,
      value: String(stats.publishedCars),
      hints: [t.fleetOf.replace("{count}", String(stats.totalCars))],
      icon: Car,
    },
    {
      key: "pending",
      label: t.pendingRequests,
      value: String(stats.pendingRequests),
      hints: [] as string[],
      icon: Clock,
    },
    {
      key: "confirmed",
      label: t.confirmedBookings,
      value: String(stats.confirmedBookings),
      hints: [`${t.ongoingRentals}: ${stats.ongoingRentals}`],
      icon: CalendarDays,
    },
    {
      key: "collected",
      label: t.collected,
      value: formatCurrency(stats.collected, lang),
      hints: [
        t.collectedHint,
        // The estimate is the sum of active contracts, never money in hand.
        `${t.estimated}: ${formatCurrency(stats.estimated, lang)}`,
      ],
      icon: Wallet,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.key} className="rounded-lg border border-[#202c3a] bg-[#0d141e] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5b94f]/10">
                <card.icon className="h-5 w-5 text-[#e5b94f]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#8190a1]">{card.label}</p>
                <p className="mt-1 truncate text-2xl font-semibold text-[#f4f5f7]">{card.value}</p>
              </div>
            </div>
            {card.hints.length > 0 && (
              <div className="mt-3 space-y-0.5">
                {card.hints.map((hint) => (
                  <p key={hint} className="text-[11px] text-[#8190a1]">
                    {hint}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <div className="rounded-lg border border-[#202c3a] bg-[#0d141e] xl:col-span-3">
          <div className="flex items-center justify-between border-b border-[#202c3a] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#f4f5f7]">{t.monthlyTitle}</h3>
            <span className="text-[11px] text-[#8190a1]">{t.lastMonths.replace("{count}", String(monthCount))}</span>
          </div>
          <div className="p-4">
            {!hasHistory ? (
              <p className="py-12 text-center text-xs text-[#8190a1]">{t.monthlyEmpty}</p>
            ) : (
              <>
                <div className="flex h-40 items-stretch gap-3">
                  {monthly.map((bucket) => (
                    <div key={bucket.month} className="flex flex-1 flex-col items-center justify-end gap-1">
                      <span className="text-[11px] text-[#b5c0cd]">{bucket.count}</span>
                      <div
                        className="w-full rounded-t bg-[#e5b94f]/70"
                        style={{ height: `${Math.max((bucket.count / peak) * 100, 2)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-3">
                  {monthly.map((bucket) => (
                    <span key={bucket.month} className="flex-1 text-center text-[10px] text-[#8190a1]">
                      {monthLabel(bucket.month)}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[#202c3a] bg-[#0d141e] xl:col-span-2">
          <div className="border-b border-[#202c3a] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#f4f5f7]">{t.statusTitle}</h3>
          </div>
          <div className="p-4">
            {totalBookings === 0 ? (
              <p className="py-12 text-center text-xs text-[#8190a1]">{t.noData}</p>
            ) : (
              <>
                <div className="flex items-center justify-center">
                  <svg viewBox="0 0 42 42" className="h-32 w-32">
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#1a2332" strokeWidth="3" />
                    {arcs.map((arc) => (
                      <circle
                        key={arc.status}
                        cx="21"
                        cy="21"
                        r="15.91549430918954"
                        fill="transparent"
                        stroke={tone(arc.status).dot}
                        strokeWidth="3"
                        strokeDasharray={`${arc.pct} ${100 - arc.pct}`}
                        strokeDashoffset={`${arc.offset}`}
                      />
                    ))}
                    <text x="21" y="23" textAnchor="middle" className="fill-[#f4f5f7] text-[10px] font-semibold">
                      {totalBookings}
                    </text>
                    <text x="21" y="29" textAnchor="middle" className="fill-[#8190a1] text-[6px]">
                      {t.statusTotal}
                    </text>
                  </svg>
                </div>
                <div className="mt-4 space-y-2">
                  {arcs.map((arc) => (
                    <div key={arc.status} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tone(arc.status).dot }} />
                        <span className="text-[#b5c0cd]">{tEnum(dict, "bookingStatus", arc.status)}</span>
                      </div>
                      <span className="text-[#f4f5f7]">
                        {arc.count} ({Math.round(arc.pct)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-[#202c3a] bg-[#0d141e] xl:col-span-2">
          <div className="flex items-center justify-between border-b border-[#202c3a] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#f4f5f7]">{t.recentTitle}</h3>
            <Link href={`/${lang}/admin/bookings`} className="flex items-center gap-1 text-xs text-[#e5b94f] hover:text-[#f6d57a]">
              {t.seeAll} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#202c3a]">
                  <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">{table.customer}</th>
                  <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">{table.vehicle}</th>
                  <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">{table.dates}</th>
                  <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">{table.status}</th>
                  <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">{table.amount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202c3a]/50">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-xs text-[#8190a1]">
                      {t.recentEmpty}
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-white/2">
                      <td className="px-4 py-3 text-xs text-[#f4f5f7]">
                        <Link href={`/${lang}/admin/bookings/${booking.id}`} className="hover:text-[#e5b94f]">
                          {booking.customerName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#b5c0cd]">{booking.carName}</td>
                      <td className="px-4 py-3 text-xs text-[#b5c0cd]">
                        {formatDate(booking.pickupAt, lang)} - {formatDate(booking.returnAt, lang)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${tone(booking.status).badge}`}>
                          {tEnum(dict, "bookingStatus", booking.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-[#f4f5f7]">{formatCurrency(booking.totalPrice, lang)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-[#202c3a] bg-[#0d141e]">
          <div className="flex items-center justify-between border-b border-[#202c3a] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#f4f5f7]">{t.upcomingTitle}</h3>
            <Users className="h-4 w-4 text-[#8190a1]" />
          </div>
          <div className="divide-y divide-[#202c3a]/50">
            {upcoming.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-[#8190a1]">{t.upcomingEmpty}</p>
            ) : (
              upcoming.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/${lang}/admin/bookings/${booking.id}`}
                  className="block px-4 py-3 hover:bg-white/2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-[#f4f5f7]">{booking.customerName}</p>
                    <span className="whitespace-nowrap text-[11px] text-[#e5b94f]">{formatDate(booking.pickupAt, lang)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#b5c0cd]">
                    {booking.carName} · {booking.pickupLocation}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
