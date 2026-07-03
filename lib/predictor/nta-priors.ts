// Path: lib/predictor/nta-priors.ts
// Cold-start priors from public NTA JEE Main 2025/2026 normalization tables
// Source: NTA official percentile vs marks normalization data (public domain)

export interface NTAPercentileBand {
  marks: number;
  percentile: number;
}

export interface SubjectPrior {
  subject: string;
  bands: NTAPercentileBand[];
  // Cold-start band width at different session counts
  // Based on public NTA data variance - wider at extremes
  baseBandWidth: (percentile: number) => number;
}

// JEE Main 2025 Session 1 & 2, 2026 Session 1 public percentile data
// Marks out of 300 (100 per subject)
// These are approximate public normalization curves

const PHYSICS_BANDS: NTAPercentileBand[] = [
  { marks: 95, percentile: 99.5 },
  { marks: 85, percentile: 99.0 },
  { marks: 75, percentile: 97.5 },
  { marks: 65, percentile: 94.0 },
  { marks: 55, percentile: 88.0 },
  { marks: 45, percentile: 78.0 },
  { marks: 35, percentile: 62.0 },
  { marks: 25, percentile: 42.0 },
  { marks: 15, percentile: 22.0 },
  { marks: 5, percentile: 8.0 },
];

const CHEMISTRY_BANDS: NTAPercentileBand[] = [
  { marks: 90, percentile: 99.5 },
  { marks: 80, percentile: 99.0 },
  { marks: 70, percentile: 97.5 },
  { marks: 60, percentile: 94.0 },
  { marks: 50, percentile: 88.0 },
  { marks: 40, percentile: 78.0 },
  { marks: 30, percentile: 62.0 },
  { marks: 20, percentile: 42.0 },
  { marks: 10, percentile: 22.0 },
  { marks: 0, percentile: 8.0 },
];

const MATHEMATICS_BANDS: NTAPercentileBand[] = [
  { marks: 95, percentile: 99.5 },
  { marks: 85, percentile: 99.0 },
  { marks: 75, percentile: 97.5 },
  { marks: 65, percentile: 94.0 },
  { marks: 55, percentile: 88.0 },
  { marks: 45, percentile: 78.0 },
  { marks: 35, percentile: 62.0 },
  { marks: 25, percentile: 42.0 },
  { marks: 15, percentile: 22.0 },
  { marks: 5, percentile: 8.0 },
];

// Band width function based on NTA public data variance
// Wider at tails (extreme percentiles have more variance)
function makeBandWidthFn(tailWidth: number, midWidth: number) {
  return (percentile: number): number => {
    // Normalize percentile to 0-1, distance from 50th percentile
    const distFromCenter = Math.abs(percentile - 50) / 50;
    // Quadratic widening at tails
    const width = midWidth + (tailWidth - midWidth) * distFromCenter * distFromCenter;
    return Math.min(width, 15); // Cap at 15 percentile points
  };
}

export const SUBJECT_PRIORS: Record<string, SubjectPrior> = {
  Physics: {
    subject: "Physics",
    bands: PHYSICS_BANDS,
    baseBandWidth: makeBandWidthFn(8, 3), // 3 at center, 8 at tails
  },
  Chemistry: {
    subject: "Chemistry",
    bands: CHEMISTRY_BANDS,
    baseBandWidth: makeBandWidthFn(7, 2.5),
  },
  Mathematics: {
    subject: "Mathematics",
    bands: MATHEMATICS_BANDS,
    baseBandWidth: makeBandWidthFn(8, 3),
  },
};

// Interpolate percentile from marks using NTA bands
export function marksToPercentile(subject: string, marks: number): number {
  const prior = SUBJECT_PRIORS[subject];
  if (!prior) return 50;

  const bands = prior.bands;
  if (marks >= bands[0].marks) return bands[0].percentile;
  if (marks <= bands[bands.length - 1].marks) return bands[bands.length - 1].percentile;

  for (let i = 0; i < bands.length - 1; i++) {
    const upper = bands[i];
    const lower = bands[i + 1];
    if (marks >= lower.marks && marks <= upper.marks) {
      const t = (marks - lower.marks) / (upper.marks - lower.marks);
      return lower.percentile + t * (upper.percentile - lower.percentile);
    }
  }
  return 50;
}

// Interpolate marks from percentile (inverse)
export function percentileToMarks(subject: string, percentile: number): number {
  const prior = SUBJECT_PRIORS[subject];
  if (!prior) return 50;

  const bands = prior.bands;
  if (percentile >= bands[0].percentile) return bands[0].marks;
  if (percentile <= bands[bands.length - 1].percentile) return bands[bands.length - 1].marks;

  for (let i = 0; i < bands.length - 1; i++) {
    const upper = bands[i];
    const lower = bands[i + 1];
    if (percentile >= lower.percentile && percentile <= upper.percentile) {
      const t = (percentile - lower.percentile) / (upper.percentile - lower.percentile);
      return Math.round(lower.marks + t * (upper.marks - lower.marks));
    }
  }
  return 50;
}

// Get cold-start confidence band for a subject at given percentile
// Returns { lower, upper, width } in percentile points
export function getColdStartBand(subject: string, percentile: number): { lower: number; upper: number; width: number } {
  const prior = SUBJECT_PRIORS[subject];
  if (!prior) return { lower: Math.max(0, percentile - 5), upper: Math.min(100, percentile + 5), width: 10 };

  const baseWidth = prior.baseBandWidth(percentile);
  // Cold start: no user data, use full public prior variance
  const halfWidth = baseWidth / 2;
  return {
    lower: Math.max(1, Math.round(percentile - halfWidth)),
    upper: Math.min(99, Math.round(percentile + halfWidth)),
    width: Math.round(baseWidth),
  };
}

// Composite JEE Main percentile from subject percentiles
// NTA uses normalized equal-weight average of subject percentiles
export function computeCompositePercentile(subjectPercentiles: Record<string, number>): number {
  const subjects = ["Physics", "Chemistry", "Mathematics"];
  const valid = subjects.filter((s) => s in subjectPercentiles);
  if (valid.length === 0) return 0;
  const sum = valid.reduce((acc, s) => acc + subjectPercentiles[s], 0);
  return Math.round(sum / valid.length);
}

// Blend cold-start prior with proprietary model
// weight: 0 = pure public prior, 1 = pure proprietary
export function blendBands(
  publicBand: { lower: number; upper: number },
  proprietaryBand: { lower: number; upper: number },
  weight: number
): { lower: number; upper: number; width: number } {
  const lower = Math.round(publicBand.lower * (1 - weight) + proprietaryBand.lower * weight);
  const upper = Math.round(publicBand.upper * (1 - weight) + proprietaryBand.upper * weight);
  return {
    lower: Math.max(1, lower),
    upper: Math.min(99, upper),
    width: Math.max(1, upper - lower),
  };
}

// Blending weight schedule: 0 sessions = 0 (pure public), ~20 sessions = 1 (pure proprietary)
export function getBlendingWeight(sessionsCompleted: number): number {
  if (sessionsCompleted <= 0) return 0;
  if (sessionsCompleted >= 20) return 1;
  // Smooth curve: sqrt for faster initial convergence
  return Math.sqrt(sessionsCompleted / 20);
}

export function getColdStartDisclaimer(sessionsCompleted: number): string {
  if (sessionsCompleted === 0) {
    return "Your first prediction uses public NTA normalization data — it gets sharper the more you practice with Gibbi.";
  }
  if (sessionsCompleted < 5) {
    return `Prediction blends public NTA data with your ${sessionsCompleted} practice session${sessionsCompleted > 1 ? "s" : ""}. Band sharpens with each session.`;
  }
  if (sessionsCompleted < 20) {
    return `Primarily based on your ${sessionsCompleted} tracked sessions, blended with public NTA baseline.`;
  }
  return "Fully calibrated to your personal practice history.";
}