"use server";

import { isValidLearningLanguageForStyles } from "@/lib/reader/style-preferences";
import type { ReaderStylePreferences } from "@/lib/reader/style-preferences";
import { upsertReaderStylePreferences } from "@/lib/reader-style-preferences";
import { completionCountedActivityDate } from "@/lib/analytics/completion-session";
import { incrementDailyReadingStats } from "@/lib/analytics/daily-stats";
import type { StoredCompletionReport } from "@/lib/reader/completion-report";
import {
  getUserDocument,
  markDocumentSessionComplete,
  resumeDocumentAfterCompletion,
  updateDocumentLastPosition,
} from "@/lib/user-documents";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { redirect } from "next/navigation";

export async function saveReadingPosition(
  documentId: string,
  lastPosition: number,
): Promise<{ ok: boolean; error?: string }> {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return updateDocumentLastPosition(user.id, documentId, lastPosition);
}

export async function saveReaderStylePreferences(
  languageCode: string,
  preferences: ReaderStylePreferences,
): Promise<{ ok: boolean; error?: string }> {
  await connection();

  if (!isValidLearningLanguageForStyles(languageCode)) {
    return { ok: false, error: "Invalid language" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return upsertReaderStylePreferences(user.id, languageCode, preferences);
}

export async function completeDocumentSession(
  documentId: string,
  report: StoredCompletionReport,
): Promise<{ ok: boolean; error?: string }> {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return markDocumentSessionComplete(user.id, documentId, report);
}

export async function continueDocumentAfterCompletion(
  documentId: string,
  lastPosition: number,
): Promise<{ ok: boolean; error?: string }> {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const document = await getUserDocument(user.id, documentId);
  if (!document) {
    return { ok: false, error: "Session not found." };
  }

  const countedDate = completionCountedActivityDate(document);

  const result = await resumeDocumentAfterCompletion(
    user.id,
    documentId,
    lastPosition,
  );

  if (!result.ok || countedDate == null) {
    return result;
  }

  await incrementDailyReadingStats(document.language, {
    activityDate: countedDate,
    linesRead: 0,
    linesRecorded: 0,
    wordsRead: 0,
    wordsRecorded: 0,
    practiceSeconds: 0,
    completedSessions: -1,
  });

  return result;
}
