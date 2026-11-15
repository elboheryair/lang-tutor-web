export type ReaderTheme = "light" | "dark";

export type DisplayMode = "lines" | "full";

export type HighlightOptions = {
  highlightCurrent: boolean;
  dullRest: boolean;
  boldCurrent: boolean;
};

export const DEFAULT_HIGHLIGHT_OPTIONS: HighlightOptions = {
  highlightCurrent: true,
  dullRest: false,
  boldCurrent: false,
};