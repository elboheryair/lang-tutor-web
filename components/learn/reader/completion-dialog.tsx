"use client";

import { READER_SHORTCUTS } from "@/lib/reader/shortcuts";
import { ShortcutTooltip } from "@/components/learn/reader/shortcut-tooltip";
import { useEffect, useRef, useState } from "react";

import type { SessionRecordingStats } from "@/lib/reader/recording-stats";
import { formatSessionTime } from "@/lib/reader/time";

type CompletionDialogProps = {
  open: boolean;
  stats: SessionRecordingStats;
  onLeaveSession: () => void;
  onGoHome: () => void;
  onContinueReading: () => void;
};

const ACTIONS = ["leave", "home", "continue"] as const;

export function CompletionDialog({
  open,
  stats,
  onLeaveSession,
  onGoHome,
  onContinueReading,
}: CompletionDialogProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const leaveRef = useRef<HTMLButtonElement>(null);
  const homeRef = useRef<HTMLButtonElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
    leaveRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex(
          (index) => (index - 1 + ACTIONS.length) % ACTIONS.length,
        );
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % ACTIONS.length);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const action = ACTIONS[activeIndex];
        if (action === "leave") onLeaveSession();
        else if (action === "home") onGoHome();
        else onContinueReading();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        onContinueReading();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, activeIndex, onLeaveSession, onGoHome, onContinueReading]);

  useEffect(() => {
    if (!open) return;
    if (activeIndex === 0) leaveRef.current?.focus();
    else if (activeIndex === 1) homeRef.current?.focus();
    else continueRef.current?.focus();
  }, [activeIndex, open]);

  if (!open) return null;

  const focusRing =
    "ring-2 ring-indigo-400 ring-offset-2 ring-offset-zinc-900";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-dialog-title"
        className="w-full max-w-md rounded-2xl border border-white/20 bg-zinc-900 p-6 shadow-2xl"
      >
        <h2
          id="completion-dialog-title"
          className="text-lg font-semibold text-white"
        >
          You finished this text!
        </h2>
        <p className="mt-3 text-sm text-zinc-300">
          Congratulations — you reached the end. Your progress is saved.
        </p>
        <dl className="mt-4 space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-400">Lines recorded (unique)</dt>
            <dd className="tabular-nums font-medium text-white">
              {stats.uniqueLinesRecorded} / {stats.totalLines}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-400">Words recorded (unique)</dt>
            <dd className="tabular-nums font-medium text-white">
              {stats.uniqueWordsRecorded} / {stats.totalWords}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-400">Practice recordings (session)</dt>
            <dd className="tabular-nums text-zinc-300">
              {stats.totalPracticeRecordings}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-400">Time in session</dt>
            <dd className="tabular-nums font-medium text-white">
              {formatSessionTime(stats.sessionSeconds)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-zinc-500">
          Each line and word counts once in the summary above, even if you
          recorded it multiple times. Leave the session, go home, or keep
          practicing.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <ShortcutTooltip
            label="Leave session"
            shortcut={READER_SHORTCUTS.modalConfirm}
          >
            <button
              ref={leaveRef}
              type="button"
              onClick={onLeaveSession}
              className={`rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 ${
                activeIndex === 0 ? focusRing : ""
              }`}
            >
              Leave session
            </button>
          </ShortcutTooltip>
          <ShortcutTooltip label="Homepage" shortcut={READER_SHORTCUTS.modalConfirm}>
            <button
              ref={homeRef}
              type="button"
              onClick={onGoHome}
              className={`rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 ${
                activeIndex === 1 ? focusRing : ""
              }`}
            >
              Go to homepage
            </button>
          </ShortcutTooltip>
          <ShortcutTooltip label="Continue reading" shortcut="Esc">
            <button
              ref={continueRef}
              type="button"
              onClick={onContinueReading}
              className={`rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 ${
                activeIndex === 2 ? focusRing : ""
              }`}
            >
              Continue reading
            </button>
          </ShortcutTooltip>
        </div>
      </div>
    </div>
  );
}