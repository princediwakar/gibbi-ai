import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const extractIdFromSlug = (slug: string) => {
    const parts = slug.split("_");
    const id = parts.pop();
    return id && id !== "undefined" ? id : null;
};

export function computeStreak(questionResults: { answered_at: string }[]): number {
  if (questionResults.length === 0) return 0;

  const activityDays = new Set(
    questionResults.map((r) => new Date(r.answered_at).toISOString().split("T")[0])
  );
  const sorted = [...activityDays].sort().reverse();

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = (prev.getTime() - curr.getTime()) / 86400000;
    if (Math.abs(diffDays - 1) < 0.01) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
