import {
  totalRecordingAttempts,
  totalWordsInLines,
  uniqueWordsRecorded,
} from "@/lib/reader/text";

export type SessionRecordingStats = {
  uniqueLinesRecorded: number;
  totalLines: number;
  uniqueWordsRecorded: number;
  totalWords: number;
  totalPracticeRecordings: number;
  sessionSeconds: number;
};

export function buildSessionRecordingStats(
  lines: string[],
  uniqueRecordedLines: ReadonlySet<number>,
  attemptsByLine: Readonly<Record<number, number>>,
  sessionSeconds: number,
): SessionRecordingStats {
  return {
    uniqueLinesRecorded: uniqueRecordedLines.size,
    totalLines: lines.length,
    uniqueWordsRecorded: uniqueWordsRecorded(lines, uniqueRecordedLines),
    totalWords: totalWordsInLines(lines),
    totalPracticeRecordings: totalRecordingAttempts(attemptsByLine),
    sessionSeconds,
  };
}