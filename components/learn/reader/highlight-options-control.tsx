"use client";

import { ShortcutTooltip } from "@/components/learn/reader/shortcut-tooltip";
import type { HighlightOptions } from "@/lib/reader/types";
import { useEffect, useId, useRef, useState } from "react";

const OPTIONS: {
  key: keyof HighlightOptions;
  label: string;
  rubric: string;
}[] = [
  {
    key: "highlightCurrent",
    label: "Highlight current line",
    rubric: "Adds a background on the line you are on.",
  },
  {
    key: "dullRest",
    label: "Dull the rest of the text",
    rubric: "Fades lines above and below the active one.",
  },
  {
    key: "boldCurrent",
    label: "Bold",
    rubric: "Makes the active line heavier type.",
  },
];

function summarizeHighlightOptions(value: HighlightOptions): string {
  const active = OPTIONS.filter((o) => value[o.key]);
  if (active.length === 0) return "None";
  if (active.length === OPTIONS.length) return "All";
  return active.map((o) => o.label.split(" ")[0]).join(", ");
}

type HighlightOptionsControlProps = {
  value: HighlightOptions;
  onChange: (value: HighlightOptions) => void;
  isDark: boolean;
  selectTriggerClass: string;
};

export function HighlightOptionsControl({
  value,
  onChange,
  isDark,
  selectTriggerClass,
}: HighlightOptionsControlProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <ShortcutTooltip label="Line styling" isDark={isDark}>
        <button
          type="button"
          id={`${menuId}-trigger`}
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={`${menuId}-panel`}
          onClick={() => setOpen((prev) => !prev)}
          className={`${selectTriggerClass} inline-flex min-w-[10.5rem] items-center justify-between gap-2 text-left`}
        >
          <span className="truncate">
            <span className="font-medium">Line styling</span>
            <span className="opacity-70"> · {summarizeHighlightOptions(value)}</span>
          </span>
          <span aria-hidden className="shrink-0 text-xs opacity-60">
            ▾
          </span>
        </button>
      </ShortcutTooltip>

      {open && (
        <div
          id={`${menuId}-panel`}
          role="group"
          aria-labelledby={`${menuId}-trigger`}
          className={`absolute left-0 top-[calc(100%+0.35rem)] z-50 w-[min(100vw-2rem,18rem)] rounded-xl border p-3 shadow-xl ${
            isDark
              ? "border-white/15 bg-zinc-900"
              : "border-zinc-200 bg-white"
          }`}
        >
          <p
            className={`mb-2 text-xs font-medium ${
              isDark ? "text-zinc-400" : "text-zinc-600"
            }`}
          >
            Combine any options
          </p>
          <ul className="space-y-2.5">
            {OPTIONS.map((option) => {
              const inputId = `${menuId}-${option.key}`;
              return (
                <li key={option.key}>
                  <label
                    htmlFor={inputId}
                    className={`flex cursor-pointer gap-2 ${
                      isDark ? "text-zinc-200" : "text-zinc-800"
                    }`}
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={value[option.key]}
                      onChange={(event) =>
                        onChange({
                          ...value,
                          [option.key]: event.target.checked,
                        })
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-500 accent-indigo-500"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm leading-tight">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-zinc-500">
                        {option.rubric}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}