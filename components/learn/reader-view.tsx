"use client";

import { saveReadingPosition } from "@/app/(authenticated)/learn/reader/actions";
import { CompletionDialog } from "@/components/learn/reader/completion-dialog";
import { ExitConfirmDialog } from "@/components/learn/reader/exit-confirm-dialog";
import { ReaderRemote } from "@/components/learn/reader/reader-remote";
import { ReaderTextPanel } from "@/components/learn/reader/reader-text-panel";
import { ReaderToolbar } from "@/components/learn/reader/reader-toolbar";
import { ReadingPausedNotice } from "@/components/learn/reader/reading-paused-notice";
import { RecordLineDialog } from "@/components/learn/reader/record-line-dialog";
import { buildSessionRecordingStats } from "@/lib/reader/recording-stats";
import { formatSessionTime } from "@/lib/reader/time";
import {
  lineIndexFromProgress,
  splitContentIntoLines,
  wordProgressPercent,
} from "@/lib/reader/text";
import { useReaderKeyboardShortcuts } from "@/lib/reader/use-reader-keyboard-shortcuts";
import {
  DEFAULT_HIGHLIGHT_OPTIONS,
  type DisplayMode,
  type HighlightOptions,
  type ReaderTheme,
} from "@/lib/reader/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ReaderViewProps = {
  documentId: string;
  title: string;
  content: string;
  initialPosition: number;
  languageName: string;
};

const MIN_FONT = 14;
const MAX_FONT = 32;

function clampFont(size: number): number {
  return Math.min(MAX_FONT, Math.max(MIN_FONT, Math.round(size) || MIN_FONT));
}

export function ReaderView({
  documentId,
  title,
  content,
  initialPosition,
  languageName,
}: ReaderViewProps) {
  const router = useRouter();
  const lines = useMemo(() => splitContentIntoLines(content), [content]);
  const [theme, setTheme] = useState<ReaderTheme>("dark");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("full");
  const [highlightOptions, setHighlightOptions] = useState<HighlightOptions>(
    DEFAULT_HIGHLIGHT_OPTIONS,
  );
  const [fontSize, setFontSize] = useState(18);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [uniqueRecordedLines, setUniqueRecordedLines] = useState<Set<number>>(
    () => new Set(),
  );
  const [recordAttemptsByLine, setRecordAttemptsByLine] = useState<
    Record<number, number>
  >({});
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);
  const currentLineRef = useRef(0);

  useEffect(() => {
    currentLineRef.current = currentLineIndex;
  }, [currentLineIndex]);

  const progressPercent = wordProgressPercent(lines, currentLineIndex);
  const modalBlocking = recordOpen || exitOpen || completionOpen;
  const textObscured =
    recordOpen || sessionPaused || exitOpen || completionOpen;
  const isLastLine =
    lines.length > 0 && currentLineIndex === lines.length - 1;

  const sessionTimerActive =
    !sessionPaused && !exitOpen && !completionOpen;

  const completionStats = useMemo(
    () =>
      buildSessionRecordingStats(
        lines,
        uniqueRecordedLines,
        recordAttemptsByLine,
        sessionSeconds,
      ),
    [lines, uniqueRecordedLines, recordAttemptsByLine, sessionSeconds],
  );

  const themeClasses = useMemo(
    () =>
      theme === "dark"
        ? {
            panel: "border-white/10 bg-zinc-900/50",
            text: "text-zinc-200",
            current: "bg-indigo-500/25 text-indigo-50",
            dull: "opacity-35",
          }
        : {
            panel: "border-zinc-200 bg-zinc-50",
            text: "text-zinc-800",
            current: "bg-indigo-100 text-indigo-950",
            dull: "opacity-40",
          },
    [theme],
  );

  const persistProgress = useCallback(
    (percent: number) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        void saveReadingPosition(documentId, percent);
      }, 500);
    },
    [documentId],
  );

  const flushProgress = useCallback(async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await saveReadingPosition(documentId, progressPercent);
  }, [documentId, progressPercent]);

  useEffect(() => {
    if (initializedRef.current || lines.length === 0) return;
    initializedRef.current = true;
    setCurrentLineIndex(lineIndexFromProgress(initialPosition, lines.length));
  }, [initialPosition, lines.length]);

  useEffect(() => {
    persistProgress(progressPercent);
  }, [progressPercent, persistProgress]);

  useEffect(() => {
    if (!sessionTimerActive) return;
    const id = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [sessionTimerActive]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const showCompletion = useCallback(() => {
    setCompletionOpen(true);
  }, []);

  const goToLine = useCallback(
    (index: number) => {
      if (lines.length === 0) return;
      setCurrentLineIndex(
        Math.min(lines.length - 1, Math.max(0, index)),
      );
    },
    [lines.length],
  );

  const tryAdvanceLine = useCallback(() => {
    if (lines.length === 0) return;
    const lineIndex = currentLineRef.current;
    if (lineIndex >= lines.length - 1) {
      showCompletion();
      return;
    }
    setCurrentLineIndex(lineIndex + 1);
  }, [lines.length, showCompletion]);

  const registerSuccessfulRecording = useCallback((lineIndex: number) => {
    setUniqueRecordedLines((prev) => {
      const next = new Set(prev);
      next.add(lineIndex);
      return next;
    });
    setRecordAttemptsByLine((prev) => ({
      ...prev,
      [lineIndex]: (prev[lineIndex] ?? 0) + 1,
    }));
  }, []);

  const handleRecordYes = useCallback(() => {
    const lineIndex = currentLineRef.current;
    registerSuccessfulRecording(lineIndex);
    setRecordOpen(false);
    if (lineIndex >= lines.length - 1) {
      showCompletion();
      return;
    }
    setCurrentLineIndex(lineIndex + 1);
  }, [lines.length, registerSuccessfulRecording, showCompletion]);

  const toggleSessionPause = useCallback(() => {
    setSessionPaused((paused) => !paused);
  }, []);

  const requestExit = useCallback(() => setExitOpen(true), []);

  const decreaseFont = useCallback(() => {
    setFontSize((size) => clampFont(size - 1));
  }, []);

  const increaseFont = useCallback(() => {
    setFontSize((size) => clampFont(size + 1));
  }, []);

  const openRecord = useCallback(() => setRecordOpen(true), []);

  const leaveToSources = useCallback(async () => {
    await flushProgress();
    router.push("/learn/source");
  }, [flushProgress, router]);

  const leaveToHome = useCallback(async () => {
    await flushProgress();
    router.push("/dashboard");
  }, [flushProgress, router]);

  useReaderKeyboardShortcuts({
    enabled: !modalBlocking,
    canGoPrevious: currentLineIndex > 0,
    canGoNext: lines.length > 0,
    onPreviousLine: () => goToLine(currentLineIndex - 1),
    onNextLine: tryAdvanceLine,
    onRecord: openRecord,
    onTogglePause: toggleSessionPause,
    onRequestExit: requestExit,
    onDecreaseFont: decreaseFont,
    onIncreaseFont: increaseFont,
  });

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="shrink-0">
        <ReaderToolbar
          title={title}
          languageName={languageName}
          theme={theme}
          displayMode={displayMode}
          highlightOptions={highlightOptions}
          fontSize={fontSize}
          sessionLabel={formatSessionTime(sessionSeconds)}
          sessionPaused={sessionPaused}
          onTogglePause={toggleSessionPause}
          onRequestExit={requestExit}
          wordProgressPercent={progressPercent}
          currentLine={currentLineIndex}
          totalLines={lines.length}
          onThemeToggle={() =>
            setTheme((t) => (t === "dark" ? "light" : "dark"))
          }
          onDisplayModeChange={setDisplayMode}
          onHighlightOptionsChange={setHighlightOptions}
          onFontSizeChange={(size) => setFontSize(clampFont(size))}
        />
      </div>

      <div className="relative mx-auto mt-3 min-h-0 w-full max-w-4xl flex-1 shrink">
        <ReaderTextPanel
          lines={lines}
          currentLineIndex={currentLineIndex}
          displayMode={displayMode}
          highlightOptions={highlightOptions}
          fontSize={fontSize}
          themeClasses={themeClasses}
          obscured={textObscured}
        />
        {sessionPaused && !modalBlocking && (
          <ReadingPausedNotice
            isDark={theme === "dark"}
            onContinue={() => setSessionPaused(false)}
          />
        )}
      </div>

      <div className="shrink-0 pb-1 pt-2">
        <ReaderRemote
          canGoPrevious={currentLineIndex > 0}
          canGoNext={!isLastLine || lines.length > 0}
          onPrevious={() => goToLine(currentLineIndex - 1)}
          onNext={tryAdvanceLine}
          onRecord={openRecord}
        />
      </div>

      <RecordLineDialog
        open={recordOpen}
        onCancel={() => setRecordOpen(false)}
        onNo={() => setRecordOpen(false)}
        onYes={handleRecordYes}
      />

      <ExitConfirmDialog
        open={exitOpen}
        onCancel={() => setExitOpen(false)}
        onConfirm={async () => {
          setExitOpen(false);
          await leaveToSources();
        }}
      />

      <CompletionDialog
        open={completionOpen}
        stats={completionStats}
        onContinueReading={() => setCompletionOpen(false)}
        onLeaveSession={async () => {
          setCompletionOpen(false);
          await leaveToSources();
        }}
        onGoHome={async () => {
          setCompletionOpen(false);
          await leaveToHome();
        }}
      />
    </div>
  );
}