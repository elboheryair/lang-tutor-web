import type { AnalyticsDateRange, DailyReadingMetrics, ReadingActivityDelta } from "@/lib/analytics/types";
import { createClient } from "@/lib/supabase/server";

type DailyStatsRow = {
  activity_date: string;
  lines_read: number;
  lines_recorded: number;
  words_read: number;
  words_recorded: number;
  practice_seconds: number;
  completed_sessions: number;
};

function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function eachDateInRange(range: AnalyticsDateRange): string[] {
  const dates: string[] = [];
  const cursor = parseIsoDate(range.start);
  const end = parseIsoDate(range.end);

  while (cursor <= end) {
    dates.push(formatIsoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

function emptyMetrics(date: string): DailyReadingMetrics {
  return {
    date,
    linesRead: 0,
    linesRecorded: 0,
    wordsRead: 0,
    wordsRecorded: 0,
    practiceSeconds: 0,
    completedSessions: 0,
  };
}

export function fillDailySeries(
  range: AnalyticsDateRange,
  rows: DailyReadingMetrics[],
): DailyReadingMetrics[] {
  const byDate = new Map(rows.map((row) => [row.date, row]));
  return eachDateInRange(range).map((date) => byDate.get(date) ?? emptyMetrics(date));
}

function rowToMetrics(row: DailyStatsRow): DailyReadingMetrics {
  return {
    date: row.activity_date,
    linesRead: row.lines_read,
    linesRecorded: row.lines_recorded,
    wordsRead: row.words_read,
    wordsRecorded: row.words_recorded,
    practiceSeconds: row.practice_seconds,
    completedSessions: row.completed_sessions,
  };
}

export async function listDailyReadingMetrics(
  userId: string,
  language: string,
  range: AnalyticsDateRange,
): Promise<DailyReadingMetrics[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_reading_daily_stats")
    .select(
      "activity_date, lines_read, lines_recorded, words_read, words_recorded, practice_seconds, completed_sessions",
    )
    .eq("user_id", userId)
    .eq("language", language)
    .gte("activity_date", range.start)
    .lte("activity_date", range.end)
    .order("activity_date", { ascending: true });

  if (error) {
    console.error("Failed to load reading analytics:", error.message);
    return fillDailySeries(range, []);
  }

  const rows = (data ?? []).map((row) => rowToMetrics(row as DailyStatsRow));
  return fillDailySeries(range, rows);
}

export async function incrementDailyReadingStats(
  language: string,
  delta: ReadingActivityDelta,
): Promise<{ ok: boolean; error?: string }> {
  if (
    delta.linesRead === 0 &&
    delta.linesRecorded === 0 &&
    delta.wordsRead === 0 &&
    delta.wordsRecorded === 0 &&
    delta.practiceSeconds === 0 &&
    delta.completedSessions === 0
  ) {
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_user_reading_daily_stats", {
    p_language: language,
    p_activity_date: delta.activityDate,
    p_lines_read: Math.floor(delta.linesRead),
    p_lines_recorded: Math.floor(delta.linesRecorded),
    p_words_read: Math.floor(delta.wordsRead),
    p_words_recorded: Math.floor(delta.wordsRecorded),
    p_practice_seconds: Math.floor(delta.practiceSeconds),
    p_completed_sessions: Math.floor(delta.completedSessions),
  });

  if (error) {
    console.error("Failed to increment daily reading stats:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function getEarliestActivityDate(
  userId: string,
  language: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_reading_daily_stats")
    .select("activity_date")
    .eq("user_id", userId)
    .eq("language", language)
    .order("activity_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load earliest activity date:", error.message);
    return null;
  }

  return (data as { activity_date: string } | null)?.activity_date ?? null;
}