export const ANALYTICS_GRAPH_IDS = [
  "lines",
  "words",
  "practice_time",
  "completed_sessions",
] as const;

export type AnalyticsGraphId = (typeof ANALYTICS_GRAPH_IDS)[number];

export const DEFAULT_GRAPH_ORDER: AnalyticsGraphId[] = [...ANALYTICS_GRAPH_IDS];

export const GRAPH_PANEL_LABELS: Record<AnalyticsGraphId, string> = {
  lines: "Line measurements (read vs. recorded)",
  words: "Word measurements (read vs. recorded)",
  practice_time: "Time spent reading",
  completed_sessions: "Completed sessions",
};

export const GRAPH_PANEL_SHORT_LABELS: Record<AnalyticsGraphId, string> = {
  lines: "Lines",
  words: "Words",
  practice_time: "Practice time",
  completed_sessions: "Sessions",
};

export type GraphVisibility = Record<AnalyticsGraphId, boolean>;

export const DEFAULT_GRAPH_VISIBILITY: GraphVisibility = {
  lines: true,
  words: true,
  practice_time: true,
  completed_sessions: true,
};

function isGraphId(value: string): value is AnalyticsGraphId {
  return (ANALYTICS_GRAPH_IDS as readonly string[]).includes(value);
}

export function normalizeGraphOrder(
  order: readonly string[] | null | undefined,
): AnalyticsGraphId[] {
  const seen = new Set<AnalyticsGraphId>();
  const normalized: AnalyticsGraphId[] = [];

  for (const item of order ?? []) {
    if (isGraphId(item) && !seen.has(item)) {
      normalized.push(item);
      seen.add(item);
    }
  }

  for (const id of ANALYTICS_GRAPH_IDS) {
    if (!seen.has(id)) {
      normalized.push(id);
    }
  }

  return normalized;
}

export function normalizeGraphVisibility(
  visibility: Partial<GraphVisibility> | null | undefined,
): GraphVisibility {
  const base = { ...DEFAULT_GRAPH_VISIBILITY };
  if (!visibility) return base;

  for (const id of ANALYTICS_GRAPH_IDS) {
    if (typeof visibility[id] === "boolean") {
      base[id] = visibility[id]!;
    }
  }

  const anyVisible = ANALYTICS_GRAPH_IDS.some((id) => base[id]);
  if (!anyVisible) {
    return { ...DEFAULT_GRAPH_VISIBILITY };
  }

  return base;
}

export function reorderGraphPanels(
  order: readonly AnalyticsGraphId[],
  draggedId: AnalyticsGraphId,
  targetId: AnalyticsGraphId,
): AnalyticsGraphId[] {
  if (draggedId === targetId) {
    return [...order];
  }

  const withoutDragged = order.filter((id) => id !== draggedId);
  const targetIndex = withoutDragged.indexOf(targetId);
  if (targetIndex < 0) {
    return [...order];
  }

  const next = [...withoutDragged];
  next.splice(targetIndex, 0, draggedId);
  return normalizeGraphOrder(next);
}

export function countVisibleGraphs(visibility: GraphVisibility): number {
  return ANALYTICS_GRAPH_IDS.filter((id) => visibility[id]).length;
}