"use client";

import type { AnalyticsGraphId } from "@/lib/analytics/graph-panels";
import type { AnalyticsTheme } from "@/lib/analytics/preferences";

type ChartDragHandleProps = {
  graphId: AnalyticsGraphId;
  theme: AnalyticsTheme;
  label: string;
  onDragStart: (graphId: AnalyticsGraphId) => void;
  onDragEnd: () => void;
};

export function ChartDragHandle({
  graphId,
  theme,
  label,
  onDragStart,
  onDragEnd,
}: ChartDragHandleProps) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", graphId);
        onDragStart(graphId);
      }}
      onDragEnd={onDragEnd}
      aria-label={`Drag to reorder: ${label}`}
      className={`flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-lg border active:cursor-grabbing ${
        isDark
          ? "border-white/15 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          : "border-zinc-300 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
      }`}
    >
      <svg aria-hidden className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="5" cy="4" r="1.25" />
        <circle cx="11" cy="4" r="1.25" />
        <circle cx="5" cy="8" r="1.25" />
        <circle cx="11" cy="8" r="1.25" />
        <circle cx="5" cy="12" r="1.25" />
        <circle cx="11" cy="12" r="1.25" />
      </svg>
    </button>
  );
}