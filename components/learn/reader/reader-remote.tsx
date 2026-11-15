import { READER_SHORTCUTS } from "@/lib/reader/shortcuts";
import { ShortcutTooltip } from "@/components/learn/reader/shortcut-tooltip";

type ReaderRemoteProps = {
  onPrevious: () => void;
  onRecord: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
};

export function ReaderRemote({
  onPrevious,
  onRecord,
  onNext,
  canGoPrevious,
  canGoNext,
}: ReaderRemoteProps) {
  return (
    <div className="flex justify-center" aria-label="Line navigation">
      <div className="relative flex items-center justify-center gap-0">
        <ShortcutTooltip
          label="Previous line"
          shortcut={READER_SHORTCUTS.previousLine}
        >
          <button
            type="button"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            aria-label="Previous line"
            className="relative z-10 flex h-14 w-14 -translate-y-1 items-center justify-center rounded-full border-2 border-indigo-400/40 bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-500 disabled:opacity-40 sm:h-16 sm:w-16"
          >
            ‹
          </button>
        </ShortcutTooltip>
        <ShortcutTooltip label="Record" shortcut={READER_SHORTCUTS.record}>
          <button
            type="button"
            onClick={onRecord}
            aria-label="Record repetition"
            className="relative z-20 -mx-3 flex h-16 w-16 items-center justify-center rounded-full border-4 border-zinc-950 bg-rose-500 text-xs font-bold uppercase tracking-wide text-white shadow-xl ring-4 ring-rose-500/30 transition hover:bg-rose-400 sm:h-[4.5rem] sm:w-[4.5rem]"
          >
            Rec
          </button>
        </ShortcutTooltip>
        <ShortcutTooltip label="Next line" shortcut={READER_SHORTCUTS.nextLine}>
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            aria-label="Next line"
            className="relative z-10 flex h-14 w-14 -translate-y-1 items-center justify-center rounded-full border-2 border-indigo-400/40 bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-500 disabled:opacity-40 sm:h-16 sm:w-16"
          >
            ›
          </button>
        </ShortcutTooltip>
      </div>
      <p className="sr-only">Previous line, record, next line</p>
    </div>
  );
}