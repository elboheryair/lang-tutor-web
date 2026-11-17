"use client";

import type { AnalyticsTheme } from "@/lib/analytics/preferences";

type AnalyticsThemeToggleProps = {
  theme: AnalyticsTheme;
  onToggle: () => void;
};

function SunIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 1 0 11.5 11z" />
    </svg>
  );
}

export function AnalyticsThemeToggle({
  theme,
  onToggle,
}: AnalyticsThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition ${
        isDark
          ? "border-white/15 text-zinc-300 hover:bg-white/10"
          : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
      }`}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      <span className="hidden sm:inline">{isDark ? "Day" : "Night"}</span>
    </button>
  );
}