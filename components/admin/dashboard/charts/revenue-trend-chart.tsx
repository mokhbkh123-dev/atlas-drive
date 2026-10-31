"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getDict, type Locale } from "@/i18n";
import { formatCurrency } from "@/lib/utils";

import { formatCompact } from "../format";
import type { DayPoint } from "../types";
import ChartCard from "./chart-card";
import ChartEmpty from "./chart-empty";
import { AXIS_TICK, CHART_COLORS, TOOLTIP_PROPS } from "./chart-theme";

export default function RevenueTrendChart({
  lang,
  data,
  className,
}: {
  lang: Locale;
  data: DayPoint[];
  className?: string;
}) {
  const t = getDict(lang).dashboard;
  const hasData = data.some((point) => point.value > 0);

  return (
    <ChartCard
      title={t.charts.revenueTrend.title}
      subtitle={t.charts.revenueTrend.subtitle}
      className={className}
    >
      {hasData ? (
        <div className="h-72 w-full md:h-80" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              accessibilityLayer
            >
              <defs>
                <linearGradient id="dashboardRevenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.navy} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={CHART_COLORS.navy} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(value) => formatCompact(Number(value), lang)}
              />
              <Tooltip
                {...TOOLTIP_PROPS}
                cursor={{ stroke: CHART_COLORS.line, strokeWidth: 1 }}
                formatter={(value) => formatCurrency(Number(value), lang)}
                labelFormatter={(label) => String(label)}
              />
              <Area
                type="monotone"
                dataKey="value"
                name={t.kpi.revenue}
                stroke={CHART_COLORS.navy}
                strokeWidth={2}
                fill="url(#dashboardRevenueFill)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: CHART_COLORS.navy,
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ChartEmpty message={t.charts.noData} className="h-72 md:h-80" />
      )}
    </ChartCard>
  );
}
