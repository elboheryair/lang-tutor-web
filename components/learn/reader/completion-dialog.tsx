"use client";

import { READER_SHORTCUTS } from "@/lib/reader/shortcuts";
import { ShortcutTooltip } from "@/components/learn/reader/shortcut-tooltip";
import { useEffect, useRef, useState } from "react";

import { SessionCompletionSummary } from "@/components/learn/session-completion-summary";
import type { SessionRecordingStats } from "@/lib/reader/recording-stats";

type CompletionDialogProps = {
  open: boolean;
  stats: SessionRecordingStats;
  onGoToSources: () => void;
  onContinueReading: () => void;
};

const ACTIONS = ["sources", "continue"] as const;

export function CompletionDialog({
  open,
  stats,
  onGoToSources,
  onContinueReading,
}: CompletionDialogProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sourcesRef = useRef<HTMLButtonElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
    sourcesRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % ACTIONS.length);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        if (ACTIONS[activeIndex] === "sources") onGoToSources();
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
  }, [open, activeIndex, onGoToSources, onContinueReading]);

  useEffect(() => {
    if (!open) return;
    if (activeIndex === 0) sourcesRef.current?.focus();
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
          Congratulations — you reached the end. Your progress is saved. Go back
          to your sources to pick another text, or keep practicing this one.
        </p>
        <SessionCompletionSummary stats={stats} className="mt-4" />
        <p className="mt-3 text-xs text-zinc-500">
          Each line and word counts once when you record it successfully.{" "}
          {READER_SHORTCUTS.modalMove} to choose,{" "}
          {READER_SHORTCUTS.modalConfirm} to confirm, Esc to keep reading.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <ShortcutTooltip
            label="Go to sources"
            shortcut={READER_SHORTCUTS.modalConfirm}
          >
            <button
              ref={sourcesRef}
              type="button"
              onClick={onGoToSources}
              className={`rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 ${
                activeIndex === 0 ? focusRing : ""
              }`}
            >
              Yes, go to sources
            </button>
          </ShortcutTooltip>
          <ShortcutTooltip label="Continue reading" shortcut="Esc">
            <button
              ref={continueRef}
              type="button"
              onClick={onContinueReading}
              className={`rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 ${
                activeIndex === 1 ? focusRing : ""
              }`}
            >
              No, keep practicing
            </button>
          </ShortcutTooltip>
        </div>
      </div>
    </div>
  );
}