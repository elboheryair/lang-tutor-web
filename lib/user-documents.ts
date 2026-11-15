import { createClient } from "@/lib/supabase/server";

export type UserDocument = {
  id: string;
  user_id: string;
  language: string;
  title: string;
  source_type: "file" | "url" | "pasted_text";
  content: string;
  last_position: number;
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
      "id, user_id, language, title, source_type, last_position, created_at, updated_at",
    )
    .eq("user_id", userId)
    .eq("language", language)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to list documents:", error.message);
    return [];
  }

  return (data ?? []) as UserDocumentSummary[];
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

  return data as UserDocument | null;
}

export async function createUserDocument(input: {
  userId: string;
  language: string;
  title: string;
  sourceType: UserDocument["source_type"];
  content: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_documents")
    .insert({
      user_id: input.userId,
      language: input.language,
      title: input.title,
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
