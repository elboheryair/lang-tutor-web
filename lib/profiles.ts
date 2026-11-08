import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  nickname: string;
  updated_at: string;
};

export async function getProfileForUser(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, updated_at")
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
