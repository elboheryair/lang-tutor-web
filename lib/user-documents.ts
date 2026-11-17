import {
  parseStoredCompletionReport,
  type StoredCompletionReport,
} from "@/lib/reader/completion-report";
import { createClient } from "@/lib/supabase/server";

export type UserDocument = {
  id: string;
  user_id: string;
  language: string;
  title: string;
  source_type: "file" | "url" | "pasted_text";
  content: string;
  last_position: number;
  completion_report: StoredCompletionReport | null;
  session_locked: boolean;
  created_at: string;
  updated_at: string;
};

export type UserDocumentSummary = Omit<UserDocument, "content">;

export async function listUserDocumentsForLanguage(
  userId: string,
  language: string,
): Promise<UserDocumentSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_documents")
    .select(
      "id, user_id, language, title, source_type, last_position, completion_report, session_locked, created_at, updated_at",
    )
    .eq("user_id", userId)
    .eq("language", language)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to list documents:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const doc = row as UserDocument & { completion_report?: unknown };
    return {
      ...doc,
      completion_report: parseStoredCompletionReport(doc.completion_report),
      session_locked: Boolean(doc.session_locked),
    };
  });
}

export async function getUserDocument(
  userId: string,
  documentId: string,
): Promise<UserDocument | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_documents")
    .select("*")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load document:", error.message);
    return null;
  }

  const row = data as UserDocument & { completion_report?: unknown };

  return {
    ...row,
    completion_report: parseStoredCompletionReport(row.completion_report),
    session_locked: Boolean(row.session_locked),
  };
}

function uniqueSessionTitle(
  baseTitle: string,
  existingTitles: readonly string[],
): string {
  const taken = new Set(existingTitles);
  if (!taken.has(baseTitle)) return baseTitle;
  let n = 2;
  while (taken.has(`${baseTitle} (${n})`)) n += 1;
  return `${baseTitle} (${n})`;
}

async function listDocumentTitlesForLanguage(
  userId: string,
  language: string,
): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_documents")
    .select("title")
    .eq("user_id", userId)
    .eq("language", language);

  if (error) {
    console.error("Failed to list document titles:", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.title as string);
}

export async function createUserDocument(input: {
  userId: string;
  language: string;
  title: string;
  sourceType: UserDocument["source_type"];
  content: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const existingTitles = await listDocumentTitlesForLanguage(
    input.userId,
    input.language,
  );
  const title = uniqueSessionTitle(input.title, existingTitles);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_documents")
    .insert({
      user_id: input.userId,
      language: input.language,
      title,
      source_type: input.sourceType,
      content: input.content,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, id: data.id };
}

export async function updateDocumentLastPosition(
  userId: string,
  documentId: string,
  lastPosition: number,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_documents")
    .update({ last_position: Math.max(0, Math.floor(lastPosition)) })
    .eq("id", documentId)
    .eq("user_id", userId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function markDocumentSessionComplete(
  userId: string,
  documentId: string,
  report: StoredCompletionReport,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_documents")
    .update({
      last_position: 100,
      completion_report: report,
    })
    .eq("id", documentId)
    .eq("user_id", userId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function resumeDocumentAfterCompletion(
  userId: string,
  documentId: string,
  lastPosition: number,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_documents")
    .update({
      last_position: Math.max(0, Math.floor(lastPosition)),
      completion_report: null,
    })
    .eq("id", documentId)
    .eq("user_id", userId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function lockFinishedDocumentSession(
  userId: string,
  documentId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const document = await getUserDocument(userId, documentId);
  if (!document) {
    return { ok: false, error: "Session not found." };
  }

  if (document.session_locked) {
    return { ok: false, error: "This session is already marked as finished." };
  }

  if (document.last_position < 100) {
    return {
      ok: false,
      error: "You can only mark a session as finished after reaching 100% progress.",
    };
  }

  if (document.completion_report == null) {
    return {
      ok: false,
      error:
        "Practice summary is missing. Open the session once after finishing, choose “Yes, go to sources” on the completion screen, then mark it finished here.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_documents")
    .update({
      session_locked: true,
      content: "",
      last_position: 100,
      completion_report: document.completion_report,
    })
    .eq("id", documentId)
    .eq("user_id", userId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function deleteUserDocument(
  userId: string,
  documentId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_documents")
    .delete()
    .eq("id", documentId)
    .eq("user_id", userId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
