import type { AnalyticsDateRange } from "@/lib/analytics/types";
import { localActivityDate } from "@/lib/analytics/activity-date";

export type DateRangePreset = "7d" | "30d" | "all" | "custom";

function shiftLocalDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localActivityDate(date);
}

export function presetToRange(
  preset: DateRangePreset,
  earliestDate: string | null,
  custom?: { start: string; end: string },
): AnalyticsDateRange {
  const end = localActivityDate();

  if (preset === "7d") {
    return { start: shiftLocalDate(-6), end };
  }

  if (preset === "30d") {
    return { start: shiftLocalDate(-29), end };
  }

  if (preset === "custom" && custom) {
    const start = custom.start <= custom.end ? custom.start : custom.end;
    const rangeEnd = custom.start <= custom.end ? custom.end : custom.start;
    return { start, end: rangeEnd };
  }

  if (earliestDate) {
    return { start: earliestDate, end };
  }

  return { start: shiftLocalDate(-29), end };
}

export function hasAnyActivity(
  series: { linesRead: number; linesRecorded: number; practiceSeconds: number; completedSessions: number }[],
): boolean {
  return series.some(
    (day) =>
      day.linesRead > 0 ||
      day.linesRecorded > 0 ||
      day.practiceSeconds > 0 ||
      day.completedSessions > 0,
  );
}