"use server";

import { isLearningLanguageCode } from "@/lib/languages";
import { saveSelectedLanguage } from "@/lib/profiles";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import { redirect } from "next/navigation";

export type LanguageActionResult = {
  ok: boolean;
  error?: string;
  selectedLanguage?: string;
};

export async function updateSelectedLanguage(
  languageCode: string,
): Promise<LanguageActionResult> {
  await connection();

  if (!isLearningLanguageCode(languageCode)) {
    return { ok: false, error: "That language is not supported yet." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const fallbackNickname = user.email?.split("@")[0] ?? "user";
  const result = await saveSelectedLanguage(
    user.id,
    languageCode,
    fallbackNickname,
  );

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/dashboard");
  return { ok: true, selectedLanguage: result.selectedLanguage };
}
