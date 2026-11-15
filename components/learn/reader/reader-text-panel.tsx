import type { DisplayMode, HighlightOptions } from "@/lib/reader/types";
import { type CSSProperties, useEffect, useRef } from "react";

type ReaderTextPanelProps = {
  lines: string[];
  currentLineIndex: number;
  displayMode: DisplayMode;
  highlightOptions: HighlightOptions;
  fontSize: number;
  themeClasses: {
    panel: string;
    text: string;
    current: string;
    dull: string;
  };
  obscured?: boolean;
};

function lineClass(
  index: number,
  currentLineIndex: number,
  highlightOptions: HighlightOptions,
  themeClasses: ReaderTextPanelProps["themeClasses"],
): string {
  const isCurrent = index === currentLineIndex;
  const classes = [themeClasses.text];

  if (!isCurrent && highlightOptions.dullRest) {
    classes.push(themeClasses.dull);
  }

  if (isCurrent) {
    if (highlightOptions.highlightCurrent) {
      classes.push(themeClasses.current, "rounded-lg", "px-2", "py-1");
    }
    if (highlightOptions.boldCurrent) {
      classes.push("font-bold");
    }
  }

  return classes.join(" ");
}

/** Direct filter blur on glyphs — unreadable but color and layout remain. */
const OBSCURED_TEXT_FILTER = "blur(4px)";

export function ReaderTextPanel({
  lines,
  currentLineIndex,
  displayMode,
  highlightOptions,
  fontSize,
  themeClasses,
  obscured = false,
}: ReaderTextPanelProps) {
  const currentRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (obscured) return;
    const el = currentRef.current;
    const scroll = scrollRef.current;
    if (!el || !scroll) return;
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentLineIndex, obscured]);

  const shellClass = `relative h-full w-full overflow-hidden rounded-2xl border ${themeClasses.panel}`;

  const textLayerStyle: CSSProperties = {
    fontSize: `${fontSize}px`,
    lineHeight: 1.65,
    ...(obscured
      ? {
          filter: OBSCURED_TEXT_FILTER,
          WebkitFilter: OBSCURED_TEXT_FILTER,
        }
      : {}),
  };

  if (lines.length === 0) {
    return (
      <div className={shellClass}>
        <div
          className={`flex h-full w-full items-center justify-center p-6 ${
            obscured ? "pointer-events-none select-none" : ""
          }`}
          style={
            obscured
              ? { filter: OBSCURED_TEXT_FILTER, WebkitFilter: OBSCURED_TEXT_FILTER }
              : undefined
          }
        >
          <p className={themeClasses.text}>No text in this document.</p>
        </div>
        {obscured && (
          <div
            aria-hidden
            className="pointer-events-auto absolute inset-0 z-10 rounded-2xl bg-transparent"
          />
        )}
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <div
        ref={scrollRef}
        className={`h-full w-full overflow-x-hidden overflow-y-auto p-5 sm:p-6 ${
          obscured ? "pointer-events-none select-none" : ""
        }`}
        style={textLayerStyle}
      >
        {displayMode === "full" ? (
          <>
            {lines.map((line, index) => (
              <p
                key={`${index}-${line.slice(0, 24)}`}
                ref={index === currentLineIndex ? currentRef : undefined}
                className={`mb-3 last:mb-0 ${lineClass(index, currentLineIndex, highlightOptions, themeClasses)}`}
              >
                {line}
              </p>
            ))}
          </>
        ) : (
          <>
            {lines.map((line, index) => (
              <p
                key={`${index}-${line.slice(0, 24)}`}
                ref={index === currentLineIndex ? currentRef : undefined}
                className={`border-b border-current/10 py-3 last:border-b-0 ${lineClass(index, currentLineIndex, highlightOptions, themeClasses)}`}
              >
                <span className="mr-2 text-xs opacity-50 tabular-nums">
                  {index + 1}
                </span>
                {line}
              </p>
            ))}
          </>
        )}
      </div>
      {obscured && (
        <div
          aria-hidden
          className="pointer-events-auto absolute inset-0 z-10 rounded-2xl bg-transparent"
        />
      )}
    </div>
  );
}