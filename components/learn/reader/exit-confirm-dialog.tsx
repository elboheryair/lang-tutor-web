"use client";

import { READER_SHORTCUTS } from "@/lib/reader/shortcuts";
import { ShortcutTooltip } from "@/components/learn/reader/shortcut-tooltip";
import { useEffect, useRef, useState } from "react";

type ExitConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ACTIONS = ["confirm", "cancel"] as const;

export function ExitConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: ExitConfirmDialogProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
    confirmRef.current?.focus();
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
        if (ACTIONS[activeIndex] === "confirm") onConfirm();
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
  }, [open, activeIndex, onConfirm, onCancel]);

  useEffect(() => {
    if (!open) return;
    if (activeIndex === 0) confirmRef.current?.focus();
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
        aria-labelledby="exit-dialog-title"
        className="w-full max-w-sm rounded-2xl border border-white/20 bg-zinc-900 p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="exit-dialog-title" className="text-lg font-semibold text-white">
          Exit reader?
        </h2>
        <p className="mt-3 text-sm text-zinc-300">
          Are you sure you want to exit? Your progress will be saved.
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          {READER_SHORTCUTS.modalMove} to choose, {READER_SHORTCUTS.modalConfirm}{" "}
          to confirm, Esc to cancel.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <ShortcutTooltip label="Yes, exit" shortcut={READER_SHORTCUTS.modalConfirm}>
            <button
              ref={confirmRef}
              type="button"
              onClick={onConfirm}
              className={`rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 ${
                activeIndex === 0 ? focusRing : ""
              }`}
            >
              Yes
            </button>
          </ShortcutTooltip>
          <ShortcutTooltip label="Cancel" shortcut="Esc">
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              className={`rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 ${
                activeIndex === 1 ? focusRing : ""
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