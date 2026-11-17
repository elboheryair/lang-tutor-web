export function splitContentIntoLines(content: string): string[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  const byNewline = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (byNewline.length > 1) {
    return byNewline;
  }

  return trimmed
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Words in lines strictly before `currentLineIndex` over total words in the file. */
export function wordProgressPercent(
  lines: string[],
  currentLineIndex: number,
): number {
  const totalWords = lines.reduce((sum, line) => sum + countWords(line), 0);
  if (totalWords === 0) return 0;

  const safeIndex = Math.min(
    Math.max(0, Math.floor(currentLineIndex)),
    lines.length - 1,
  );
  const readWords = lines
    .slice(0, safeIndex)
    .reduce((sum, line) => sum + countWords(line), 0);

  return Math.min(100, Math.round((readWords / totalWords) * 100));
}

export function lineIndexFromProgress(
  progressPercent: number,
  lineCount: number,
): number {
  if (lineCount <= 1) return 0;
  return Math.round((progressPercent / 100) * (lineCount - 1));
}

/** Line index whose position-based progress best matches a saved percentage. */
export function lineIndexFromWordProgress(
  progressPercent: number,
  lines: string[],
): number {
  if (lines.length === 0) return 0;

  const target = Math.min(100, Math.max(0, Math.round(progressPercent)));
  let bestIndex = 0;

  for (let index = 0; index < lines.length; index++) {
    const atIndex = wordProgressPercent(lines, index);
    if (atIndex <= target) bestIndex = index;
    if (atIndex >= target) return index;
  }

  return bestIndex;
}

export function totalWordsInLines(lines: string[]): number {
  return lines.reduce((sum, line) => sum + countWords(line), 0);
}

export function uniqueWordsRecorded(
  lines: string[],
  recordedLineIndices: ReadonlySet<number>,
): number {
  let sum = 0;
  for (const index of recordedLineIndices) {
    const line = lines[index];
    if (line) sum += countWords(line);
  }
  return sum;
}