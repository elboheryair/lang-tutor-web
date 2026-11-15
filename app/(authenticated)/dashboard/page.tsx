import { AuthenticatedPageFallback } from "@/components/authenticated-page-fallback";
import { LanguageSelector } from "@/components/language-selector";
import { requireUser } from "@/lib/auth/require-user";
import {
  getLearningLanguage,
  isLearningLanguageCode,
  type LearningLanguageCode,
} from "@/lib/languages";
import { getProfileForUser } from "@/lib/profiles";
import { Suspense } from "react";

function resolveInitialLanguage(
  stored: string | null | undefined,
): LearningLanguageCode | null {
  if (!stored || !isLearningLanguageCode(stored)) return null;
  return stored;
}

async function DashboardContent() {
  const user = await requireUser();
  const profile = await getProfileForUser(user.id);
  const nickname = profile?.nickname ?? user.email?.split("@")[0] ?? "there";
  const initialLanguageCode = resolveInitialLanguage(
    profile?.selected_language,
  );
  const activeLanguage = getLearningLanguage(initialLanguageCode);

  return (
    <>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Hi, {nickname}
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-400">
        {activeLanguage
          ? `You're set up to learn ${activeLanguage.name}. Switch languages anytime below.`
          : "Welcome back. Choose a learning language to get started."}
      </p>
      <LanguageSelector initialLanguageCode={initialLanguageCode} />
    </>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
        Dashboard
      </p>
      <Suspense fallback={<AuthenticatedPageFallback />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
