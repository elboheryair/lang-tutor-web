import { chartDimensionsFromCellSize } from "@/lib/analytics/chart-cell-size";
import {
  defaultAnalyticsPreferences,
  normalizeAnalyticsPreferences,
  type AnalyticsPreferences,
} from "@/lib/analytics/preferences";
import { createClient } from "@/lib/supabase/server";

type AnalyticsPreferencesRow = {
  theme: string;
  date_preset: string;
  custom_start: string | null;
  custom_end: string | null;
  lines_charts_unified: boolean;
  words_charts_unified: boolean;
  lines_metric_series: string | null;
  words_metric_series: string | null;
  chart_height: number | null;
  chart_width: number | null;
  chart_cell_size: number | null;
  graph_order: string[] | null;
  graph_visible: Record<string, boolean> | null;
};

function rowToPreferences(row: AnalyticsPreferencesRow): AnalyticsPreferences {
  return normalizeAnalyticsPreferences({
    theme: row.theme,
    datePreset: row.date_preset,
    customStart: row.custom_start ?? undefined,
    customEnd: row.custom_end ?? undefined,
    linesChartsUnified: row.lines_charts_unified,
    wordsChartsUnified: row.words_charts_unified,
    linesMetricSeries: row.lines_metric_series ?? undefined,
    wordsMetricSeries: row.words_metric_series ?? undefined,
    chartCellSize: row.chart_cell_size ?? undefined,
    chartHeight: row.chart_height ?? undefined,
    chartWidth: row.chart_width ?? undefined,
    graphOrder: row.graph_order ?? undefined,
    graphVisible: row.graph_visible ?? undefined,
  } as Partial<AnalyticsPreferences>);
}

export async function getAnalyticsPreferences(
  userId: string,
): Promise<AnalyticsPreferences> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("analytics_preferences")
    .select(
      "theme, date_preset, custom_start, custom_end, lines_charts_unified, words_charts_unified, lines_metric_series, words_metric_series, chart_height, chart_width, chart_cell_size, graph_order, graph_visible",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load analytics preferences:", error.message);
    return defaultAnalyticsPreferences();
  }

  if (!data) {
    return defaultAnalyticsPreferences();
  }

  return rowToPreferences(data as AnalyticsPreferencesRow);
}

export async function upsertAnalyticsPreferences(
  userId: string,
  preferences: AnalyticsPreferences,
): Promise<{ ok: boolean; error?: string }> {
  const normalized = normalizeAnalyticsPreferences(preferences);
  const { width, height } = chartDimensionsFromCellSize(normalized.chartCellSize);
  const supabase = await createClient();

  const { error } = await supabase.from("analytics_preferences").upsert(
    {
      user_id: userId,
      theme: normalized.theme,
      date_preset: normalized.datePreset,
      custom_start:
        normalized.datePreset === "custom" ? normalized.customStart : null,
      custom_end:
        normalized.datePreset === "custom" ? normalized.customEnd : null,
      lines_charts_unified: normalized.linesChartsUnified,
      words_charts_unified: normalized.wordsChartsUnified,
      lines_metric_series: normalized.linesMetricSeries,
      words_metric_series: normalized.wordsMetricSeries,
      chart_cell_size: normalized.chartCellSize,
      chart_height: height,
      chart_width: width,
      graph_order: normalized.graphOrder,
      graph_visible: normalized.graphVisible,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}