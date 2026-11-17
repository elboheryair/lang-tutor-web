import { countWords } from "@/lib/reader/text";

export type SessionSyncSnapshot = {
  maxLineIndex: number;
  recordedLineIndices: ReadonlySet<number>;
  sessionSeconds: number;
};

export type SessionActivityDelta = {
  linesRead: number;
  linesRecorded: number;
  wordsRead: number;
  wordsRecorded: number;
  practiceSeconds: number;
};

export function emptySessionSyncSnapshot(): SessionSyncSnapshot {
  return {
    maxLineIndex: -1,
    recordedLineIndices: new Set(),
    sessionSeconds: 0,
  };
}

function wordsForLine(lines: string[], lineIndex: number): number {
  const line = lines[lineIndex];
  if (!line) return 0;
  return countWords(line);
}

export function computeSessionActivityDelta(
  lines: string[],
  previous: SessionSyncSnapshot,
  current: SessionSyncSnapshot,
): SessionActivityDelta {
  const linesRead =
    current.maxLineIndex > previous.maxLineIndex
      ? current.maxLineIndex - previous.maxLineIndex
      : 0;

  let wordsRead = 0;
  if (current.maxLineIndex > previous.maxLineIndex) {
    for (
      let index = previous.maxLineIndex + 1;
      index <= current.maxLineIndex;
      index++
    ) {
      wordsRead += wordsForLine(lines, index - 1);
    }
  }

  const newlyRecorded: number[] = [];
  for (const index of current.recordedLineIndices) {
    if (!previous.recordedLineIndices.has(index)) {
      newlyRecorded.push(index);
    }
  }

  let wordsRecorded = 0;
  for (const index of newlyRecorded) {
    wordsRecorded += wordsForLine(lines, index);
  }

  const practiceSeconds = Math.max(
    0,
    current.sessionSeconds - previous.sessionSeconds,
  );

  return {
    linesRead,
    linesRecorded: newlyRecorded.length,
    wordsRead,
    wordsRecorded,
    practiceSeconds,
  };
}