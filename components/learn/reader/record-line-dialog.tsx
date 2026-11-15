"use client";

import { READER_SHORTCUTS } from "@/lib/reader/shortcuts";
import { ShortcutTooltip } from "@/components/learn/reader/shortcut-tooltip";
import { useEffect, useRef, useState } from "react";

type RecordLineDialogProps = {
  open: boolean;
  onYes: () => void;
  onNo: () => void;
  onCancel: () => void;
};

const ACTIONS = ["yes", "no", "cancel"] as const;

export function RecordLineDialog({
  open,
  onYes,
  onNo,
  onCancel,
}: RecordLineDialogProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const yesRef = useRef<HTMLButtonElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const buttonRefs = [yesRef, noRef, cancelRef];

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
    yesRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + ACTIONS.length) % ACTIONS.length);
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
        if (action === "yes") onYes();
        else if (action === "no") onNo();
        else onCancel();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, activeIndex, onYes, onNo, onCancel]);

  useEffect(() => {
    if (!open) return;
    if (activeIndex === 0) yesRef.current?.focus();
    else if (activeIndex === 1) noRef.current?.focus();
    else cancelRef.current?.focus();
  }, [activeIndex, open]);

  if (!open) return null;

  const focusRing =
    "ring-2 ring-indigo-400 ring-offset-2 ring-offset-zinc-900";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-dialog-title"
        className="w-full max-w-sm rounded-2xl border border-white/20 bg-zinc-900 p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="record-dialog-title" className="text-lg font-semibold text-white">
          Repeat check
        </h2>
        <p className="mt-3 text-sm text-zinc-300">
          Did you succeed in repeating this line?
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Use {READER_SHORTCUTS.modalMove} to choose, {READER_SHORTCUTS.modalConfirm}{" "}
          to confirm.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <ShortcutTooltip label="Yes" shortcut={READER_SHORTCUTS.modalConfirm}>
            <button
              ref={yesRef}
              type="button"
              onClick={onYes}
              className={`rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 ${
                activeIndex === 0 ? focusRing : ""
              }`}
            >
              Yes
            </button>
          </ShortcutTooltip>
          <ShortcutTooltip label="No" shortcut={READER_SHORTCUTS.modalConfirm}>
            <button
              ref={noRef}
              type="button"
              onClick={onNo}
              className={`rounded-xl bg-zinc-700 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-600 ${
                activeIndex === 1 ? focusRing : ""
              }`}
            >
              No
            </button>
          </ShortcutTooltip>
          <ShortcutTooltip label="Cancel" shortcut="Esc">
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              className={`rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 ${
                activeIndex === 2 ? focusRing : ""
              }`}
            >
              Cancel
            </button>
          </ShortcutTooltip>
        </div>
      </div>
    </div>
  );
}