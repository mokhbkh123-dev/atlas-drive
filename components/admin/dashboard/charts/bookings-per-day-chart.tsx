"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getDict, type Locale } from "@/i18n";

import { formatNumber } from "../format";
import type { DayPoint } from "../types";
import ChartCard from "./chart-card";
import ChartEmpty from "./chart-empty";
import { AXIS_TICK, CHART_COLORS, TOOLTIP_PROPS } from "./chart-theme";

export default function BookingsPerDayChart({
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
      title={t.charts.bookingsPerDay.title}
      subtitle={t.charts.bookingsPerDay.subtitle}
      className={className}
    >
      {hasData ? (
        <div className="h-72 w-full md:h-80" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              accessibilityLayer
            >
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
                width={36}
                allowDecimals={false}
              />
              <Tooltip
                {...TOOLTIP_PROPS}
                cursor={{ fill: "rgba(11, 22, 48, 0.04)" }}
                formatter={(value) => formatNumber(Number(value), lang)}
                labelFormatter={(label) => String(label)}
              />
              <Bar
                dataKey="value"
                name={t.kpi.bookings}
                fill={CHART_COLORS.blue}
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ChartEmpty message={t.charts.noData} className="h-72 md:h-80" />
      )}
    </ChartCard>
  );
}
