"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { getDict, type Locale } from "@/i18n";
import { cn } from "@/components/admin/ui";

import { formatNumber, formatPercent } from "../format";
import type { UtilizationChartData } from "../types";
import ChartCard from "./chart-card";
import ChartEmpty from "./chart-empty";
import { CHART_COLORS } from "./chart-theme";

export default function FleetUtilizationChart({
  lang,
  data,
  className,
}: {
  lang: Locale;
  data: UtilizationChartData;
  className?: string;
}) {
  const t = getDict(lang).dashboard;
  const percent = Math.max(0, Math.min(100, data.percent));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percent / 100);

  const previous = data.previousPercent;
  const deltaPercent =
    previous !== null && previous > 0
      ? ((data.percent - previous) / previous) * 100
      : null;
  const direction =
    deltaPercent === null
      ? null
      : Math.abs(deltaPercent) < 0.05
        ? "flat"
        : deltaPercent > 0
          ? "up"
          : "down";
  const DeltaIcon =
    direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  return (
    <ChartCard
      title={t.charts.utilization.title}
      subtitle={t.charts.utilization.subtitle}
      className={className}
    >
      {data.capacityDays === 0 ? (
        <ChartEmpty message={t.charts.noData} className="h-72 md:h-80" />
      ) : (
        <div className="flex h-72 flex-col items-center justify-center md:h-80">
          <div className="relative h-44 w-44">
            <svg viewBox="0 0 128 128" className="h-full w-full" aria-hidden>
              <defs>
                <linearGradient id="dashboardUtilization" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.navy} />
                  <stop offset="100%" stopColor={CHART_COLORS.blue} />
                </linearGradient>
              </defs>
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke="#e8edf7"
                strokeWidth="11"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke="url(#dashboardUtilization)"
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 64 64)"
                className="transition-[stroke-dashoffset] duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-semibold tracking-tight text-admin-ink">
                {formatPercent(percent / 100, lang)}
              </span>
              <span className="mt-0.5 text-[11px] text-admin-muted">
                {t.charts.utilization.rate}
              </span>
            </div>
          </div>

          <div className="mt-4 grid w-full max-w-xs grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-admin-bg px-2 py-2">
              <p className="text-sm font-semibold text-admin-ink">
                {formatNumber(data.rentedDays, lang)}
              </p>
              <p className="text-[11px] text-admin-muted">
                {t.charts.utilization.rentedDays}
              </p>
            </div>
            <div className="rounded-lg bg-admin-bg px-2 py-2">
              <p className="text-sm font-semibold text-admin-ink">
                {formatNumber(data.capacityDays, lang)}
              </p>
              <p className="text-[11px] text-admin-muted">
                {t.charts.utilization.capacityDays}
              </p>
            </div>
          </div>

          <p className="mt-3 flex items-center gap-1 text-[11px] text-admin-muted">
            {deltaPercent === null || direction === null ? (
              <span className="font-medium">—</span>
            ) : (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold",
                  direction === "up"
                    ? "text-emerald-600"
                    : direction === "down"
                      ? "text-admin-red"
                      : "text-admin-muted"
                )}
              >
                <DeltaIcon className="h-3.5 w-3.5" aria-hidden />
                {formatPercent(Math.abs(deltaPercent) / 100, lang)}
              </span>
            )}
            <span>{t.kpi.vsPrevious}</span>
          </p>
        </div>
      )}
    </ChartCard>
  );
}
