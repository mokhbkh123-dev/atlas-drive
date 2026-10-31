"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { getDict, tEnum, type Locale } from "@/i18n";

import { formatNumber } from "../format";
import type { SourceCount } from "../types";
import ChartCard from "./chart-card";
import ChartEmpty from "./chart-empty";
import { CHART_COLORS, SOURCE_COLORS, TOOLTIP_PROPS } from "./chart-theme";

export default function BookingSourcesChart({
  lang,
  data,
  className,
}: {
  lang: Locale;
  data: SourceCount[];
  className?: string;
}) {
  const dict = getDict(lang);
  const t = dict.dashboard;
  const items = data.map((item) => ({
    ...item,
    label: tEnum(dict, "bookingSource", item.source),
    color: SOURCE_COLORS[item.source] ?? CHART_COLORS.slate,
  }));
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const nonZero = items.filter((item) => item.count > 0);

  return (
    <ChartCard
      title={t.charts.sources.title}
      subtitle={t.charts.sources.subtitle}
      className={className}
    >
      {total === 0 ? (
        <ChartEmpty message={t.charts.noData} className="h-72 md:h-80" />
      ) : (
        <div className="flex h-72 flex-col md:h-80">
          <div className="relative min-h-0 flex-1" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart accessibilityLayer>
                <Pie
                  data={nonZero}
                  dataKey="count"
                  nameKey="label"
                  innerRadius="55%"
                  outerRadius="82%"
                  paddingAngle={2}
                  cornerRadius={4}
                  stroke="none"
                >
                  {nonZero.map((item) => (
                    <Cell key={item.source} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  {...TOOLTIP_PROPS}
                  formatter={(value, name) => [
                    formatNumber(Number(value), lang),
                    String(name),
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold tracking-tight text-admin-ink">
                {formatNumber(total, lang)}
              </span>
              <span className="text-[11px] text-admin-muted">{t.kpi.bookings}</span>
            </div>
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
            {items.map((item) => (
              <li
                key={item.source}
                className={
                  item.count === 0
                    ? "flex items-center gap-1.5 text-[11px] text-admin-muted/60"
                    : "flex items-center gap-1.5 text-[11px] text-admin-muted"
                }
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden
                />
                <span className="truncate">{item.label}</span>
                <span className="font-semibold text-admin-ink">
                  {formatNumber(item.count, lang)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}
