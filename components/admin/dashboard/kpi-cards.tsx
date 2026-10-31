import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck2,
  Car,
  CircleAlert,
  Gauge,
  Minus,
  UserPlus,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge, Card, cn } from "@/components/admin/ui";
import { getDict, tEnum, type Locale } from "@/i18n";
import { formatCurrency } from "@/lib/utils";

import { BOOKING_STATUS_TONE } from "./badges";
import { formatNumber, formatPercent, interpolate } from "./format";
import type { DashboardKpis, DeltaInfo } from "./types";

function DeltaLine({
  delta,
  label,
  lang,
}: {
  delta: DeltaInfo;
  label: string;
  lang: Locale;
}) {
  if (!delta) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-admin-muted">
        <span className="font-semibold">—</span>
        <span>{label}</span>
      </p>
    );
  }

  const positive = delta.direction === "up";
  const negative = delta.direction === "down";
  const Icon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;

  return (
    <p className="flex items-center gap-1.5 text-xs">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold",
          positive && "bg-emerald-50 text-emerald-700",
          negative && "bg-red-50 text-admin-red",
          !positive && !negative && "bg-slate-100 text-admin-muted"
        )}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {formatPercent(Math.abs(delta.percent) / 100, lang)}
      </span>
      <span className="text-admin-muted">{label}</span>
    </p>
  );
}

function KpiCard({
  icon: Icon,
  iconClass,
  label,
  value,
  children,
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-admin-muted">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-admin-ink tabular-nums">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-white/60 shadow-[0_10px_40px_-20px_rgba(201,169,97,0.6)]",
            iconClass
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <div className="mt-auto space-y-2 pt-4">{children}</div>
    </Card>
  );
}

export default function DashboardKpiCards({
  lang,
  kpis,
}: {
  lang: Locale;
  kpis: DashboardKpis;
}) {
  const dict = getDict(lang);
  const t = dict.dashboard;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <KpiCard
        icon={Wallet}
        iconClass="bg-gradient-to-br from-[#f5f3ee] to-white text-admin-ink ring-1 ring-admin-gold/20"
        label={t.kpi.revenue}
        value={formatCurrency(kpis.revenue.value, lang)}
      >
        <DeltaLine delta={kpis.revenue.delta} label={t.kpi.vsPrevious} lang={lang} />
        <p className="text-xs text-admin-muted">{t.kpi.revenueHint}</p>
      </KpiCard>

      <KpiCard
        icon={CircleAlert}
        iconClass="bg-gradient-to-br from-[#f5f3ee] to-white text-admin-red ring-1 ring-admin-red/20"
        label={t.kpi.outstanding}
        value={formatCurrency(kpis.outstanding.value, lang)}
      >
        <p className="text-xs text-admin-muted">
          {interpolate(t.kpi.outstandingHint, {
            count: formatNumber(kpis.outstanding.count, lang),
          })}
        </p>
        <p className="text-[11px] text-admin-muted/80">{t.kpi.currentSnapshot}</p>
      </KpiCard>

      <KpiCard
        icon={CalendarCheck2}
        iconClass="bg-gradient-to-br from-[#f5f3ee] to-white text-admin-ink ring-1 ring-admin-gold/20"
        label={t.kpi.bookings}
        value={formatNumber(kpis.bookings.value, lang)}
      >
        <DeltaLine delta={kpis.bookings.delta} label={t.kpi.vsPrevious} lang={lang} />
        {kpis.bookings.byStatus.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {kpis.bookings.byStatus.map((entry) => (
              <Badge key={entry.status} tone={BOOKING_STATUS_TONE[entry.status]}>
                {tEnum(dict, "bookingStatus", entry.status)}
                <span className="font-bold">{formatNumber(entry.count, lang)}</span>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-admin-muted">{t.kpi.noBookings}</p>
        )}
      </KpiCard>

      <KpiCard
        icon={Gauge}
        iconClass="bg-gradient-to-br from-[#f5f3ee] to-white text-admin-ink ring-1 ring-admin-gold/20"
        label={t.kpi.utilization}
        value={formatPercent(kpis.utilization.percent / 100, lang)}
      >
        <DeltaLine
          delta={kpis.utilization.delta}
          label={t.kpi.vsPrevious}
          lang={lang}
        />
        <p className="text-xs text-admin-muted">
          {interpolate(t.kpi.utilizationHint, {
            rented: formatNumber(kpis.utilization.rentedDays, lang),
            total: formatNumber(kpis.utilization.capacityDays, lang),
          })}
        </p>
      </KpiCard>

      <KpiCard
        icon={Car}
        iconClass="bg-gradient-to-br from-[#f5f3ee] to-white text-admin-gold ring-1 ring-admin-gold/25"
        label={t.kpi.fleet}
        value={formatNumber(kpis.fleet.published, lang)}
      >
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: t.kpi.rentedNow,
              value: kpis.fleet.rented,
              dot: "bg-admin-navy",
            },
            {
              label: t.kpi.availableNow,
              value: kpis.fleet.available,
              dot: "bg-emerald-500",
            },
            {
              label: t.kpi.maintenanceNow,
              value: kpis.fleet.maintenance,
              dot: "bg-amber-500",
            },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-admin-bg px-2 py-1.5">
              <p className="flex items-center gap-1 text-[10px] text-admin-muted">
                <span className={cn("h-1.5 w-1.5 rounded-full", item.dot)} aria-hidden />
                <span className="truncate">{item.label}</span>
              </p>
              <p className="mt-0.5 text-sm font-semibold text-admin-ink tabular-nums">
                {formatNumber(item.value, lang)}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-admin-muted/80">{t.kpi.currentSnapshot}</p>
      </KpiCard>

      <KpiCard
        icon={UserPlus}
        iconClass="bg-gradient-to-br from-[#f5f3ee] to-white text-admin-ink ring-1 ring-admin-gold/15"
        label={t.kpi.newCustomers}
        value={formatNumber(kpis.newCustomers.value, lang)}
      >
        <DeltaLine
          delta={kpis.newCustomers.delta}
          label={t.kpi.vsPrevious}
          lang={lang}
        />
        <p className="text-xs text-admin-muted">
          {interpolate(t.kpi.newCustomersHint, {
            count: formatNumber(kpis.newCustomers.total, lang),
          })}
        </p>
      </KpiCard>
    </div>
  );
}
