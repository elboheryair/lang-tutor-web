export type DualMetricSeriesMode = "both" | "read" | "recorded";

const MODES: DualMetricSeriesMode[] = ["both", "read", "recorded"];

export function isDualMetricSeriesMode(
  value: string,
): value is DualMetricSeriesMode {
  return MODES.includes(value as DualMetricSeriesMode);
}

export function normalizeDualMetricSeriesMode(
  value: unknown,
  fallback: DualMetricSeriesMode = "both",
): DualMetricSeriesMode {
  if (typeof value === "string" && isDualMetricSeriesMode(value)) {
    return value;
  }
  return fallback;
}

export function activeSeriesKeys(
  mode: DualMetricSeriesMode,
): ("read" | "recorded")[] {
  if (mode === "read") return ["read"];
  if (mode === "recorded") return ["recorded"];
  return ["read", "recorded"];
}