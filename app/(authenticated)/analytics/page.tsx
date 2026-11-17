import { AnalyticsPageView } from "@/components/analytics/analytics-page-view";
import { AuthenticatedPageFallback } from "@/components/authenticated-page-fallback";
import { requireLearningLanguage } from "@/lib/auth/learning-session";
import { getAnalyticsPreferences } from "@/lib/analytics-style-preferences";
import { Suspense } from "react";

async function AnalyticsContent() {
  const { user, language } = await requireLearningLanguage();
  const initialPreferences = await getAnalyticsPreferences(user.id);

  return (
    <AnalyticsPageView
      languageName={language.name}
      languageFlag={language.flag}
      initialPreferences={initialPreferences}
    />
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AuthenticatedPageFallback />}>
      <AnalyticsContent />
    </Suspense>
  );
}