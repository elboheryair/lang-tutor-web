import { READER_SHORTCUTS } from "@/lib/reader/shortcuts";
import { ShortcutTooltip } from "@/components/learn/reader/shortcut-tooltip";

type ReadingPausedNoticeProps = {
  onContinue: () => void;
  isDark: boolean;
};

export function ReadingPausedNotice({
  onContinue,
  isDark,
}: ReadingPausedNoticeProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-4"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto max-w-sm rounded-2xl border p-5 shadow-xl ${
          isDark
            ? "border-white/15 bg-zinc-900/95"
            : "border-zinc-200 bg-white"
        }`}
      >
        <p
          className={`text-sm font-medium ${
            isDark ? "text-zinc-100" : "text-zinc-900"
          }`}
        >
          Time was paused
        </p>
        <p
          className={`mt-1 text-sm ${
            isDark ? "text-zinc-400" : "text-zinc-600"
          }`}
        >
          The session timer is on hold while you take a break.
        </p>
        <ShortcutTooltip
          label="Continue reading"
          shortcut={READER_SHORTCUTS.pauseResume}
          isDark={isDark}
        >
          <button
            type="button"
            onClick={onContinue}
            className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Continue reading
          </button>
        </ShortcutTooltip>
      </div>
    </div>
  );
}