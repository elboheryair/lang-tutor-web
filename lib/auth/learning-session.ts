import { requireUser } from "@/lib/auth/require-user";
import { getLearningLanguage, isLearningLanguageCode } from "@/lib/languages";
import { getProfileForUser } from "@/lib/profiles";
import { redirect } from "next/navigation";

export async function requireLearningLanguage() {
  const user = await requireUser();
  const profile = await getProfileForUser(user.id);
  const code = profile?.selected_language;

  if (!code || !isLearningLanguageCode(code)) {
    redirect("/dashboard");
  }

  return {
    user,
    languageCode: code,
    language: getLearningLanguage(code)!,
  };
}
