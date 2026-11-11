import Link from "next/link";
import type { BookingStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { RESERVED_BOOKING_STATUSES } from "@/lib/booking-availability";
import { dateParam, formatCurrency, formatDate, formatMonth } from "@/lib/utils";
import { getDict, resolveLocale, tEnum } from "@/i18n";

export const dynamic = "force-dynamic";

/** Bookings whose contracted total is worth reporting; the rest never earned it. */
const BILLABLE_STATUSES: BookingStatus[] = [...RESERVED_BOOKING_STATUSES, "COMPLETED"];

const DEFAULT_MONTHS = 6;
/** A hand-typed `?from=1900-01-01` would otherwise build a 160-row table. */
const MAX_MONTHS = 24;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const dayStart = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};
const monthStart = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
const monthEnd = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
const dayAfter = (date: Date) => new Date(date.getTime() + 86_400_000);

/** Month windows covering [start, end), oldest first. */
function monthBuckets(start: Date, end: Date) {
  const buckets: { start: Date; end: Date }[] = [];
  for (let cursor = monthStart(start); cursor < end; cursor = monthEnd(cursor)) {
    buckets.push({ start: cursor, end: monthEnd(cursor) });
    if (buckets.length > MAX_MONTHS) return null;
  }
  return buckets;
}

const inRange = (date: Date, start: Date, end: Date) => date >= start && date < end;

export default async function AdminReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);
  await requireModule(lang, "reports");
  const t = dict.reports;

  const raw = await searchParams;
  const now = new Date();
  const defaultStart = monthStart(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (DEFAULT_MONTHS - 1), 1))
  );
  const defaultEnd = monthEnd(now);

  const fromParam = dateParam(first(raw.from));
  const toParam = dateParam(first(raw.to));

  let start = fromParam ? dayStart(fromParam) : defaultStart;
  let end = toParam ? dayAfter(dayStart(toParam)) : defaultEnd;

  // A reversed, absurdly long or absurdly old window is refused and the default
  // period is reported as such, instead of showing a table that looks plausible.
  const tooOld = start < new Date(Date.UTC(now.getUTCFullYear() - 5, 0, 1));
  let months = start < end && !tooOld ? monthBuckets(start, end) : null;
  const invalidDates = Boolean(fromParam || toParam) && !months;
  if (!months) {
    start = defaultStart;
    end = defaultEnd;
    months = monthBuckets(start, end)!;
  }

  const [bookingRows, paymentRows, expenseRows] = await Promise.all([
    prisma.booking.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: {
        createdAt: true,
        totalPrice: true,
        status: true,
        car: { select: { name: true, brand: true, model: true } },
      },
    }),
    prisma.payment.findMany({
      where: { status: "PAID", paidAt: { gte: start, lt: end } },
      select: { amount: true, paidAt: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: start, lt: end } },
      select: { amount: true, date: true, category: true },
    }),
  ]);

  const money = (value: number) => formatCurrency(value, lang);
  const billable = bookingRows.filter((row) =>
    BILLABLE_STATUSES.includes(row.status)
  );

  const estimated = billable.reduce((sum, row) => sum + Number(row.totalPrice), 0);
  const collected = paymentRows.reduce((sum, row) => sum + Number(row.amount), 0);
  const expenses = expenseRows.reduce((sum, row) => sum + Number(row.amount), 0);

  const monthly = months.map((bucket) => {
    const monthBookings = bookingRows.filter((row) => inRange(row.createdAt, bucket.start, bucket.end));
    const monthEstimated = monthBookings
      .filter((row) => BILLABLE_STATUSES.includes(row.status))
      .reduce((sum, row) => sum + Number(row.totalPrice), 0);
    const monthCollected = paymentRows
      .filter((row) => inRange(row.paidAt, bucket.start, bucket.end))
      .reduce((sum, row) => sum + Number(row.amount), 0);
    const monthExpenses = expenseRows
      .filter((row) => inRange(row.date, bucket.start, bucket.end))
      .reduce((sum, row) => sum + Number(row.amount), 0);
    return {
      start: bucket.start,
      bookings: monthBookings.length,
      estimated: monthEstimated,
      collected: monthCollected,
      expenses: monthExpenses,
      net: monthCollected - monthExpenses,
    };
  });

  const carLabel = (car: { name: string | null; brand: string; model: string }) =>
    car.name || `${car.brand} ${car.model}`;

  const byCar = new Map<string, { label: string; count: number; amount: number }>();
  for (const row of billable) {
    const label = carLabel(row.car);
    const entry = byCar.get(label) ?? { label, count: 0, amount: 0 };
    entry.count += 1;
    entry.amount += Number(row.totalPrice);
    byCar.set(label, entry);
  }
  const topCars = [...byCar.values()]
    .sort((a, b) => b.count - a.count || b.amount - a.amount)
    .slice(0, 5);

  const byStatus = new Map<BookingStatus, { count: number; amount: number }>();
  for (const row of bookingRows) {
    const entry = byStatus.get(row.status) ?? { count: 0, amount: 0 };
    entry.count += 1;
    entry.amount += Number(row.totalPrice);
    byStatus.set(row.status, entry);
  }
  const statusSplit = [...byStatus.entries()].sort((a, b) => b[1].count - a[1].count);

  const byCategory = new Map<string, { count: number; amount: number }>();
  for (const row of expenseRows) {
    const entry = byCategory.get(row.category) ?? { count: 0, amount: 0 };
    entry.count += 1;
    entry.amount += Number(row.amount);
    byCategory.set(row.category, entry);
  }
  const expenseSplit = [...byCategory.entries()].sort((a, b) => b[1].amount - a[1].amount);

  const cards = [
    { label: t.cards.bookings, hint: t.hints.bookingsHint, value: String(bookingRows.length) },
    { label: t.cards.estimated, hint: t.hints.estimatedHint, value: money(estimated) },
    { label: t.cards.collected, hint: t.hints.collectedHint, value: money(collected) },
    { label: t.cards.expenses, hint: t.hints.expensesHint, value: money(expenses) },
    { label: t.cards.net, hint: t.hints.netHint, value: money(collected - expenses) },
  ];

  const cell = "px-3 py-2 text-xs";
  const head = "px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-[#8190a1]";
  const num = "px-3 py-2 text-right text-xs tabular-nums";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-[#f4f5f7]">{t.title}</h1>
        <p className="mt-1 text-xs text-[#8190a1]">{t.subtitle}</p>
      </div>

      {/* A plain GET form: the period lives in the URL, so a report is shareable. */}
      <form method="get" className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          name="from"
          defaultValue={fromParam ?? ""}
          aria-label={t.period.from}
          className="rounded border border-[#202c3a] bg-[#0d141e] px-2 py-1.5 text-xs text-[#b5c0cd]"
        />
        <input
          type="date"
          name="to"
          defaultValue={toParam ?? ""}
          aria-label={t.period.to}
          className="rounded border border-[#202c3a] bg-[#0d141e] px-2 py-1.5 text-xs text-[#b5c0cd]"
        />
        <button
          type="submit"
          className="rounded bg-[#e5b94f] px-3 py-1.5 text-xs font-medium text-[#0a0a0a] hover:bg-[#f6d57a]"
        >
          {t.period.apply}
        </button>
        {(fromParam || toParam) && (
          <Link
            href={`/${lang}/admin/reports`}
            className="rounded border border-[#202c3a] px-3 py-1.5 text-xs text-[#b5c0cd] hover:bg-white/5"
          >
            {t.period.reset}
          </Link>
        )}
      </form>

      {invalidDates ? (
        <p className="rounded border border-[#fa655e]/40 bg-[#fa655e]/10 px-3 py-2 text-xs text-[#fa655e]">
          {t.period.invalidDates}
        </p>
      ) : (
        <p className="text-xs text-[#8190a1]">
          {t.period.showing
            .replace("{from}", formatDate(start, lang))
            // `end` is exclusive, so the last covered day is the one before it.
            .replace("{to}", formatDate(new Date(end.getTime() - 86_400_000), lang))}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-[#202c3a] bg-[#0d141e] p-4">
            <p className="text-sm text-[#8190a1]">{card.label}</p>
            <p className="mt-1 text-xl font-semibold text-[#f4f5f7]">{card.value}</p>
            <p className="mt-1 text-[11px] text-[#8190a1]">{card.hint}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-[#202c3a] bg-[#0d141e]">
        <h2 className="border-b border-[#202c3a] px-3 py-2.5 text-sm font-semibold text-[#f4f5f7]">
          {t.monthly.title}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#202c3a]">
                <th className={head}>{t.monthly.month}</th>
                <th className={`${head} text-right`}>{t.monthly.bookings}</th>
                <th className={`${head} text-right`}>{t.monthly.estimated}</th>
                <th className={`${head} text-right`}>{t.monthly.collected}</th>
                <th className={`${head} text-right`}>{t.monthly.expenses}</th>
                <th className={`${head} text-right`}>{t.monthly.net}</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((row) => (
                <tr key={row.start.toISOString()} className="border-b border-[#16202c] last:border-0">
                  <td className={cell}>{formatMonth(row.start, lang)}</td>
                  <td className={`${num} text-[#b5c0cd]`}>{row.bookings}</td>
                  <td className={`${num} text-[#b5c0cd]`}>{money(row.estimated)}</td>
                  <td className={`${num} text-[#27d99a]`}>{money(row.collected)}</td>
                  <td className={`${num} text-[#fa655e]`}>{money(row.expenses)}</td>
                  <td className={`${num} font-medium ${row.net < 0 ? "text-[#fa655e]" : "text-[#f4f5f7]"}`}>
                    {money(row.net)}
                  </td>
                </tr>
              ))}
              <tr>
                <td className={`${cell} font-semibold text-[#f4f5f7]`}>{t.totals}</td>
                <td className={`${num} font-semibold text-[#f4f5f7]`}>{bookingRows.length}</td>
                <td className={`${num} font-semibold text-[#f4f5f7]`}>{money(estimated)}</td>
                <td className={`${num} font-semibold text-[#27d99a]`}>{money(collected)}</td>
                <td className={`${num} font-semibold text-[#fa655e]`}>{money(expenses)}</td>
                <td className={`${num} font-semibold ${collected - expenses < 0 ? "text-[#fa655e]" : "text-[#f4f5f7]"}`}>
                  {money(collected - expenses)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-[#202c3a] bg-[#0d141e]">
          <h2 className="border-b border-[#202c3a] px-3 py-2.5 text-sm font-semibold text-[#f4f5f7]">
            {t.topCars.title}
          </h2>
          {topCars.length === 0 ? (
            <p className="px-3 py-4 text-xs text-[#8190a1]">{t.topCars.empty}</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#202c3a]">
                  <th className={head}>{t.topCars.car}</th>
                  <th className={`${head} text-right`}>{t.topCars.bookings}</th>
                  <th className={`${head} text-right`}>{t.topCars.amount}</th>
                </tr>
              </thead>
              <tbody>
                {topCars.map((car) => (
                  <tr key={car.label} className="border-b border-[#16202c] last:border-0">
                    <td className={cell}>{car.label}</td>
                    <td className={`${num} text-[#b5c0cd]`}>{car.count}</td>
                    <td className={`${num} text-[#b5c0cd]`}>{money(car.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="rounded-xl border border-[#202c3a] bg-[#0d141e]">
          <h2 className="border-b border-[#202c3a] px-3 py-2.5 text-sm font-semibold text-[#f4f5f7]">
            {t.statusSplit.title}
          </h2>
          {statusSplit.length === 0 ? (
            <p className="px-3 py-4 text-xs text-[#8190a1]">{t.topCars.empty}</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#202c3a]">
                  <th className={head}>{t.statusSplit.status}</th>
                  <th className={`${head} text-right`}>{t.statusSplit.bookings}</th>
                  <th className={`${head} text-right`}>{t.statusSplit.amount}</th>
                </tr>
              </thead>
              <tbody>
                {statusSplit.map(([status, row]) => (
                  <tr key={status} className="border-b border-[#16202c] last:border-0">
                    <td className={cell}>{tEnum(dict, "bookingStatus", status)}</td>
                    <td className={`${num} text-[#b5c0cd]`}>{row.count}</td>
                    <td className={`${num} text-[#b5c0cd]`}>{money(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-[#202c3a] bg-[#0d141e]">
        <h2 className="border-b border-[#202c3a] px-3 py-2.5 text-sm font-semibold text-[#f4f5f7]">
          {t.expenseSplit.title}
        </h2>
        {expenseSplit.length === 0 ? (
          <p className="px-3 py-4 text-xs text-[#8190a1]">{t.expenseSplit.empty}</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#202c3a]">
                <th className={head}>{t.expenseSplit.category}</th>
                <th className={`${head} text-right`}>{t.expenseSplit.count}</th>
                <th className={`${head} text-right`}>{t.expenseSplit.amount}</th>
              </tr>
            </thead>
            <tbody>
              {expenseSplit.map(([category, row]) => (
                <tr key={category} className="border-b border-[#16202c] last:border-0">
                  <td className={cell}>{tEnum(dict, "expenseCategory", category)}</td>
                  <td className={`${num} text-[#b5c0cd]`}>{row.count}</td>
                  <td className={`${num} text-[#b5c0cd]`}>{money(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="text-[11px] text-[#8190a1]">{t.note}</p>
    </div>
  );
}
