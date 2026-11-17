"use client";

import { ChartDragHandle } from "@/components/analytics/chart-drag-handle";
import { CompletedSessionsChart } from "@/components/analytics/completed-sessions-chart";
import { DraggableChartCard } from "@/components/analytics/draggable-chart-card";
import { DualMetricChart } from "@/components/analytics/dual-metric-chart";
import { PracticeTimeChart } from "@/components/analytics/practice-time-chart";
import type { AnalyticsUiClasses } from "@/lib/analytics/analytics-ui";
import {
  GRAPH_PANEL_LABELS,
  reorderGraphPanels,
  type AnalyticsGraphId,
  type GraphVisibility,
} from "@/lib/analytics/graph-panels";
import { chartDimensionsFromCellSize } from "@/lib/analytics/chart-cell-size";
import type { AnalyticsPreferences, AnalyticsTheme } from "@/lib/analytics/preferences";
import type { DailyReadingMetrics } from "@/lib/analytics/types";
import { useCallback, useMemo, useState, type ReactNode } from "react";

type AnalyticsGraphsLayoutProps = {
  series: DailyReadingMetrics[];
  ui: AnalyticsUiClasses;
  theme: AnalyticsTheme;
  preferences: AnalyticsPreferences;
  onPreferencesChange: (patch: Partial<AnalyticsPreferences>) => void;
};

export function AnalyticsGraphsLayout({
  series,
  ui,
  theme,
  preferences,
  onPreferencesChange,
}: AnalyticsGraphsLayoutProps) {
  const [draggingId, setDraggingId] = useState<AnalyticsGraphId | null>(null);
  const [dropTargetId, setDropTargetId] = useState<AnalyticsGraphId | null>(null);

  const visibleOrder = useMemo(
    () =>
      preferences.graphOrder.filter((id) => preferences.graphVisible[id]),
    [preferences.graphOrder, preferences.graphVisible],
  );

  const { width: chartWidth, height: chartHeight } = useMemo(
    () => chartDimensionsFromCellSize(preferences.chartCellSize),
    [preferences.chartCellSize],
  );

  const handleDragStart = useCallback((graphId: AnalyticsGraphId) => {
    setDraggingId(graphId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDropTargetId(null);
  }, []);

  const handleDragOver = useCallback((graphId: AnalyticsGraphId) => {
    if (draggingId && draggingId !== graphId) {
      setDropTargetId(graphId);
    }
  }, [draggingId]);

  const handleDragLeave = useCallback((graphId: AnalyticsGraphId) => {
    setDropTargetId((current) => (current === graphId ? null : current));
  }, []);

  const handleDrop = useCallback(
    (targetId: AnalyticsGraphId) => {
      if (!draggingId || draggingId === targetId) {
        handleDragEnd();
        return;
      }

      onPreferencesChange({
        graphOrder: reorderGraphPanels(
          preferences.graphOrder,
          draggingId,
          targetId,
        ),
      });
      handleDragEnd();
    },
    [draggingId, handleDragEnd, onPreferencesChange, preferences.graphOrder],
  );

  const renderPanel = (graphId: AnalyticsGraphId) => {
    const card = (
      content: ReactNode,
      options?: { handlePlacement?: "card" | "chart-axis" },
    ) => (
      <DraggableChartCard
        graphId={graphId}
        label={GRAPH_PANEL_LABELS[graphId]}
        ui={ui}
        theme={theme}
        isDragging={draggingId === graphId}
        isDropTarget={dropTargetId === graphId}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        handlePlacement={options?.handlePlacement ?? "card"}
      >
        {content}
      </DraggableChartCard>
    );

    const yAxisDragHandle = (
      <ChartDragHandle
        graphId={graphId}
        theme={theme}
        label={GRAPH_PANEL_LABELS[graphId]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />
    );

    switch (graphId) {
      case "lines":
        return card(
          <DualMetricChart
            title="Lines"
            yAxisDragHandle={yAxisDragHandle}
            ui={ui}
            theme={theme}
            data={series}
            readKey="linesRead"
            recordedKey="linesRecorded"
            readLabel="Lines read"
            recordedLabel="Lines recorded"
            seriesMode={preferences.linesMetricSeries}
            onSeriesModeChange={(linesMetricSeries) =>
              onPreferencesChange({ linesMetricSeries })
            }
            unified={preferences.linesChartsUnified}
            onUnifiedChange={(linesChartsUnified) =>
              onPreferencesChange({ linesChartsUnified })
            }
            chartHeight={chartHeight}
          />,
          { handlePlacement: "chart-axis" },
        );
      case "words":
        return card(
          <DualMetricChart
            title="Words"
            yAxisDragHandle={yAxisDragHandle}
            ui={ui}
            theme={theme}
            data={series}
            readKey="wordsRead"
            recordedKey="wordsRecorded"
            readLabel="Words read"
            recordedLabel="Words recorded"
            seriesMode={preferences.wordsMetricSeries}
            onSeriesModeChange={(wordsMetricSeries) =>
              onPreferencesChange({ wordsMetricSeries })
            }
            unified={preferences.wordsChartsUnified}
            onUnifiedChange={(wordsChartsUnified) =>
              onPreferencesChange({ wordsChartsUnified })
            }
            chartHeight={chartHeight}
          />,
          { handlePlacement: "chart-axis" },
        );
      case "practice_time":
        return card(
          <PracticeTimeChart
            data={series}
            theme={theme}
            ui={ui}
            chartHeight={chartHeight}
            yAxisDragHandle={yAxisDragHandle}
          />,
          { handlePlacement: "chart-axis" },
        );
      case "completed_sessions":
        return card(
          <CompletedSessionsChart
            data={series}
            theme={theme}
            ui={ui}
            chartHeight={chartHeight}
            yAxisDragHandle={yAxisDragHandle}
          />,
          { handlePlacement: "chart-axis" },
        );
      default:
        return null;
    }
  };

  if (visibleOrder.length === 0) {
    return (
      <p className={`rounded-xl border border-dashed px-4 py-6 text-center text-sm ${ui.dashedEmpty}`}>
        No graphs selected. Enable at least one chart in Visible graphs above.
      </p>
    );
  }

  return (
    <div
      className="grid w-full gap-8"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${chartWidth}px), 1fr))`,
      }}
    >
      {visibleOrder.map((graphId) => (
        <div
          key={graphId}
          className="min-w-0 w-full justify-self-center"
          style={{ maxWidth: chartWidth }}
        >
          {renderPanel(graphId)}
        </div>
      ))}
    </div>
  );
}