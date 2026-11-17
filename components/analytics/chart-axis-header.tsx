import type { AnalyticsUiClasses } from "@/lib/analytics/analytics-ui";
import { CHART_AXIS_TITLE_OFFSET } from "@/lib/analytics/chart-layout";
import type { ReactNode } from "react";

type ChartAxisHeaderProps = {
  title: string;
  ui: AnalyticsUiClasses;
  yAxisWidth: number;
  dragHandle?: ReactNode;
};

export function ChartAxisTitleRow({
  title,
  ui,
  yAxisWidth,
  dragHandle,
}: ChartAxisHeaderProps) {
  return (
    <div className="flex min-w-0 items-center">
      {dragHandle ? (
        <div
          className="flex shrink-0 items-center justify-end overflow-visible"
          style={{ width: yAxisWidth }}
        >
          <div className="translate-x-3">{dragHandle}</div>
        </div>
      ) : null}
      <h2
        className={`text-lg font-semibold ${ui.cardTitle}`}
        style={
          dragHandle ? { marginLeft: CHART_AXIS_TITLE_OFFSET } : undefined
        }
      >
        {title}
      </h2>
    </div>
  );
}

export function ChartAxisHeader(props: ChartAxisHeaderProps) {
  return (
    <div className="mb-4">
      <ChartAxisTitleRow {...props} />
    </div>
  );
}