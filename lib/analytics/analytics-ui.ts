import type { AnalyticsTheme } from "@/lib/analytics/preferences";

export type AnalyticsUiClasses = {
  shell: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  muted: string;
  chip: string;
  primaryButton: string;
  ghostButton: string;
  card: string;
  cardTitle: string;
  dashedEmpty: string;
  error: string;
  dateGroup: string;
  dateButtonActive: string;
  dateButtonIdle: string;
  dateLabel: string;
  dateInput: string;
  chartToggle: string;
  readAccent: string;
  recordedAccent: string;
};

export function analyticsUiClasses(theme: AnalyticsTheme): AnalyticsUiClasses {
  if (theme === "light") {
    return {
      shell: "rounded-3xl border border-zinc-200/80 bg-zinc-50 px-1 py-2 text-zinc-900 shadow-sm shadow-zinc-200/60 sm:px-2",
      eyebrow: "text-indigo-600",
      title: "text-zinc-900",
      subtitle: "text-zinc-600",
      muted: "text-zinc-500",
      chip: "bg-indigo-100 text-indigo-800",
      primaryButton:
        "border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
      ghostButton: "bg-indigo-600 text-white hover:bg-indigo-500",
      card: "border-zinc-200 bg-white shadow-sm shadow-zinc-200/50",
      cardTitle: "text-zinc-900",
      dashedEmpty: "border-zinc-300 bg-white text-zinc-700",
      error: "border-red-200 bg-red-50 text-red-700",
      dateGroup: "border-zinc-200 bg-white",
      dateButtonActive: "bg-indigo-100 text-indigo-800",
      dateButtonIdle: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
      dateLabel: "text-zinc-500",
      dateInput: "border-zinc-300 bg-white text-zinc-900",
      chartToggle: "border-zinc-300 text-zinc-700 hover:bg-zinc-100",
      readAccent: "text-blue-600",
      recordedAccent: "text-emerald-600",
    };
  }

  return {
    shell: "",
    eyebrow: "text-indigo-300",
    title: "text-white",
    subtitle: "text-zinc-400",
    muted: "text-zinc-400",
    chip: "bg-indigo-500/15 text-indigo-100",
    primaryButton:
      "border border-white/15 bg-white/5 text-white hover:bg-white/10",
    ghostButton: "bg-indigo-500 text-white hover:bg-indigo-400",
    card: "border-white/10 bg-white/5",
    cardTitle: "text-white",
    dashedEmpty: "border-white/15 bg-white/[0.02] text-white",
    error: "border-red-500/30 bg-red-500/10 text-red-200",
    dateGroup: "border-white/10 bg-white/5",
    dateButtonActive: "bg-indigo-500/30 text-indigo-100",
    dateButtonIdle: "text-zinc-300 hover:bg-white/10 hover:text-white",
    dateLabel: "text-zinc-400",
    dateInput: "border-white/15 bg-zinc-900 text-white",
    chartToggle: "border-white/15 text-zinc-200 hover:bg-white/10",
    readAccent: "text-blue-300",
    recordedAccent: "text-emerald-300",
  };
}