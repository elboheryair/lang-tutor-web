import type { UserDocument } from "@/lib/user-documents";
import type { StoredCompletionReport } from "@/lib/reader/completion-report";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function completionCountedActivityDate(
  document: Pick<UserDocument, "last_position" | "completion_report" | "updated_at">,
): string | null {
  if (document.last_position < 100 || document.completion_report == null) {
    return null;
  }

  const report = document.completion_report;
  if (
    report.analyticsCompletionDate &&
    ISO_DATE.test(report.analyticsCompletionDate)
  ) {
    return report.analyticsCompletionDate;
  }

  return document.updated_at.slice(0, 10);
}

/** Session already saved at 100% with a completion report (counted or backfilled). */
export function reportCountsAsCompletedInAnalytics(
  report: StoredCompletionReport | null,
  lastPosition: number,
): boolean {
  return report != null && lastPosition >= 100;
}