"use client";

import {
  completeDocumentSession,
  continueDocumentAfterCompletion,
  saveReaderStylePreferences,
  saveReadingPosition,
} from "@/app/(authenticated)/learn/reader/actions";
import {
  buildStoredCompletionReport,
  type StoredCompletionReport,
} from "@/lib/reader/completion-report";
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
  lineIndexFromWordProgress,
  splitContentIntoLines,
  wordProgressPercent,
} from "@/lib/reader/text";
import { useReaderKeyboardShortcuts } from "@/lib/reader/use-reader-keyboard-shortcuts";
import {
  clampReaderFontSize,
  type ReaderStylePreferences,
} from "@/lib/reader/style-preferences";
import type { DisplayMode, HighlightOptions, ReaderTheme } from "@/lib/reader/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ReaderViewProps = {
  documentId: string;
  title: string;
  content: string;
  initialPosition: number;
  initialCompletionReport: StoredCompletionReport | null;
  languageName: string;
  languageCode: string;
  initialStylePreferences: ReaderStylePreferences;
};

export function ReaderView({
  documentId,
  title,
  content,
  initialPosition,
  initialCompletionReport,
  languageName,
  languageCode,
  initialStylePreferences,
}: ReaderViewProps) {
  const router = useRouter();
  const lines = useMemo(() => splitContentIntoLines(content), [content]);
  const [theme, setTheme] = useState<ReaderTheme>(
    initialStylePreferences.theme,
  );
  const [displayMode, setDisplayMode] = useState<DisplayMode>(
    initialStylePreferences.displayMode,
  );
  const [highlightOptions, setHighlightOptions] = useState<HighlightOptions>(
    initialStylePreferences.highlightOptions,
  );
  const [fontSize, setFontSize] = useState(initialStylePreferences.fontSize);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [uniqueRecordedLines, setUniqueRecordedLines] = useState<Set<number>>(
    () => new Set(),
  );
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const styleSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stylePrefsInitializedRef = useRef(false);
  const currentLineRef = useRef(0);
  const [readyDocumentId, setReadyDocumentId] = useState<string | null>(null);

  useEffect(() => {
    currentLineRef.current = currentLineIndex;
  }, [currentLineIndex]);

  const progressPercent = useMemo(() => {
    if (completionOpen) return 100;
    return wordProgressPercent(lines, currentLineIndex);
  }, [lines, currentLineIndex, completionOpen]);
  const modalBlocking = recordOpen || exitOpen || completionOpen;
  const textObscured =
    recordOpen || sessionPaused || exitOpen || completionOpen;
  const isLastLine =
    lines.length > 0 && currentLineIndex === lines.length - 1;

  const sessionTimerActive =
    !sessionPaused && !exitOpen && !completionOpen;

  const completionStats = useMemo(
    () =>
      buildSessionRecordingStats(lines, uniqueRecordedLines, sessionSeconds),
    [lines, uniqueRecordedLines, sessionSeconds],
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
    if (lines.length === 0) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const reopeningCompleted =
      initialCompletionReport != null && initialPosition >= 100;

    if (reopeningCompleted) {
      setCurrentLineIndex(Math.max(0, lines.length - 1));
      setUniqueRecordedLines(
        new Set(initialCompletionReport.uniqueLineIndices),
      );
      setSessionSeconds(initialCompletionReport.sessionSeconds);
      setCompletionOpen(true);
    } else {
      setCurrentLineIndex(lineIndexFromWordProgress(initialPosition, lines));
      setSessionSeconds(0);
      setCompletionOpen(false);
      setUniqueRecordedLines(new Set());
    }

    setSessionPaused(false);
    setRecordOpen(false);
    setExitOpen(false);
    setReadyDocumentId(documentId);
  }, [documentId, initialPosition, initialCompletionReport, lines.length]);

  useEffect(() => {
    if (readyDocumentId !== documentId) return;
    persistProgress(progressPercent);
  }, [progressPercent, persistProgress, documentId, readyDocumentId]);

  useEffect(() => {
    if (!stylePrefsInitializedRef.current) {
      stylePrefsInitializedRef.current = true;
      return;
    }

    if (styleSaveTimerRef.current) clearTimeout(styleSaveTimerRef.current);
    styleSaveTimerRef.current = setTimeout(() => {
      void saveReaderStylePreferences(languageCode, {
        fontSize,
        displayMode,
        highlightOptions,
        theme,
      });
    }, 500);

    return () => {
      if (styleSaveTimerRef.current) clearTimeout(styleSaveTimerRef.current);
    };
  }, [
    languageCode,
    fontSize,
    displayMode,
    highlightOptions.highlightCurrent,
    highlightOptions.dullRest,
    highlightOptions.boldCurrent,
    theme,
  ]);

  useEffect(() => {
    if (!sessionTimerActive) return;
    const id = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [sessionTimerActive]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (styleSaveTimerRef.current) clearTimeout(styleSaveTimerRef.current);
    };
  }, []);

  const resumePracticeFromModal = useCallback(async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setCompletionOpen(false);
    const percent = wordProgressPercent(lines, currentLineRef.current);
    await continueDocumentAfterCompletion(documentId, percent);
    setSessionSeconds(0);
    setUniqueRecordedLines(new Set());
  }, [documentId, lines]);

  const showCompletion = useCallback(() => {
    setCompletionOpen(true);
  }, []);

  const goToLine = useCallback(
    (index: number) => {
      if (lines.length === 0) return;
      const nextIndex = Math.min(lines.length - 1, Math.max(0, index));
      if (completionOpen) {
        void (async () => {
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
          setCompletionOpen(false);
          const percent = wordProgressPercent(lines, nextIndex);
          await continueDocumentAfterCompletion(documentId, percent);
          setSessionSeconds(0);
          setUniqueRecordedLines(new Set());
          setCurrentLineIndex(nextIndex);
        })();
        return;
      }
      setCurrentLineIndex(nextIndex);
    },
    [completionOpen, documentId, lines],
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
    setFontSize((size) => clampReaderFontSize(size - 1));
  }, []);

  const increaseFont = useCallback(() => {
    setFontSize((size) => clampReaderFontSize(size + 1));
  }, []);

  const openRecord = useCallback(() => setRecordOpen(true), []);

  const leaveToSources = useCallback(async () => {
    await flushProgress();
    router.push("/learn/source");
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
          onFontSizeChange={(size) => setFontSize(clampReaderFontSize(size))}
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
        onContinueReading={() => {
          void resumePracticeFromModal();
        }}
        onGoToSources={async () => {
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
          const report = buildStoredCompletionReport(
            uniqueRecordedLines,
            completionStats,
          );
          await completeDocumentSession(documentId, report);
          setCompletionOpen(false);
          router.push("/learn/source");
        }}
      />
    </div>
  );
}