import type { AnalyticsTheme } from "@/lib/analytics/preferences";

export type ChartThemeTokens = {
  gridStroke: string;
  axisStroke: string;
  tickFill: string;
  tooltip: {
    backgroundColor: string;
    border: string;
    color: string;
  };
  practiceGradientTop: string;
  practiceGradientBottom: string;
  practiceStroke: string;
  sessionBar: string;
};

export function getChartTheme(theme: AnalyticsTheme): ChartThemeTokens {
  if (theme === "light") {
    return {
      gridStroke: "rgba(24, 24, 27, 0.08)",
      axisStroke: "#71717a",
      tickFill: "#52525b",
      tooltip: {
        backgroundColor: "#ffffff",
        border: "1px solid rgba(24, 24, 27, 0.12)",
        color: "#18181b",
      },
      practiceGradientTop: "#6366f1",
      practiceGradientBottom: "#6366f1",
      practiceStroke: "#4f46e5",
      sessionBar: "#8b5cf6",
    };
  }

  return {
    gridStroke: "rgba(255,255,255,0.08)",
    axisStroke: "#a1a1aa",
    tickFill: "#a1a1aa",
    tooltip: {
      backgroundColor: "#18181b",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#fafafa",
    },
    practiceGradientTop: "#6366f1",
    practiceGradientBottom: "#6366f1",
    practiceStroke: "#818cf8",
    sessionBar: "#a78bfa",
  };
}