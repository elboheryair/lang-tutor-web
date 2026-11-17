import { createClient } from "@/lib/supabase/server";
import {
  normalizeReaderStylePreferences,
  type ReaderStylePreferences,
} from "@/lib/reader/style-preferences";

type ReaderStyleRow = {
  font_size: number;
  display_mode: string;
  theme: string | null;
  highlight_current: boolean;
  dull_rest: boolean;
  bold_current: boolean;
};

function rowToPreferences(row: ReaderStyleRow): ReaderStylePreferences {
  return normalizeReaderStylePreferences({
    fontSize: row.font_size,
    displayMode: row.display_mode as ReaderStylePreferences["displayMode"],
    theme: (row.theme ?? undefined) as ReaderStylePreferences["theme"] | undefined,
    highlightOptions: {
      highlightCurrent: row.highlight_current,
      dullRest: row.dull_rest,
      boldCurrent: row.bold_current,
    },
  });
}

export async function getReaderStylePreferences(
  userId: string,
  languageCode: string,
): Promise<ReaderStylePreferences> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reader_style_preferences")
    .select(
      "font_size, display_mode, theme, highlight_current, dull_rest, bold_current",
    )
    .eq("user_id", userId)
    .eq("language_code", languageCode)
    .maybeSingle();

  if (error) {
    console.error("Failed to load reader style preferences:", error.message);
    return normalizeReaderStylePreferences(null);
  }

  if (!data) {
    return normalizeReaderStylePreferences(null);
  }

  return rowToPreferences(data as ReaderStyleRow);
}

export async function upsertReaderStylePreferences(
  userId: string,
  languageCode: string,
  preferences: ReaderStylePreferences,
): Promise<{ ok: boolean; error?: string }> {
  const normalized = normalizeReaderStylePreferences(preferences);
  const supabase = await createClient();

  const { error } = await supabase.from("reader_style_preferences").upsert(
    {
      user_id: userId,
      language_code: languageCode,
      font_size: normalized.fontSize,
      display_mode: normalized.displayMode,
      theme: normalized.theme,
      highlight_current: normalized.highlightOptions.highlightCurrent,
      dull_rest: normalized.highlightOptions.dullRest,
      bold_current: normalized.highlightOptions.boldCurrent,
    },
    { onConflict: "user_id,language_code" },
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}