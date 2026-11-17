"use server";

import { isValidLearningLanguageForStyles } from "@/lib/reader/style-preferences";
import type { ReaderStylePreferences } from "@/lib/reader/style-preferences";
import { upsertReaderStylePreferences } from "@/lib/reader-style-preferences";
import type { StoredCompletionReport } from "@/lib/reader/completion-report";
import {
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

  return resumeDocumentAfterCompletion(user.id, documentId, lastPosition);
}
