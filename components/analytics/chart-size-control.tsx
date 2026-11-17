"use client";

import {
  ANALYTICS_CELL_SIZE_MAX,
  ANALYTICS_CELL_SIZE_MIN,
  clampChartCellSize,
  type AnalyticsTheme,
} from "@/lib/analytics/preferences";
import { useEffect, useId, useState } from "react";

type ChartSizeControlProps = {
  theme: AnalyticsTheme;
  chartCellSize: number;
  onChartCellSizeChange: (size: number) => void;
};

export function ChartSizeControl({
  theme,
  chartCellSize,
  onChartCellSizeChange,
}: ChartSizeControlProps) {
  const labelId = useId();
  const isDark = theme === "dark";
  const [sizeDraft, setSizeDraft] = useState(String(chartCellSize));

  useEffect(() => {
    setSizeDraft(String(chartCellSize));
  }, [chartCellSize]);

  function commitSizeDraft() {
    const parsed = Number.parseInt(sizeDraft, 10);
    if (!Number.isNaN(parsed)) {
      onChartCellSizeChange(clampChartCellSize(parsed));
      return;
    }
    setSizeDraft(String(chartCellSize));
  }

  const buttonClass = `h-9 w-9 rounded-lg border text-lg font-semibold transition ${
    isDark
      ? "border-white/15 text-zinc-300 hover:bg-white/10"
      : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
  }`;

  const inputClass = `w-14 rounded-lg border px-1 py-1.5 text-center text-sm tabular-nums ${
    isDark
      ? "border-white/15 bg-zinc-900 text-white"
      : "border-zinc-300 bg-white text-zinc-900"
  }`;

  return (
    <div className="flex items-center gap-1" role="group" aria-labelledby={labelId}>
      <span id={labelId} className="sr-only">
        Graph cell size
      </span>
      <button
        type="button"
        aria-label="Decrease graph cell size"
        disabled={chartCellSize <= ANALYTICS_CELL_SIZE_MIN}
        onClick={() => onChartCellSizeChange(chartCellSize - 1)}
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-40`}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={sizeDraft}
        onChange={(event) =>
          setSizeDraft(event.target.value.replace(/[^\d]/g, ""))
        }
        onBlur={commitSizeDraft}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitSizeDraft();
          }
        }}
        aria-label="Graph cell size"
        className={inputClass}
      />
      <button
        type="button"
        aria-label="Increase graph cell size"
        disabled={chartCellSize >= ANALYTICS_CELL_SIZE_MAX}
        onClick={() => onChartCellSizeChange(chartCellSize + 1)}
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-40`}
      >
        +
      </button>
    </div>
  );
}