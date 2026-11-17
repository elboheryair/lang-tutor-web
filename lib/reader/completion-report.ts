import type { SessionRecordingStats } from "@/lib/reader/recording-stats";
import { buildSessionRecordingStats } from "@/lib/reader/recording-stats";

export type StoredCompletionReport = {
  uniqueLineIndices: number[];
  sessionSeconds: number;
  totalLines?: number;
  totalWords?: number;
  uniqueWordsRecorded?: number;
  /** Local calendar date (YYYY-MM-DD) when completed_sessions was counted in analytics. */
  analyticsCompletionDate?: string;
};

export function buildStoredCompletionReport(
  uniqueRecordedLines: ReadonlySet<number>,
  stats: SessionRecordingStats,
): StoredCompletionReport {
  return {
    uniqueLineIndices: [...uniqueRecordedLines].sort((a, b) => a - b),
    sessionSeconds: stats.sessionSeconds,
    totalLines: stats.totalLines,
    totalWords: stats.totalWords,
    uniqueWordsRecorded: stats.uniqueWordsRecorded,
  };
}

export function statsFromStoredReport(
  report: StoredCompletionReport,
): SessionRecordingStats {
  const uniqueLinesRecorded = report.uniqueLineIndices.length;
  if (
    report.totalLines !== undefined &&
    report.totalWords !== undefined &&
    report.uniqueWordsRecorded !== undefined
  ) {
    return {
      uniqueLinesRecorded,
      totalLines: report.totalLines,
      totalWords: report.totalWords,
      uniqueWordsRecorded: report.uniqueWordsRecorded,
      sessionSeconds: report.sessionSeconds,
    };
  }

  return {
    uniqueLinesRecorded,
    totalLines: report.totalLines ?? uniqueLinesRecorded,
    totalWords: report.totalWords ?? 0,
    uniqueWordsRecorded: report.uniqueWordsRecorded ?? 0,
    sessionSeconds: report.sessionSeconds,
  };
}

export function storedReportHasFullSummary(report: StoredCompletionReport): boolean {
  return (
    report.totalLines !== undefined &&
    report.totalWords !== undefined &&
    report.uniqueWordsRecorded !== undefined
  );
}

export function sessionStatsFromStoredReport(
  lines: string[],
  report: StoredCompletionReport,
) {
  const uniqueRecordedLines = new Set(report.uniqueLineIndices);
  if (storedReportHasFullSummary(report)) {
    return statsFromStoredReport(report);
  }
  return buildSessionRecordingStats(
    lines,
    uniqueRecordedLines,
    report.sessionSeconds,
  );
}

export function parseStoredCompletionReport(
  value: unknown,
): StoredCompletionReport | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const indices = record.uniqueLineIndices;
  const seconds = record.sessionSeconds;

  if (!Array.isArray(indices)) {
    return null;
  }
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0) {
    return null;
  }

  const uniqueLineIndices = indices.filter(
    (item): item is number => typeof item === "number" && Number.isInteger(item),
  );

  const totalLines = record.totalLines;
  const totalWords = record.totalWords;
  const uniqueWordsRecorded = record.uniqueWordsRecorded;

  const parsed: StoredCompletionReport = {
    uniqueLineIndices,
    sessionSeconds: Math.floor(seconds),
  };

  if (typeof totalLines === "number" && Number.isFinite(totalLines) && totalLines >= 0) {
    parsed.totalLines = Math.floor(totalLines);
  }
  if (typeof totalWords === "number" && Number.isFinite(totalWords) && totalWords >= 0) {
    parsed.totalWords = Math.floor(totalWords);
  }
  if (
    typeof uniqueWordsRecorded === "number" &&
    Number.isFinite(uniqueWordsRecorded) &&
    uniqueWordsRecorded >= 0
  ) {
    parsed.uniqueWordsRecorded = Math.floor(uniqueWordsRecorded);
  }

  const analyticsCompletionDate = record.analyticsCompletionDate;
  if (
    typeof analyticsCompletionDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(analyticsCompletionDate)
  ) {
    parsed.analyticsCompletionDate = analyticsCompletionDate;
  }

  return parsed;
}