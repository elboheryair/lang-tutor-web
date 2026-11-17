"use client";

import { ChartAxisHeader } from "@/components/analytics/chart-axis-header";
import { formatPracticeDuration } from "@/lib/analytics/activity-date";
import { getChartTheme } from "@/lib/analytics/chart-theme";
import type { AnalyticsUiClasses } from "@/lib/analytics/analytics-ui";
import { PRACTICE_CHART_Y_AXIS_WIDTH } from "@/lib/analytics/chart-layout";
import type { AnalyticsTheme } from "@/lib/analytics/preferences";
import type { DailyReadingMetrics } from "@/lib/analytics/types";
import { useMemo, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatAxisDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type PracticeTimeChartProps = {
  data: DailyReadingMetrics[];
  theme: AnalyticsTheme;
  ui: AnalyticsUiClasses;
  chartHeight: number;
  yAxisDragHandle?: ReactNode;
};

export function PracticeTimeChart({
  data,
  theme,
  ui,
  chartHeight,
  yAxisDragHandle,
}: PracticeTimeChartProps) {
  const chartTheme = useMemo(() => getChartTheme(theme), [theme]);
  const gradientId = `practiceTimeGradient-${theme}`;

  const timeData = data.map((row) => ({
    date: row.date,
    minutes: Number((row.practiceSeconds / 60).toFixed(1)),
    seconds: row.practiceSeconds,
  }));

  return (
    <>
      <ChartAxisHeader
        title="Time spent reading"
        ui={ui}
        yAxisWidth={PRACTICE_CHART_Y_AXIS_WIDTH}
        dragHandle={yAxisDragHandle}
      />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={timeData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={chartTheme.practiceGradientTop}
                stopOpacity={0.45}
              />
              <stop
                offset="100%"
                stopColor={chartTheme.practiceGradientBottom}
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={chartTheme.gridStroke} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatAxisDate}
            stroke={chartTheme.axisStroke}
            tick={{ fill: chartTheme.tickFill, fontSize: 12 }}
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            stroke={chartTheme.axisStroke}
            tick={{ fill: chartTheme.tickFill, fontSize: 12 }}
            width={48}
            unit="m"
          />
          <Tooltip
            contentStyle={chartTheme.tooltip}
            formatter={(_value, _name, item) => {
              const seconds =
                (item?.payload as { seconds?: number })?.seconds ?? 0;
              return [formatPracticeDuration(seconds), "Practice time"];
            }}
            labelFormatter={(label) =>
              new Date(`${label}T00:00:00`).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
            }
          />
          <Area
            type="monotone"
            dataKey="minutes"
            stroke={chartTheme.practiceStroke}
            fill={`url(#${gradientId})`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
}