"use client";

import { getChartTheme } from "@/lib/analytics/chart-theme";
import type { AnalyticsUiClasses } from "@/lib/analytics/analytics-ui";
import { ChartAxisTitleRow } from "@/components/analytics/chart-axis-header";
import { DUAL_CHART_Y_AXIS_WIDTH } from "@/lib/analytics/chart-layout";
import {
  activeSeriesKeys,
  type DualMetricSeriesMode,
} from "@/lib/analytics/metric-series";
import type { AnalyticsTheme } from "@/lib/analytics/preferences";
import type { DailyReadingMetrics } from "@/lib/analytics/types";
import { useMemo, type ReactNode } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLOR_READ = "#3b82f6";
const COLOR_RECORDED = "#34d399";

const SERIES_OPTIONS: { id: DualMetricSeriesMode; label: string }[] = [
  { id: "read", label: "Read" },
  { id: "both", label: "Both" },
  { id: "recorded", label: "Recorded" },
];

type DualMetricChartProps = {
  title: string;
  ui: AnalyticsUiClasses;
  theme: AnalyticsTheme;
  data: DailyReadingMetrics[];
  readKey: "linesRead" | "wordsRead";
  recordedKey: "linesRecorded" | "wordsRecorded";
  readLabel: string;
  recordedLabel: string;
  seriesMode: DualMetricSeriesMode;
  onSeriesModeChange: (mode: DualMetricSeriesMode) => void;
  unified: boolean;
  onUnifiedChange: (unified: boolean) => void;
  chartHeight: number;
  yAxisDragHandle?: ReactNode;
};

function formatAxisDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function DualMetricChart({
  title,
  ui,
  theme,
  data,
  readKey,
  recordedKey,
  readLabel,
  recordedLabel,
  seriesMode,
  onSeriesModeChange,
  unified,
  onUnifiedChange,
  chartHeight,
  yAxisDragHandle,
}: DualMetricChartProps) {
  const chartTheme = useMemo(() => getChartTheme(theme), [theme]);
  const keys = useMemo(() => activeSeriesKeys(seriesMode), [seriesMode]);
  const showUnifyToggle = seriesMode === "both";

  const chartData = useMemo(
    () =>
      data.map((row) => ({
        date: row.date,
        read: row[readKey],
        recorded: row[recordedKey],
      })),
    [data, readKey, recordedKey],
  );

  const renderChart = (lineKeys: ("read" | "recorded")[]) => (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid
          stroke={chartTheme.gridStroke}
          strokeDasharray="3 3"
        />
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
          width={DUAL_CHART_Y_AXIS_WIDTH}
        />
        <Tooltip
          contentStyle={chartTheme.tooltip}
          labelFormatter={(label) =>
            new Date(`${label}T00:00:00`).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })
          }
        />
        {lineKeys.length > 1 ? <Legend /> : null}
        {lineKeys.includes("read") ? (
          <Line
            type="monotone"
            dataKey="read"
            name={readLabel}
            stroke={COLOR_READ}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ) : null}
        {lineKeys.includes("recorded") ? (
          <Line
            type="monotone"
            dataKey="recorded"
            name={recordedLabel}
            stroke={COLOR_RECORDED}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ) : null}
      </LineChart>
    </ResponsiveContainer>
  );

  const chartBlock = (
    lineKeys: ("read" | "recorded")[],
    options?: {
      subtitle?: string;
      subtitleClass?: string;
    },
  ) => (
    <div>
      {options?.subtitle ? (
        <p
          className={`mb-2 text-sm font-medium ${options.subtitleClass ?? ui.readAccent}`}
        >
          {options.subtitle}
        </p>
      ) : null}
      {renderChart(lineKeys)}
    </div>
  );

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <ChartAxisTitleRow
          title={title}
          ui={ui}
          yAxisWidth={DUAL_CHART_Y_AXIS_WIDTH}
          dragHandle={yAxisDragHandle}
        />
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`inline-flex gap-0.5 rounded-lg border p-0.5 ${ui.dateGroup}`}
            role="group"
            aria-label="Metrics to display"
          >
            {SERIES_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onSeriesModeChange(option.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition sm:text-sm ${
                  seriesMode === option.id
                    ? ui.dateButtonActive
                    : ui.dateButtonIdle
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {showUnifyToggle ? (
            <button
              type="button"
              onClick={() => onUnifiedChange(!unified)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${ui.chartToggle}`}
            >
              {unified ? "Separate" : "Unify"}
            </button>
          ) : null}
        </div>
      </div>

      {showUnifyToggle && unified ? (
        chartBlock(keys)
      ) : showUnifyToggle && !unified ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {chartBlock(["read"], { subtitle: readLabel })}
          {chartBlock(["recorded"], {
            subtitle: recordedLabel,
            subtitleClass: ui.recordedAccent,
          })}
        </div>
      ) : (
        chartBlock(keys)
      )}
    </>
  );
}