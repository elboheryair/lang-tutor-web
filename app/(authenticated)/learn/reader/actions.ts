"use server";

import { updateDocumentLastPosition } from "@/lib/user-documents";
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
