import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  nickname: string;
  selected_language: string | null;
  updated_at: string;
};

export async function getProfileForUser(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, selected_language, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile:", error.message);
    return null;
  }

  return data;
}

export async function saveProfileNickname(
  userId: string,
  nickname: string,
): Promise<{ ok: true; nickname: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, nickname }, { onConflict: "id" })
    .select("nickname")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "No profile row was saved." };
  }

  return { ok: true, nickname: data.nickname };
}

export async function saveSelectedLanguage(
  userId: string,
  languageCode: string,
  fallbackNickname: string,
): Promise<
  | { ok: true; selectedLanguage: string }
  | { ok: false; error: string }
> {
  const supabase = await createClient();

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update({ selected_language: languageCode })
    .eq("id", userId)
    .select("selected_language")
    .maybeSingle();

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  if (updated?.selected_language) {
    return { ok: true, selectedLanguage: updated.selected_language };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      nickname: fallbackNickname,
      selected_language: languageCode,
    })
    .select("selected_language")
    .single();

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  if (!inserted?.selected_language) {
    return { ok: false, error: "No profile row was saved." };
  }

  return { ok: true, selectedLanguage: inserted.selected_language };
}
