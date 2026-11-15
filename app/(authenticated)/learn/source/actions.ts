"use server";

import { parseUploadedFile } from "@/lib/documents/parse-file";
import { fetchUrlAsText } from "@/lib/documents/url-text";
import { getProfileForUser } from "@/lib/profiles";
import { isLearningLanguageCode } from "@/lib/languages";
import { createUserDocument } from "@/lib/user-documents";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { redirect } from "next/navigation";

export type ImportActionState = {
  error?: string;
  documentId?: string;
};

function getUploadFile(formData: FormData): File | null {
  const entry = formData.get("file");
  if (!entry || typeof entry !== "object") return null;
  if (!("size" in entry) || typeof entry.size !== "number" || entry.size === 0) {
    return null;
  }
  if (!("arrayBuffer" in entry) || typeof entry.arrayBuffer !== "function") {
    return null;
  }
  return entry as File;
}

async function getActiveLanguageForUser(userId: string): Promise<string | null> {
  const profile = await getProfileForUser(userId);
  const code = profile?.selected_language;
  if (!code || !isLearningLanguageCode(code)) return null;
  return code;
}

export async function importDocumentFromFile(
  _prev: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const language = await getActiveLanguageForUser(user.id);
  if (!language) {
    return { error: "Choose a learning language on your dashboard first." };
  }

  const file = getUploadFile(formData);
  if (!file) {
    return { error: "Choose a file to upload." };
  }

  try {
    const parsed = await parseUploadedFile(file);
    const created = await createUserDocument({
      userId: user.id,
      language,
      title: parsed.title,
      sourceType: "file",
      content: parsed.content,
    });

    if (!created.ok) {
      return { error: created.error };
    }

    return { documentId: created.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not process that file.";
    return { error: message };
  }
}

export async function importDocumentFromUrl(
  _prev: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const language = await getActiveLanguageForUser(user.id);
  if (!language) {
    return { error: "Choose a learning language on your dashboard first." };
  }

  const url = (formData.get("url") as string | null)?.trim() ?? "";
  if (!url) {
    return { error: "Paste a URL to import." };
  }

  try {
    const parsed = await fetchUrlAsText(url);
    const created = await createUserDocument({
      userId: user.id,
      language,
      title: parsed.title,
      sourceType: "url",
      content: parsed.content,
    });

    if (!created.ok) {
      return { error: created.error };
    }

    return { documentId: created.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not fetch that URL.";
    return { error: message };
  }
}
