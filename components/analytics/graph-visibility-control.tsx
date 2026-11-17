"use client";

import type { AnalyticsUiClasses } from "@/lib/analytics/analytics-ui";
import {
  ANALYTICS_GRAPH_IDS,
  GRAPH_PANEL_SHORT_LABELS,
  countVisibleGraphs,
  type AnalyticsGraphId,
  type GraphVisibility,
} from "@/lib/analytics/graph-panels";
import type { AnalyticsTheme } from "@/lib/analytics/preferences";

type GraphVisibilityControlProps = {
  ui: AnalyticsUiClasses;
  theme: AnalyticsTheme;
  graphVisible: GraphVisibility;
  onToggle: (graphId: AnalyticsGraphId, visible: boolean) => void;
};

export function GraphVisibilityControl({
  ui,
  theme,
  graphVisible,
  onToggle,
}: GraphVisibilityControlProps) {
  const isDark = theme === "dark";
  const visibleCount = countVisibleGraphs(graphVisible);

  return (
    <fieldset
      className={`rounded-2xl border p-4 ${ui.dateGroup}`}
    >
      <legend className={`px-1 text-sm font-medium ${ui.cardTitle}`}>
        Visible graphs
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {ANALYTICS_GRAPH_IDS.map((graphId) => {
          const checked = graphVisible[graphId];
          const disabled = checked && visibleCount <= 1;

          return (
            <label
              key={graphId}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                checked
                  ? ui.dateButtonActive
                  : ui.dateButtonIdle
              } ${
                isDark ? "border-white/10" : "border-zinc-200"
              } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-400 text-indigo-500 focus:ring-indigo-500"
                checked={checked}
                disabled={disabled}
                onChange={(event) => onToggle(graphId, event.target.checked)}
              />
              <span>{GRAPH_PANEL_SHORT_LABELS[graphId]}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}