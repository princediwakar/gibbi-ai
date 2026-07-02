// Path: lib/constants/tutor.ts

export const TUTOR_ROUTES = {
  SETUP: "/setup",
  SESSION_START: "/session/start",
  SESSION: (sessionId: string) => `/session/${sessionId}`,
  DASHBOARD: "/dashboard",
  API_SESSION_START: "/api/session/start",
  API_SESSION_ANSWER: "/api/session/answer",
  API_SESSION_COMPLETE: "/api/session/complete",
  PUBLIC_SHARE: (token: string) => `/s/${token}`,
} as const;

export const TUTOR_ERRORS = {
  SESSION_NOT_FOUND:
    "We couldn't find this practice session. Start a new session from your dashboard.",
  SESSION_ALREADY_COMPLETED:
    "This session has already been completed. Start a new one to continue practicing.",
  QUESTION_NOT_FOUND:
    "We couldn't find this question in your session. Try refreshing the page.",
  ANSWER_ALREADY_SUBMITTED:
    "You've already submitted an answer for this question. Move on to the next one.",
  UNAUTHORIZED:
    "Sign in to access your practice sessions and track your progress.",
  INVALID_EXAM_PROFILE:
    "Your exam profile is incomplete. Update your settings to start a practice session.",
  RATE_LIMIT_EXCEEDED:
    "You've reached the daily session limit of 10. Come back tomorrow for more practice.",
  AI_GENERATION_FAILED:
    "We had trouble generating your questions. Check your connection and try again.",
} as const;

export const SESSION_INTENTS = {
  SPACED_REVIEW: 'spaced_review',
  ACTIVE_TARGET: 'active_target',
  CUSTOM_MOCK: 'custom_mock',
  DIAGNOSTIC: 'diagnostic',
} as const;

export const TUTOR_CONFIG = {
  DEFAULT_QUESTION_COUNT: Number(process.env.NEXT_PUBLIC_TUTOR_DEFAULT_QUESTION_COUNT) || 10,
  MAX_QUESTION_COUNT: Number(process.env.NEXT_PUBLIC_TUTOR_MAX_QUESTION_COUNT) || 50,
  MIN_QUESTION_COUNT: Number(process.env.NEXT_PUBLIC_TUTOR_MIN_QUESTION_COUNT) || 3,
  DIFFICULTY_DISTRIBUTION: {
    easy: 0.3,
    medium: 0.5,
    hard: 0.2,
  },
  TRIAGE_DIFFICULTY_DISTRIBUTION: {
    easy: 0.1,
    medium: 0.4,
    hard: 0.5,
  },
  NEXT_QUESTION_DELAY_MS: Number(process.env.NEXT_PUBLIC_NEXT_QUESTION_DELAY_MS) || 2000,
  REVEAL_ANSWER_COOLDOWN_MS:
    Number(process.env.NEXT_PUBLIC_REVEAL_ANSWER_COOLDOWN_MS) || 3000,
  MAX_DAILY_SESSIONS: Number(process.env.MAX_DAILY_SESSIONS) || 10,
  MAX_CUSTOM_MOCK_PER_DAY: 2,
  ACTIVE_TARGET_MAX_TOPICS: 3,
  DIAGNOSTIC_QUESTION_COUNT: 5,
  TEMPORAL_THRESHOLDS: {
    foundation: 90,
    acceleration: 30,
  },
  SM2_DEFAULTS: {
    initial_ease_factor: 2.5,
    initial_interval_days: 1,
    min_ease_factor: 1.3,
  },
  MASTERY_PRIORS: {
    weak: 0.25,
    okay: 0.5,
    strong: 0.75,
  },
} as const;

export const PREREQUISITE_WEIGHTS: Record<string, number> = {
  Calculus: 1.5,
  Algebra: 1.3,
  Trigonometry: 1.2,
  'Laws of Motion': 1.3,
  Kinematics: 1.2,
  'Work, Energy and Power': 1.2,
  Thermodynamics: 1.1,
  Electrostatics: 1.1,
  'Modern Physics': 1.0,
  'Atomic Structure': 1.1,
  'Chemical Bonding': 1.1,
  'Coordination Compounds': 0.9,
  'Complex Numbers': 1.0,
};

export const TUTOR_AI_CONFIG = {
  MODEL: process.env.TUTOR_AI_MODEL || "deepseek-v4-flash",
  FEATURES: {
    thinking: { type: "disabled" },
  },
  RESPONSE_FORMAT: { type: "json_object" },
  MAX_TOKENS_PER_QUESTION: 250,
  MAX_TOKENS_BUFFER: 1000,
} as const;
