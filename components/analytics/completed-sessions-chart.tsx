"use client";

import { ChartAxisHeader } from "@/components/analytics/chart-axis-header";
import { getChartTheme } from "@/lib/analytics/chart-theme";
import type { AnalyticsUiClasses } from "@/lib/analytics/analytics-ui";
import { SESSIONS_CHART_Y_AXIS_WIDTH } from "@/lib/analytics/chart-layout";
import type { AnalyticsTheme } from "@/lib/analytics/preferences";
import type { DailyReadingMetrics } from "@/lib/analytics/types";
import { useMemo, type ReactNode } from "react";
import {
  Bar,
  BarChart,
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

type CompletedSessionsChartProps = {
  data: DailyReadingMetrics[];
  theme: AnalyticsTheme;
  ui: AnalyticsUiClasses;
  chartHeight: number;
  yAxisDragHandle?: ReactNode;
};

export function CompletedSessionsChart({
  data,
  theme,
  ui,
  chartHeight,
  yAxisDragHandle,
}: CompletedSessionsChartProps) {
  const chartTheme = useMemo(() => getChartTheme(theme), [theme]);

  const sessionData = data.map((row) => ({
    date: row.date,
    sessions: row.completedSessions,
  }));

  return (
    <>
      <ChartAxisHeader
        title="Completed sessions"
        ui={ui}
        yAxisWidth={SESSIONS_CHART_Y_AXIS_WIDTH}
        dragHandle={yAxisDragHandle}
      />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={sessionData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
            width={32}
          />
          <Tooltip
            contentStyle={chartTheme.tooltip}
            formatter={(value) => [value, "Sessions"]}
            labelFormatter={(label) =>
              new Date(`${label}T00:00:00`).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
            }
          />
          <Bar
            dataKey="sessions"
            fill={chartTheme.sessionBar}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}