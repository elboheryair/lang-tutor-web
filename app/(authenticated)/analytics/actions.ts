"use server";

import {
  normalizeAnalyticsPreferences,
  type AnalyticsPreferences,
} from "@/lib/analytics/preferences";
import { upsertAnalyticsPreferences } from "@/lib/analytics-style-preferences";
import {
  getEarliestActivityDate,
  incrementDailyReadingStats,
  listDailyReadingMetrics,
} from "@/lib/analytics/daily-stats";
import { requireUser } from "@/lib/auth/require-user";
import type { AnalyticsDateRange, DailyReadingMetrics, ReadingActivityDelta } from "@/lib/analytics/types";
import { requireLearningLanguage } from "@/lib/auth/learning-session";
import { isLearningLanguageCode } from "@/lib/languages";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { redirect } from "next/navigation";

export async function fetchAnalyticsSeries(
  range: AnalyticsDateRange,
): Promise<{
  series: DailyReadingMetrics[];
  languageName: string;
  languageFlag: string;
}> {
  await connection();

  const { user, language, languageCode } = await requireLearningLanguage();
  const series = await listDailyReadingMetrics(user.id, languageCode, range);

  return {
    series,
    languageName: language.name,
    languageFlag: language.flag,
  };
}

export async function fetchAnalyticsBounds(): Promise<{
  earliestDate: string | null;
}> {
  await connection();

  const { user, languageCode } = await requireLearningLanguage();
  const earliestDate = await getEarliestActivityDate(user.id, languageCode);
  return { earliestDate };
}

export async function recordReadingActivity(
  languageCode: string,
  delta: Omit<ReadingActivityDelta, "activityDate"> & { activityDate: string },
): Promise<{ ok: boolean; error?: string }> {
  await connection();

  if (!isLearningLanguageCode(languageCode)) {
    return { ok: false, error: "Invalid language" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return incrementDailyReadingStats(languageCode, delta);
}

export async function recordSessionCompleted(
  languageCode: string,
  activityDate: string,
): Promise<{ ok: boolean; error?: string }> {
  return recordReadingActivity(languageCode, {
    activityDate,
    linesRead: 0,
    linesRecorded: 0,
    wordsRead: 0,
    wordsRecorded: 0,
    practiceSeconds: 0,
    completedSessions: 1,
  });
}

export async function saveAnalyticsPreferences(
  preferences: AnalyticsPreferences,
): Promise<{ ok: boolean; error?: string }> {
  await connection();

  const user = await requireUser();
  const normalized = normalizeAnalyticsPreferences(preferences);
  return upsertAnalyticsPreferences(user.id, normalized);
}