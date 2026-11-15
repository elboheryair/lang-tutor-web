"use client";

import { updateSelectedLanguage } from "@/app/(authenticated)/dashboard/actions";
import {
  getLearningLanguage,
  LEARNING_LANGUAGES,
  type LearningLanguageCode,
} from "@/lib/languages";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState, useTransition } from "react";

type LanguageSelectorProps = {
  initialLanguageCode: LearningLanguageCode | null;
};

export function LanguageSelector({
  initialLanguageCode,
}: LanguageSelectorProps) {
  const router = useRouter();
  const selectId = useId();
  const [activeCode, setActiveCode] = useState<LearningLanguageCode | null>(
    initialLanguageCode,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setActiveCode(initialLanguageCode);
  }, [initialLanguageCode]);

  const activeLanguage = getLearningLanguage(activeCode);

  const handleChange = useCallback(
    (nextCode: string) => {
      if (!LEARNING_LANGUAGES.some((language) => language.code === nextCode)) {
        return;
      }

      const code = nextCode as LearningLanguageCode;
      const previous = activeCode;
      setActiveCode(code);
      setError(null);

      startTransition(async () => {
        const result = await updateSelectedLanguage(code);
        if (!result.ok) {
          setActiveCode(previous);
          setError(result.error ?? "Could not save your language.");
          return;
        }
        router.push("/learn/source");
        router.refresh();
      });
    },
    [activeCode, router],
  );

  const continueLearning = useCallback(() => {
    if (!activeCode) return;
    startTransition(async () => {
      const result = await updateSelectedLanguage(activeCode);
      if (!result.ok) {
        setError(result.error ?? "Could not save your language.");
        return;
      }
      router.push("/learn/source");
      router.refresh();
    });
  }, [activeCode, router]);

  return (
    <section
      className="mt-10 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6"
      aria-labelledby={`${selectId}-heading`}
    >
      <h2
        id={`${selectId}-heading`}
        className="text-lg font-semibold text-white"
      >
        {activeLanguage
          ? `Continue learning ${activeLanguage.name}`
          : "Choose your learning language"}
      </h2>

      <p className="mt-2 text-sm text-zinc-400">
        {activeLanguage
          ? "Pick up where you left off, or switch to another language below."
          : "Select a language to personalize your dashboard."}
      </p>

      {activeLanguage && (
        <p
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-500/15 px-3 py-2 text-sm font-medium text-indigo-100"
          role="status"
        >
          <span aria-hidden>{activeLanguage.flag}</span>
          Active: {activeLanguage.name}
        </p>
      )}

      <div className="mt-5">
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-zinc-300"
        >
          Learning language
        </label>
        <div className="relative">
          <select
            id={selectId}
            name="learning-language"
            value={activeCode ?? ""}
            disabled={isPending}
            onChange={(event) => handleChange(event.target.value)}
            className="mt-1.5 w-full appearance-none rounded-xl border border-white/15 bg-zinc-900 px-3.5 py-2.5 pr-10 text-white outline-none ring-indigo-500 transition focus:border-indigo-500 focus:ring-2 disabled:opacity-60"
            aria-describedby={error ? `${selectId}-error` : undefined}
          >
            <option value="" disabled>
              Select a language…
            </option>
            {LEARNING_LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.flag} {language.name}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
            aria-hidden
          >
            ▾
          </span>
        </div>
        {isPending && (
          <p className="mt-2 text-sm text-zinc-500" role="status">
            Saving…
          </p>
        )}
        {error && (
          <p id={`${selectId}-error`} className="mt-2 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        {activeLanguage && (
          <button
            type="button"
            onClick={continueLearning}
            disabled={isPending}
            className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60 sm:w-auto"
          >
            {isPending ? "Continuing…" : `Continue learning ${activeLanguage.name}`}
          </button>
        )}
      </div>
    </section>
  );
}
