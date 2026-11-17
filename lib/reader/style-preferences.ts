import { isLearningLanguageCode } from "@/lib/languages";
import {
  DEFAULT_HIGHLIGHT_OPTIONS,
  type DisplayMode,
  type HighlightOptions,
  type ReaderTheme,
} from "@/lib/reader/types";

export const READER_FONT_SIZE_MIN = 14;
export const READER_FONT_SIZE_MAX = 32;

export type ReaderStylePreferences = {
  fontSize: number;
  displayMode: DisplayMode;
  highlightOptions: HighlightOptions;
  theme: ReaderTheme;
};

export const DEFAULT_READER_STYLE_PREFERENCES: ReaderStylePreferences = {
  fontSize: 18,
  displayMode: "full",
  highlightOptions: DEFAULT_HIGHLIGHT_OPTIONS,
  theme: "dark",
};

export function clampReaderFontSize(size: number): number {
  return Math.min(
    READER_FONT_SIZE_MAX,
    Math.max(READER_FONT_SIZE_MIN, Math.round(size) || DEFAULT_READER_STYLE_PREFERENCES.fontSize),
  );
}

function isDisplayMode(value: string): value is DisplayMode {
  return value === "lines" || value === "full";
}

function isReaderTheme(value: string): value is ReaderTheme {
  return value === "light" || value === "dark";
}

export function normalizeReaderStylePreferences(
  input: Partial<ReaderStylePreferences> | null | undefined,
): ReaderStylePreferences {
  if (!input) return DEFAULT_READER_STYLE_PREFERENCES;

  const displayMode = input.displayMode;
  const highlight = input.highlightOptions;
  const theme = input.theme;

  return {
    fontSize: clampReaderFontSize(input.fontSize ?? DEFAULT_READER_STYLE_PREFERENCES.fontSize),
    displayMode:
      displayMode && isDisplayMode(displayMode)
        ? displayMode
        : DEFAULT_READER_STYLE_PREFERENCES.displayMode,
    theme:
      theme && isReaderTheme(theme)
        ? theme
        : DEFAULT_READER_STYLE_PREFERENCES.theme,
    highlightOptions: {
      highlightCurrent:
        highlight?.highlightCurrent ??
        DEFAULT_READER_STYLE_PREFERENCES.highlightOptions.highlightCurrent,
      dullRest:
        highlight?.dullRest ??
        DEFAULT_READER_STYLE_PREFERENCES.highlightOptions.dullRest,
      boldCurrent:
        highlight?.boldCurrent ??
        DEFAULT_READER_STYLE_PREFERENCES.highlightOptions.boldCurrent,
    },
  };
}

export function isValidLearningLanguageForStyles(
  languageCode: string,
): boolean {
  return isLearningLanguageCode(languageCode);
}