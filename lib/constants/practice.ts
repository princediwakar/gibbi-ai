// Path: lib/constants/practice.ts

export const EXAM_DATES: Record<string, string> = {
  "JEE Main": "2026-04-15",
  "NEET": "2026-05-07",
  "UPSC CSE": "2026-05-28",
  "GMAT Focus": "2026-12-31",
  "SAT": "2026-12-31",
  "GRE": "2026-12-31",
  "CAT": "2026-11-29",
  "GATE": "2026-02-15",
  "CLAT": "2026-12-15",
  "CA Foundation": "2026-06-15",
};

export function getDaysUntilExam(examName: string): number | null {
  const dateStr = EXAM_DATES[examName];
  if (!dateStr) return null;
  const examDate = new Date(dateStr);
  const now = new Date();
  const diff = examDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getExamDateDisplay(examName: string): string | null {
  const dateStr = EXAM_DATES[examName];
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
