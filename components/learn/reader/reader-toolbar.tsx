import { HighlightOptionsControl } from "@/components/learn/reader/highlight-options-control";
import { ShortcutTooltip } from "@/components/learn/reader/shortcut-tooltip";
import { READER_SHORTCUTS } from "@/lib/reader/shortcuts";
import type {
  DisplayMode,
  HighlightOptions,
  ReaderTheme,
} from "@/lib/reader/types";
import { useEffect, useId, useState } from "react";

type ReaderToolbarProps = {
  title: string;
  languageName: string;
  theme: ReaderTheme;
  displayMode: DisplayMode;
  highlightOptions: HighlightOptions;
  fontSize: number;
  sessionLabel: string;
  wordProgressPercent: number;
  currentLine: number;
  totalLines: number;
  onThemeToggle: () => void;
  onDisplayModeChange: (mode: DisplayMode) => void;
  onHighlightOptionsChange: (options: HighlightOptions) => void;
  onFontSizeChange: (size: number) => void;
  sessionPaused: boolean;
  onTogglePause: () => void;
  onRequestExit: () => void;
};

function SunIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="0.5" />
      <rect x="14" y="5" width="4" height="14" rx="0.5" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 1 0 11.5 11z" />
    </svg>
  );
}

const selectClass =
  "rounded-lg border border-white/15 bg-zinc-900/80 px-2.5 py-1.5 text-sm text-white outline-none ring-indigo-500 focus:ring-2";

const selectClassLight =
  "rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 outline-none ring-indigo-500 focus:ring-2";

export function ReaderToolbar({
  title,
  languageName,
  theme,
  displayMode,
  highlightOptions,
  fontSize,
  sessionLabel,
  wordProgressPercent,
  currentLine,
  totalLines,
  onThemeToggle,
  onDisplayModeChange,
  onHighlightOptionsChange,
  onFontSizeChange,
  sessionPaused,
  onTogglePause,
  onRequestExit,
}: ReaderToolbarProps) {
  const displayId = useId();
  const fontId = useId();
  const isDark = theme === "dark";
  const [fontDraft, setFontDraft] = useState(String(fontSize));

  useEffect(() => {
    setFontDraft(String(fontSize));
  }, [fontSize]);

  function commitFontDraft() {
    const parsed = Number.parseInt(fontDraft, 10);
    if (!Number.isNaN(parsed)) {
      onFontSizeChange(parsed);
      return;
    }
    setFontDraft(String(fontSize));
  }

  return (
    <header
      className={`space-y-4 rounded-2xl border p-4 sm:p-5 ${
        isDark ? "border-white/10 bg-zinc-900/60" : "border-zinc-200 bg-white shadow-sm"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${
              isDark ? "text-indigo-300" : "text-indigo-600"
            }`}
          >
            {languageName}
          </p>
          <h1
            className={`mt-1 truncate text-xl font-semibold sm:text-2xl ${
              isDark ? "text-white" : "text-zinc-900"
            }`}
          >
            {title}
          </h1>
        </div>
        <ShortcutTooltip
          label="Exit"
          shortcut={READER_SHORTCUTS.exit}
          isDark={isDark}
        >
          <button
            type="button"
            onClick={onRequestExit}
            className={`inline-flex shrink-0 rounded-lg border px-3 py-2 text-sm transition ${
              isDark
                ? "border-white/15 text-zinc-300 hover:bg-white/5"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Exit
          </button>
        </ShortcutTooltip>
      </div>

      <div
        className={`flex flex-wrap items-center gap-2 sm:gap-3 ${
          isDark ? "text-zinc-300" : "text-zinc-700"
        }`}
      >
        <ShortcutTooltip
          label={isDark ? "Day mode" : "Night mode"}
          isDark={isDark}
        >
          <button
            type="button"
            onClick={onThemeToggle}
            aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition ${
              isDark
                ? "border-white/15 hover:bg-white/10"
                : "border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
            <span className="hidden sm:inline">{isDark ? "Day" : "Night"}</span>
          </button>
        </ShortcutTooltip>

        <ShortcutTooltip label="Display mode" isDark={isDark}>
          <div className="flex items-center gap-1.5">
            <label htmlFor={displayId} className="sr-only">
              Display mode
            </label>
            <select
              id={displayId}
              value={displayMode}
              onChange={(e) =>
                onDisplayModeChange(e.target.value as DisplayMode)
              }
              className={isDark ? selectClass : selectClassLight}
            >
              <option value="lines">Separate lines</option>
              <option value="full">Full text</option>
            </select>
          </div>
        </ShortcutTooltip>

        <HighlightOptionsControl
          value={highlightOptions}
          onChange={onHighlightOptionsChange}
          isDark={isDark}
          selectTriggerClass={isDark ? selectClass : selectClassLight}
        />

        <div className="flex items-center gap-1" role="group" aria-labelledby={fontId}>
          <span id={fontId} className="sr-only">
            Text size
          </span>
          <ShortcutTooltip
            label="Decrease text size"
            shortcut={READER_SHORTCUTS.decreaseFont}
            isDark={isDark}
          >
            <button
              type="button"
              aria-label="Decrease text size"
              onClick={() => onFontSizeChange(fontSize - 1)}
              className={`h-9 w-9 rounded-lg border text-lg font-semibold ${
                isDark ? "border-white/15" : "border-zinc-300"
              }`}
            >
              −
            </button>
          </ShortcutTooltip>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={fontDraft}
            onChange={(e) =>
              setFontDraft(e.target.value.replace(/[^\d]/g, ""))
            }
            onBlur={commitFontDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitFontDraft();
              }
            }}
            aria-label="Font size in pixels"
            className={`w-14 rounded-lg border px-1 py-1.5 text-center text-sm tabular-nums ${
              isDark
                ? "border-white/15 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-900"
            }`}
          />
          <ShortcutTooltip
            label="Increase text size"
            shortcut={READER_SHORTCUTS.increaseFont}
            isDark={isDark}
          >
            <button
              type="button"
              aria-label="Increase text size"
              onClick={() => onFontSizeChange(fontSize + 1)}
              className={`h-9 w-9 rounded-lg border text-lg font-semibold ${
                isDark ? "border-white/15" : "border-zinc-300"
              }`}
            >
              +
            </button>
          </ShortcutTooltip>
        </div>

        <ShortcutTooltip
          label={sessionPaused ? "Resume reading" : "Pause session"}
          shortcut={READER_SHORTCUTS.pauseResume}
          isDark={isDark}
        >
          <button
            type="button"
            onClick={onTogglePause}
            aria-label={
              sessionPaused
                ? `Session paused at ${sessionLabel}`
                : `Pause session timer (${sessionLabel})`
            }
            className={`ml-auto inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm tabular-nums transition ${
              isDark
                ? "border-white/15 hover:bg-white/10"
                : "border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            <PauseIcon />
            <span>{sessionLabel}</span>
          </button>
        </ShortcutTooltip>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs">
          <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>
            Word progress
          </span>
          <span className="tabular-nums">
            {wordProgressPercent}% · line {Math.min(currentLine + 1, totalLines)}/
            {totalLines}
          </span>
        </div>
        <div
          className={`mt-1.5 h-2 overflow-hidden rounded-full ${
            isDark ? "bg-white/10" : "bg-zinc-200"
          }`}
          role="progressbar"
          aria-valuenow={wordProgressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${wordProgressPercent}%` }}
          />
        </div>
      </div>
    </header>
  );
}