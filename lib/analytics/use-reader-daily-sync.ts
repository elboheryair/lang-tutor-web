"use client";

import { recordReadingActivity } from "@/app/(authenticated)/analytics/actions";
import { localActivityDate } from "@/lib/analytics/activity-date";
import {
  computeSessionActivityDelta,
  emptySessionSyncSnapshot,
  type SessionSyncSnapshot,
} from "@/lib/analytics/session-deltas";
import { useCallback, useEffect, useRef } from "react";

const SYNC_INTERVAL_MS = 30_000;

type UseReaderDailySyncOptions = {
  documentId: string;
  languageCode: string;
  lines: string[];
  currentLineIndex: number;
  uniqueRecordedLines: ReadonlySet<number>;
  sessionSeconds: number;
  enabled: boolean;
};

export function useReaderDailySync({
  documentId,
  languageCode,
  lines,
  currentLineIndex,
  uniqueRecordedLines,
  sessionSeconds,
  enabled,
}: UseReaderDailySyncOptions) {
  const snapshotRef = useRef<SessionSyncSnapshot>(emptySessionSyncSnapshot());
  const syncingRef = useRef(false);

  const flush = useCallback(async () => {
    if (!enabled || lines.length === 0 || syncingRef.current) {
      return;
    }

    const previous = snapshotRef.current;
    const current: SessionSyncSnapshot = {
      maxLineIndex: currentLineIndex,
      recordedLineIndices: new Set(uniqueRecordedLines),
      sessionSeconds,
    };

    const delta = computeSessionActivityDelta(lines, previous, current);
    if (
      delta.linesRead <= 0 &&
      delta.linesRecorded <= 0 &&
      delta.wordsRead <= 0 &&
      delta.wordsRecorded <= 0 &&
      delta.practiceSeconds <= 0
    ) {
      return;
    }

    syncingRef.current = true;
    try {
      await recordReadingActivity(languageCode, {
        activityDate: localActivityDate(),
        ...delta,
        completedSessions: 0,
      });
      snapshotRef.current = current;
    } finally {
      syncingRef.current = false;
    }
  }, [
    enabled,
    lines,
    currentLineIndex,
    uniqueRecordedLines,
    sessionSeconds,
    languageCode,
  ]);

  useEffect(() => {
    if (!enabled) return;
    snapshotRef.current = {
      maxLineIndex: currentLineIndex,
      recordedLineIndices: new Set(uniqueRecordedLines),
      sessionSeconds,
    };
    // Baseline only when the document or source text changes.
  }, [enabled, documentId, languageCode, lines]);

  useEffect(() => {
    if (!enabled) return;

    const id = window.setInterval(() => {
      void flush();
    }, SYNC_INTERVAL_MS);

    const onHide = () => {
      if (document.visibilityState === "hidden") {
        void flush();
      }
    };

    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      void flush();
    };
  }, [enabled, flush]);

  return { flush };
}