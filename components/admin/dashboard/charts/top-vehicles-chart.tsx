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
import { formatCurrency } from "@/lib/utils";

import { formatCompact } from "../format";
import type { VehicleRevenue } from "../types";
import ChartCard from "./chart-card";
import ChartEmpty from "./chart-empty";
import { AXIS_TICK, CHART_COLORS, TOOLTIP_PROPS } from "./chart-theme";

export default function TopVehiclesChart({
  lang,
  data,
  className,
}: {
  lang: Locale;
  data: VehicleRevenue[];
  className?: string;
}) {
  const t = getDict(lang).dashboard;

  return (
    <ChartCard
      title={t.charts.topVehicles.title}
      subtitle={t.charts.topVehicles.subtitle}
      className={className}
    >
      {data.length === 0 ? (
        <ChartEmpty message={t.charts.noData} className="h-72 md:h-80" />
      ) : (
        <div className="h-72 w-full md:h-80" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
              accessibilityLayer
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCompact(Number(value), lang)}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={108}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                {...TOOLTIP_PROPS}
                cursor={{ fill: "rgba(11, 22, 48, 0.04)" }}
                formatter={(value) => formatCurrency(Number(value), lang)}
              />
              <Bar
                dataKey="revenue"
                name={t.kpi.revenue}
                fill={CHART_COLORS.navy}
                radius={
                  (lang === "ar" ? [6, 0, 0, 6] : [0, 6, 6, 0]) as [
                    number,
                    number,
                    number,
                    number,
                  ]
                }
                maxBarSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
