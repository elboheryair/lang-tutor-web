export type LearningLanguage = {
  code: string;
  name: string;
  flag: string;
};

/** Add new languages here to expose them across the app. */
export const LEARNING_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "he", name: "Hebrew", flag: "🇮🇱" },
] as const satisfies readonly LearningLanguage[];

export type LearningLanguageCode = (typeof LEARNING_LANGUAGES)[number]["code"];

const languageByCode = new Map<string, LearningLanguage>(
  LEARNING_LANGUAGES.map((language) => [language.code, language]),
);

export function getLearningLanguage(
  code: string | null | undefined,
): LearningLanguage | undefined {
  if (!code) return undefined;
  return languageByCode.get(code);
}

export function isLearningLanguageCode(
  code: string,
): code is LearningLanguageCode {
  return languageByCode.has(code);
}
