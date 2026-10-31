import Link from "next/link";
import {
  Activity,
  AlarmClock,
  ArrowRight,
  CalendarDays,
  Car,
  CircleDollarSign,
  Clock3,
  CreditCard,
  History,
  KeyRound,
  LogIn,
  ReceiptText,
  RotateCcw,
  Star,
  UserCog,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  EmptyState,
  cn,
  type BadgeTone,
} from "@/components/admin/ui";
import { getDict, tEnum, type Locale } from "@/i18n";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

import { BOOKING_STATUS_TONE } from "./badges";
import { formatNumber, timeAgo } from "./format";
import type {
  ActivityRowData,
  BookingRowData,
  DashboardSections,
  MaintenanceRowData,
} from "./types";

type SectionTone = "navy" | "red" | "amber" | "teal" | "blue" | "slate";

const TONE_ICON: Record<SectionTone, string> = {
  navy: "bg-[#e8edf7] text-admin-navy",
  red: "bg-red-50 text-admin-red",
  amber: "bg-amber-50 text-amber-700",
  teal: "bg-teal-50 text-teal-700",
  blue: "bg-blue-50 text-blue-600",
  slate: "bg-slate-100 text-slate-600",
};

const TONE_BADGE: Record<SectionTone, BadgeTone> = {
  navy: "navy",
  red: "danger",
  amber: "warning",
  teal: "info",
  blue: "info",
  slate: "neutral",
};

function SectionCard({
  lang,
  icon: Icon,
  title,
  count,
  empty,
  tone = "navy",
  viewAllHref,
  viewAllLabel,
  className,
  children,
}: {
  lang: Locale;
  icon: LucideIcon;
  title: string;
  count: number;
  empty: string;
  tone?: SectionTone;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              TONE_ICON[tone]
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <CardTitle className="truncate">{title}</CardTitle>
          <Badge tone={count > 0 ? TONE_BADGE[tone] : "neutral"}>
            {formatNumber(count, lang)}
          </Badge>
        </div>
        {viewAllHref && viewAllLabel ? (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-admin-muted transition-colors hover:text-admin-navy"
          >
            {viewAllLabel}
            <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
          </Link>
        ) : null}
      </CardHeader>

      {count === 0 ? (
        <div className="p-4">
          <EmptyState icon={Icon} title={empty} className="py-8" />
        </div>
      ) : (
        <div className="flex-1 divide-y divide-admin-line">{children}</div>
      )}
    </Card>
  );
}

function AssignmentRow({
  lang,
  item,
  dateKind,
  overdue = false,
}: {
  lang: Locale;
  item: BookingRowData;
  dateKind: "pickup" | "return" | "created";
  overdue?: boolean;
}) {
  const dict = getDict(lang);
  const t = dict.dashboard;
  const date =
    dateKind === "pickup"
      ? item.pickupAt
      : dateKind === "return"
        ? item.returnAt
        : item.createdAt;
  const dateLabel =
    dateKind === "return" ? t.sections.returnDue : t.sections.pickupDue;

  return (
    <Link
      href={`/${lang}/admin/bookings/${item.id}`}
      className={cn(
        "flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-admin-bg/60",
        overdue && "bg-red-50/50 hover:bg-red-50"
      )}
    >
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-medium text-admin-ink">
          <span className="truncate">{item.customer}</span>
          <span className="hidden shrink-0 text-[11px] font-normal text-admin-muted sm:inline">
            {item.ref}
          </span>
        </p>
        <p className="mt-0.5 truncate text-xs text-admin-muted">{item.car}</p>
      </div>
      <div className="shrink-0 text-end">
        <p
          className={cn(
            "text-xs font-medium tabular-nums",
            overdue ? "text-admin-red" : "text-admin-ink"
          )}
        >
          {formatDateTime(date, lang)}
        </p>
        <p className="mt-1 flex items-center justify-end gap-1.5">
          <span
            className={cn(
              "text-[10px]",
              overdue ? "text-admin-red" : "text-admin-muted"
            )}
          >
            {dateLabel}
          </span>
          <Badge tone={BOOKING_STATUS_TONE[item.status]}>
            {tEnum(dict, "bookingStatus", item.status)}
          </Badge>
        </p>
      </div>
    </Link>
  );
}

function UnpaidRow({ lang, item }: { lang: Locale; item: BookingRowData }) {
  const dict = getDict(lang);
  const t = dict.dashboard;

  return (
    <Link
      href={`/${lang}/admin/bookings/${item.id}`}
      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-admin-bg/60"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-admin-ink">{item.customer}</p>
        <p className="mt-0.5 truncate text-xs text-admin-muted">
          {item.car} · {item.ref}
        </p>
      </div>
      <div className="shrink-0 text-end">
        <p className="text-sm font-semibold text-admin-red tabular-nums">
          {formatCurrency(item.balance ?? 0, lang)}
        </p>
        <p className="mt-0.5 text-[11px] text-admin-muted">
          {t.sections.balance} · {formatDate(item.returnAt, lang)}
        </p>
      </div>
    </Link>
  );
}

function RecentBookingRow({ lang, item }: { lang: Locale; item: BookingRowData }) {
  const dict = getDict(lang);

  return (
    <Link
      href={`/${lang}/admin/bookings/${item.id}`}
      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-admin-bg/60"
    >
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-medium text-admin-ink">
          <span className="truncate">{item.customer}</span>
          <span className="hidden shrink-0 text-[11px] font-normal text-admin-muted sm:inline">
            {item.ref}
          </span>
        </p>
        <p className="mt-0.5 truncate text-xs text-admin-muted">{item.car}</p>
      </div>
      <div className="shrink-0 text-end">
        <p className="text-sm font-semibold text-admin-ink tabular-nums">
          {formatCurrency(item.amount, lang)}
        </p>
        <p className="mt-1">
          <Badge tone={BOOKING_STATUS_TONE[item.status]}>
            {tEnum(dict, "bookingStatus", item.status)}
          </Badge>
        </p>
      </div>
    </Link>
  );
}

function MaintenanceRow({
  lang,
  item,
}: {
  lang: Locale;
  item: MaintenanceRowData;
}) {
  const dict = getDict(lang);

  return (
    <Link
      href={`/${lang}/admin/cars/${item.carId}`}
      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-admin-bg/60"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-admin-ink">{item.car}</p>
        <p className="mt-0.5 truncate text-xs text-admin-muted">
          {tEnum(dict, "maintenanceType", item.type)}
        </p>
      </div>
      <div className="shrink-0 text-end">
        <p className="text-xs font-medium text-admin-ink tabular-nums">
          {formatDate(item.startAt, lang)} – {formatDate(item.endAt, lang)}
        </p>
        <p className="mt-1">
          <Badge
            tone={item.status === "IN_PROGRESS" ? "warning" : "info"}
          >
            {tEnum(dict, "maintenanceStatus", item.status)}
          </Badge>
        </p>
      </div>
    </Link>
  );
}

function actionIcon(action: string): LucideIcon {
  if (action.startsWith("booking.")) return CalendarDays;
  if (action.startsWith("payment.")) return CreditCard;
  if (action.startsWith("car.")) return Car;
  if (action.startsWith("customer.")) return Users;
  if (action.startsWith("maintenance.")) return Wrench;
  if (action.startsWith("expense.")) return Wallet;
  if (action.startsWith("invoice.")) return ReceiptText;
  if (action.startsWith("staff.")) return UserCog;
  if (action.startsWith("review.")) return Star;
  if (action.startsWith("auth.")) return LogIn;
  return Activity;
}

function ActivityRow({ lang, item }: { lang: Locale; item: ActivityRowData }) {
  const dict = getDict(lang);
  const t = dict.dashboard;
  const Icon = actionIcon(item.action);

  return (
    <div className="flex items-start gap-3 px-5 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8edf7] text-admin-navy">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-admin-ink">{item.summary}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-admin-muted">
          <span className="font-medium text-admin-ink/80">
            {item.actor || t.sections.system}
          </span>
          <span aria-hidden>·</span>
          <span>
            {timeAgo(item.createdAt, lang, t.timeAgo)}
          </span>
        </p>
      </div>
    </div>
  );
}

export default function OperationalSections({
  lang,
  sections,
}: {
  lang: Locale;
  sections: DashboardSections;
}) {
  const t = getDict(lang).dashboard;
  const bookingsHref = `/${lang}/admin/bookings`;

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      <SectionCard
        lang={lang}
        icon={KeyRound}
        title={t.sections.pickups.title}
        count={sections.pickups.count}
        empty={t.sections.pickups.empty}
        tone="teal"
        viewAllHref={bookingsHref}
        viewAllLabel={t.sections.viewAll}
      >
        {sections.pickups.items.map((item) => (
          <AssignmentRow key={item.id} lang={lang} item={item} dateKind="pickup" />
        ))}
      </SectionCard>

      <SectionCard
        lang={lang}
        icon={RotateCcw}
        title={t.sections.returns.title}
        count={sections.returns.count}
        empty={t.sections.returns.empty}
        tone="blue"
        viewAllHref={bookingsHref}
        viewAllLabel={t.sections.viewAll}
      >
        {sections.returns.items.map((item) => (
          <AssignmentRow key={item.id} lang={lang} item={item} dateKind="return" />
        ))}
      </SectionCard>

      <SectionCard
        lang={lang}
        icon={Clock3}
        title={t.sections.pending.title}
        count={sections.pending.count}
        empty={t.sections.pending.empty}
        tone="amber"
        viewAllHref={bookingsHref}
        viewAllLabel={t.sections.viewAll}
      >
        {sections.pending.items.map((item) => (
          <AssignmentRow key={item.id} lang={lang} item={item} dateKind="pickup" />
        ))}
      </SectionCard>

      <SectionCard
        lang={lang}
        icon={AlarmClock}
        title={t.sections.overdue.title}
        count={sections.overdue.count}
        empty={t.sections.overdue.empty}
        tone="red"
        className={sections.overdue.count > 0 ? "border-red-200" : undefined}
        viewAllHref={bookingsHref}
        viewAllLabel={t.sections.viewAll}
      >
        {sections.overdue.items.map((item) => (
          <AssignmentRow
            key={item.id}
            lang={lang}
            item={item}
            dateKind="return"
            overdue
          />
        ))}
      </SectionCard>

      <SectionCard
        lang={lang}
        icon={CircleDollarSign}
        title={t.sections.unpaid.title}
        count={sections.unpaid.count}
        empty={t.sections.unpaid.empty}
        tone="navy"
        viewAllHref={bookingsHref}
        viewAllLabel={t.sections.viewAll}
      >
        {sections.unpaid.items.map((item) => (
          <UnpaidRow key={item.id} lang={lang} item={item} />
        ))}
      </SectionCard>

      <SectionCard
        lang={lang}
        icon={Wrench}
        title={t.sections.maintenance.title}
        count={sections.maintenance.count}
        empty={t.sections.maintenance.empty}
        tone="amber"
      >
        {sections.maintenance.items.map((item) => (
          <MaintenanceRow key={item.id} lang={lang} item={item} />
        ))}
      </SectionCard>

      <SectionCard
        lang={lang}
        icon={CalendarDays}
        title={t.sections.recentBookings.title}
        count={sections.recentBookings.count}
        empty={t.sections.recentBookings.empty}
        tone="navy"
        viewAllHref={bookingsHref}
        viewAllLabel={t.sections.viewAll}
      >
        {sections.recentBookings.items.map((item) => (
          <RecentBookingRow key={item.id} lang={lang} item={item} />
        ))}
      </SectionCard>

      <SectionCard
        lang={lang}
        icon={History}
        title={t.sections.activity.title}
        count={sections.activity.count}
        empty={t.sections.activity.empty}
        tone="slate"
      >
        {sections.activity.items.map((item) => (
          <ActivityRow key={item.id} lang={lang} item={item} />
        ))}
      </SectionCard>
    </div>
  );
}
