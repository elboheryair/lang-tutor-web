"use server";

import { saveProfileNickname } from "@/lib/profiles";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import { redirect } from "next/navigation";

export type ProfileFormState = {
  error?: string;
  success?: boolean;
};

export async function updateNickname(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  await connection();

  const nickname = (formData.get("nickname") as string | null)?.trim() ?? "";

  if (!nickname) {
    return { error: "Nickname is required." };
  }

  if (nickname.length > 64) {
    return { error: "Nickname must be 64 characters or fewer." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const result = await saveProfileNickname(user.id, nickname);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: true };
}
