export type DailyReadingMetrics = {
  date: string;
  linesRead: number;
  linesRecorded: number;
  wordsRead: number;
  wordsRecorded: number;
  practiceSeconds: number;
  completedSessions: number;
};

export type AnalyticsDateRange = {
  start: string;
  end: string;
};

export type ReadingActivityDelta = {
  activityDate: string;
  linesRead: number;
  linesRecorded: number;
  wordsRead: number;
  wordsRecorded: number;
  practiceSeconds: number;
  completedSessions: number;
};