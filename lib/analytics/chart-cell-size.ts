export const ANALYTICS_CELL_SIZE_MIN = 16;
export const ANALYTICS_CELL_SIZE_MAX = 48;
export const ANALYTICS_CELL_SIZE_DEFAULT = 26;

const CHART_WIDTH_MIN = 480;
const CHART_WIDTH_MAX = 1600;

export function clampChartCellSize(value: number): number {
  const rounded = Math.round(value) || ANALYTICS_CELL_SIZE_DEFAULT;
  return Math.min(
    ANALYTICS_CELL_SIZE_MAX,
    Math.max(ANALYTICS_CELL_SIZE_MIN, rounded),
  );
}

function cellSizeInterpolation(size: number): number {
  return (
    (clampChartCellSize(size) - ANALYTICS_CELL_SIZE_MIN) /
    (ANALYTICS_CELL_SIZE_MAX - ANALYTICS_CELL_SIZE_MIN)
  );
}

export function chartDimensionsFromCellSize(cellSize: number): {
  width: number;
  height: number;
} {
  const size = clampChartCellSize(cellSize);
  const height = size * 10;
  const t = cellSizeInterpolation(size);
  const width = Math.round(
    CHART_WIDTH_MIN + t * (CHART_WIDTH_MAX - CHART_WIDTH_MIN),
  );

  return { width, height };
}

function chartCellSizeFromWidth(width: number): number {
  const clampedWidth = Math.min(
    CHART_WIDTH_MAX,
    Math.max(CHART_WIDTH_MIN, Math.round(width)),
  );
  const t = (clampedWidth - CHART_WIDTH_MIN) / (CHART_WIDTH_MAX - CHART_WIDTH_MIN);
  return clampChartCellSize(
    Math.round(
      ANALYTICS_CELL_SIZE_MIN +
        t * (ANALYTICS_CELL_SIZE_MAX - ANALYTICS_CELL_SIZE_MIN),
    ),
  );
}

export function chartCellSizeFromStored(
  cellSize: number | undefined,
  chartHeight: number | undefined,
  chartWidth: number | undefined,
): number {
  if (typeof cellSize === "number" && Number.isFinite(cellSize)) {
    return clampChartCellSize(cellSize);
  }

  let size = ANALYTICS_CELL_SIZE_DEFAULT;

  if (typeof chartHeight === "number" && chartHeight > 0) {
    size = clampChartCellSize(Math.round(chartHeight / 10));
  }

  if (typeof chartWidth === "number" && chartWidth >= CHART_WIDTH_MIN) {
    const sizeFromWidth = chartCellSizeFromWidth(chartWidth);
    size = Math.max(size, sizeFromWidth);
  }

  return size;
}