"use client";

import { ChartDragHandle } from "@/components/analytics/chart-drag-handle";
import type { AnalyticsUiClasses } from "@/lib/analytics/analytics-ui";
import type { AnalyticsGraphId } from "@/lib/analytics/graph-panels";
import type { AnalyticsTheme } from "@/lib/analytics/preferences";
import type { ReactNode } from "react";

type DraggableChartCardProps = {
  graphId: AnalyticsGraphId;
  label: string;
  ui: AnalyticsUiClasses;
  theme: AnalyticsTheme;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: (graphId: AnalyticsGraphId) => void;
  onDragEnd: () => void;
  onDragOver: (graphId: AnalyticsGraphId) => void;
  onDragLeave: (graphId: AnalyticsGraphId) => void;
  onDrop: (graphId: AnalyticsGraphId) => void;
  handlePlacement?: "card" | "chart-axis";
  children: ReactNode;
};

export function DraggableChartCard({
  graphId,
  label,
  ui,
  theme,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  handlePlacement = "card",
  children,
}: DraggableChartCardProps) {
  return (
    <section
      className={`rounded-2xl border p-5 transition ${
        ui.card
      } ${isDragging ? "opacity-45" : ""} ${
        isDropTarget ? "ring-2 ring-indigo-400/70 ring-offset-2 ring-offset-transparent" : ""
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDragOver(graphId);
      }}
      onDragLeave={() => onDragLeave(graphId)}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(graphId);
      }}
    >
      {handlePlacement === "chart-axis" ? (
        children
      ) : (
        <div className="flex items-start gap-2">
          <ChartDragHandle
            graphId={graphId}
            theme={theme}
            label={label}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      )}
    </section>
  );
}