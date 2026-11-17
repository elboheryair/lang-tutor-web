"use client";

import {
  fetchAnalyticsBounds,
  fetchAnalyticsSeries,
  saveAnalyticsPreferences,
} from "@/app/(authenticated)/analytics/actions";
import { AnalyticsGraphsLayout } from "@/components/analytics/analytics-graphs-layout";
import { DateRangeControl } from "@/components/analytics/date-range-control";
import { GraphVisibilityControl } from "@/components/analytics/graph-visibility-control";
import type { AnalyticsGraphId } from "@/lib/analytics/graph-panels";
import { normalizeGraphVisibility } from "@/lib/analytics/graph-panels";
import { localActivityDate } from "@/lib/analytics/activity-date";
import { analyticsUiClasses } from "@/lib/analytics/analytics-ui";
import {
  hasAnyActivity,
  presetToRange,
  type DateRangePreset,
} from "@/lib/analytics/date-range";
import {
  clampChartCellSize,
  normalizeAnalyticsPreferences,
  writeAnalyticsPreferencesToStorage,
  type AnalyticsPreferences,
} from "@/lib/analytics/preferences";
import type { DailyReadingMetrics } from "@/lib/analytics/types";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type AnalyticsPageViewProps = {
  languageName: string;
  languageFlag: string;
  initialPreferences: AnalyticsPreferences;
};

export function AnalyticsPageView({
  languageName,
  languageFlag,
  initialPreferences,
}: AnalyticsPageViewProps) {
  const normalizedInitial = useMemo(
    () => normalizeAnalyticsPreferences(initialPreferences),
    [initialPreferences],
  );

  const [preferences, setPreferences] =
    useState<AnalyticsPreferences>(normalizedInitial);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefsBootstrappedRef = useRef(false);

  useEffect(() => {
    writeAnalyticsPreferencesToStorage(normalizedInitial);
  }, [normalizedInitial]);

  const [earliestDate, setEarliestDate] = useState<string | null>(null);
  const [series, setSeries] = useState<DailyReadingMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ui = useMemo(
    () => analyticsUiClasses(preferences.theme),
    [preferences.theme],
  );

  useEffect(() => {
    void fetchAnalyticsBounds().then((bounds) => {
      setEarliestDate(bounds.earliestDate);
    });
  }, []);

  const loadSeries = useCallback(async () => {
    setLoading(true);
    setError(null);

    const range = presetToRange(
      preferences.datePreset,
      earliestDate,
      {
        start: preferences.customStart,
        end: preferences.customEnd,
      },
    );

    try {
      const result = await fetchAnalyticsSeries(range);
      setSeries(result.series);
    } catch {
      setError("Could not load analytics. Try again.");
      setSeries([]);
    }
    setLoading(false);
  }, [
    preferences.datePreset,
    preferences.customStart,
    preferences.customEnd,
    earliestDate,
  ]);

  useEffect(() => {
    void loadSeries();
  }, [loadSeries]);

  useEffect(() => {
    if (!prefsBootstrappedRef.current) {
      prefsBootstrappedRef.current = true;
      return;
    }

    writeAnalyticsPreferencesToStorage(preferences);

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void saveAnalyticsPreferences(preferences);
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [preferences]);

  const updatePreferences = useCallback(
    (patch: Partial<AnalyticsPreferences>) => {
      setPreferences((current) =>
        normalizeAnalyticsPreferences({ ...current, ...patch }),
      );
    },
    [],
  );

  const toggleTheme = useCallback(() => {
    setPreferences((current) =>
      normalizeAnalyticsPreferences({
        ...current,
        theme: current.theme === "dark" ? "light" : "dark",
      }),
    );
  }, []);

  const setPreset = useCallback(
    (datePreset: DateRangePreset) => updatePreferences({ datePreset }),
    [updatePreferences],
  );

  const setChartCellSize = useCallback(
    (chartCellSize: number) =>
      updatePreferences({ chartCellSize: clampChartCellSize(chartCellSize) }),
    [updatePreferences],
  );

  const toggleGraphVisibility = useCallback(
    (graphId: AnalyticsGraphId, visible: boolean) => {
      setPreferences((current) =>
        normalizeAnalyticsPreferences({
          ...current,
          graphVisible: normalizeGraphVisibility({
            ...current.graphVisible,
            [graphId]: visible,
          }),
        }),
      );
    },
    [],
  );

  const empty = !loading && !hasAnyActivity(series);
  const today = localActivityDate();

  return (
    <div className={ui.shell}>
      <header>
        <p
          className={`text-sm font-semibold uppercase tracking-[0.2em] ${ui.eyebrow}`}
        >
          Analytics
        </p>
        <div className="mt-3">
          <h1 className={`text-3xl font-semibold tracking-tight ${ui.title}`}>
            Progress & practice
          </h1>
          <p className={`mt-2 max-w-2xl ${ui.subtitle}`}>
            Track daily reading, recordings, practice time, and completed
            sessions.
          </p>
        </div>
      </header>

      <div className="mt-10 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${ui.chip}`}
            >
              <span aria-hidden>{languageFlag}</span>
              {languageName}
            </p>
            <p className={`mt-3 text-sm ${ui.muted}`}>
              Metrics below apply only to this learning language.
            </p>
          </div>
          <Link
            href="/learn/source"
            className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${ui.primaryButton}`}
          >
            Back to sources
          </Link>
        </div>

        <DateRangeControl
          ui={ui}
          theme={preferences.theme}
          onThemeToggle={toggleTheme}
          preset={preferences.datePreset}
          customStart={preferences.customStart || today}
          customEnd={preferences.customEnd || today}
          onPresetChange={setPreset}
          onCustomStartChange={(customStart) => updatePreferences({ customStart })}
          onCustomEndChange={(customEnd) => updatePreferences({ customEnd })}
          chartCellSize={preferences.chartCellSize}
          onChartCellSizeChange={setChartCellSize}
        />

        <GraphVisibilityControl
          ui={ui}
          theme={preferences.theme}
          graphVisible={preferences.graphVisible}
          onToggle={toggleGraphVisibility}
        />

        {error ? (
          <p className={`rounded-xl border px-4 py-3 text-sm ${ui.error}`} role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className={`text-sm ${ui.muted}`}>Loading charts…</p>
        ) : (
          <>
            {empty ? (
              <div
                className={`rounded-2xl border border-dashed px-6 py-10 text-center ${ui.dashedEmpty}`}
              >
                <p className="text-lg font-medium">No activity in this range</p>
                <p className={`mx-auto mt-2 max-w-md text-sm ${ui.muted}`}>
                  Start a reading session or finish a document to see your
                  progress here. Charts will show zero baselines until data is
                  available.
                </p>
                <Link
                  href="/learn/source"
                  className={`mt-5 inline-flex rounded-lg px-4 py-2 text-sm font-medium transition ${ui.ghostButton}`}
                >
                  Open sources
                </Link>
              </div>
            ) : null}

            <AnalyticsGraphsLayout
              series={series}
              ui={ui}
              theme={preferences.theme}
              preferences={preferences}
              onPreferencesChange={updatePreferences}
            />
          </>
        )}
      </div>
    </div>
  );
}