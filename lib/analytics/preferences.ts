import { localActivityDate } from "@/lib/analytics/activity-date";
import type { DateRangePreset } from "@/lib/analytics/date-range";
import {
  DEFAULT_GRAPH_ORDER,
  DEFAULT_GRAPH_VISIBILITY,
  normalizeGraphOrder,
  normalizeGraphVisibility,
  type AnalyticsGraphId,
  type GraphVisibility,
} from "@/lib/analytics/graph-panels";
import {
  normalizeDualMetricSeriesMode,
  type DualMetricSeriesMode,
} from "@/lib/analytics/metric-series";

import {
  ANALYTICS_CELL_SIZE_DEFAULT,
  chartCellSizeFromStored,
  chartDimensionsFromCellSize,
  clampChartCellSize,
} from "@/lib/analytics/chart-cell-size";

export type AnalyticsTheme = "light" | "dark";

export {
  ANALYTICS_CELL_SIZE_DEFAULT,
  ANALYTICS_CELL_SIZE_MAX,
  ANALYTICS_CELL_SIZE_MIN,
  clampChartCellSize,
  chartDimensionsFromCellSize,
} from "@/lib/analytics/chart-cell-size";

export type AnalyticsPreferences = {
  theme: AnalyticsTheme;
  datePreset: DateRangePreset;
  customStart: string;
  customEnd: string;
  linesChartsUnified: boolean;
  wordsChartsUnified: boolean;
  linesMetricSeries: DualMetricSeriesMode;
  wordsMetricSeries: DualMetricSeriesMode;
  chartCellSize: number;
  graphOrder: AnalyticsGraphId[];
  graphVisible: GraphVisibility;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isDatePreset(value: string): value is DateRangePreset {
  return value === "7d" || value === "30d" || value === "all" || value === "custom";
}

function isAnalyticsTheme(value: string): value is AnalyticsTheme {
  return value === "light" || value === "dark";
}

function normalizeDate(value: unknown, fallback: string): string {
  if (typeof value === "string" && ISO_DATE.test(value)) {
    return value;
  }
  return fallback;
}

export function defaultAnalyticsPreferences(): AnalyticsPreferences {
  const today = localActivityDate();
  return {
    theme: "dark",
    datePreset: "30d",
    customStart: today,
    customEnd: today,
    linesChartsUnified: false,
    wordsChartsUnified: false,
    linesMetricSeries: "both",
    wordsMetricSeries: "both",
    chartCellSize: ANALYTICS_CELL_SIZE_DEFAULT,
    graphOrder: [...DEFAULT_GRAPH_ORDER],
    graphVisible: { ...DEFAULT_GRAPH_VISIBILITY },
  };
}

export function normalizeAnalyticsPreferences(
  input: Partial<AnalyticsPreferences> | null | undefined,
): AnalyticsPreferences {
  const defaults = defaultAnalyticsPreferences();
  if (!input) return defaults;

  const theme = isAnalyticsTheme(input.theme ?? "") ? input.theme! : defaults.theme;
  const datePreset = isDatePreset(input.datePreset ?? "")
    ? input.datePreset!
    : defaults.datePreset;

  return {
    theme,
    datePreset,
    customStart: normalizeDate(input.customStart, defaults.customStart),
    customEnd: normalizeDate(input.customEnd, defaults.customEnd),
    linesChartsUnified: Boolean(input.linesChartsUnified),
    wordsChartsUnified: Boolean(input.wordsChartsUnified),
    linesMetricSeries: normalizeDualMetricSeriesMode(
      input.linesMetricSeries,
      defaults.linesMetricSeries,
    ),
    wordsMetricSeries: normalizeDualMetricSeriesMode(
      input.wordsMetricSeries,
      defaults.wordsMetricSeries,
    ),
    chartCellSize: chartCellSizeFromStored(
      (input as { chartCellSize?: number }).chartCellSize,
      (input as { chartHeight?: number }).chartHeight,
      (input as { chartWidth?: number }).chartWidth,
    ),
    graphOrder: normalizeGraphOrder(input.graphOrder),
    graphVisible: normalizeGraphVisibility(input.graphVisible),
  };
}

export const ANALYTICS_PREFERENCES_STORAGE_KEY = "lang-tutor-analytics-preferences";

export function readAnalyticsPreferencesFromStorage(): AnalyticsPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ANALYTICS_PREFERENCES_STORAGE_KEY);
    if (!raw) return null;
    return normalizeAnalyticsPreferences(JSON.parse(raw) as Partial<AnalyticsPreferences>);
  } catch {
    return null;
  }
}

export function writeAnalyticsPreferencesToStorage(
  preferences: AnalyticsPreferences,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      ANALYTICS_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences),
    );
  } catch {
    // ignore quota / private mode
  }
}