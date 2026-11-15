"use client";

import { type ReactNode, useRef, useState } from "react";

type ShortcutTooltipProps = {
  label: string;
  shortcut?: string;
  children: ReactNode;
  isDark?: boolean;
};

export function ShortcutTooltip({
  label,
  shortcut,
  children,
  isDark = true,
}: ShortcutTooltipProps) {
  const [visible, setVisible] = useState(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showWithDelay() {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    showTimerRef.current = setTimeout(() => setVisible(true), 450);
  }

  function hide() {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    setVisible(false);
  }

  const tip = shortcut ? `${label} (${shortcut})` : label;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={showWithDelay}
      onMouseLeave={hide}
      onFocus={showWithDelay}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-50 max-w-[14rem] -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium shadow-lg ${
            isDark
              ? "border border-white/15 bg-zinc-900 text-zinc-100"
              : "border border-zinc-200 bg-white text-zinc-800"
          }`}
        >
          {tip}
        </span>
      )}
    </span>
  );
}