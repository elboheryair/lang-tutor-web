import type { SessionRecordingStats } from "@/lib/reader/recording-stats";
import { formatSessionTime } from "@/lib/reader/time";

type SessionCompletionSummaryProps = {
  stats: SessionRecordingStats;
  className?: string;
};

export function SessionCompletionSummary({
  stats,
  className = "",
}: SessionCompletionSummaryProps) {
  return (
    <dl
      className={`space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm ${className}`}
    >
      <div className="flex justify-between gap-4">
        <dt className="text-zinc-400">Lines recorded (unique)</dt>
        <dd className="tabular-nums font-medium text-white">
          {stats.uniqueLinesRecorded} / {stats.totalLines}
        </dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-zinc-400">Words recorded (unique)</dt>
        <dd className="tabular-nums font-medium text-white">
          {stats.uniqueWordsRecorded} / {stats.totalWords}
        </dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-zinc-400">Time in session</dt>
        <dd className="tabular-nums font-medium text-white">
          {formatSessionTime(stats.sessionSeconds)}
        </dd>
      </div>
    </dl>
  );
}