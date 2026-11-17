"use client";

import { AnalyticsThemeToggle } from "@/components/analytics/analytics-theme-toggle";
import { ChartSizeControl } from "@/components/analytics/chart-size-control";
import type { AnalyticsUiClasses } from "@/lib/analytics/analytics-ui";
import type { AnalyticsTheme } from "@/lib/analytics/preferences";
import type { DateRangePreset } from "@/lib/analytics/date-range";

type DateRangeControlProps = {
  ui: AnalyticsUiClasses;
  theme: AnalyticsTheme;
  onThemeToggle: () => void;
  preset: DateRangePreset;
  customStart: string;
  customEnd: string;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
  chartCellSize: number;
  onChartCellSizeChange: (size: number) => void;
};

const presetButtons: { id: DateRangePreset; label: string }[] = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "all", label: "All time" },
  { id: "custom", label: "Custom" },
];

export function DateRangeControl({
  ui,
  theme,
  onThemeToggle,
  preset,
  customStart,
  customEnd,
  onPresetChange,
  onCustomStartChange,
  onCustomEndChange,
  chartCellSize,
  onChartCellSizeChange,
}: DateRangeControlProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div
        className={`flex flex-wrap items-center gap-2 sm:gap-3 ${
          theme === "dark" ? "text-zinc-300" : "text-zinc-700"
        }`}
      >
        <AnalyticsThemeToggle theme={theme} onToggle={onThemeToggle} />
        <ChartSizeControl
          theme={theme}
          chartCellSize={chartCellSize}
          onChartCellSizeChange={onChartCellSizeChange}
        />
        <div
          className={`inline-flex flex-wrap gap-1 rounded-xl border p-1 ${ui.dateGroup}`}
          role="group"
          aria-label="Date range"
        >
          {presetButtons.map((button) => (
            <button
              key={button.id}
              type="button"
              onClick={() => onPresetChange(button.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                preset === button.id ? ui.dateButtonActive : ui.dateButtonIdle
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      {preset === "custom" ? (
        <div className={`flex flex-wrap items-center gap-2 text-sm ${ui.dateLabel}`}>
          <label className="flex items-center gap-2">
            <span>From</span>
            <input
              type="date"
              value={customStart}
              onChange={(event) => onCustomStartChange(event.target.value)}
              className={`rounded-lg border px-2 py-1.5 ${ui.dateInput}`}
            />
          </label>
          <label className="flex items-center gap-2">
            <span>To</span>
            <input
              type="date"
              value={customEnd}
              onChange={(event) => onCustomEndChange(event.target.value)}
              className={`rounded-lg border px-2 py-1.5 ${ui.dateInput}`}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}