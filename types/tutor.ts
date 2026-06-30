// Path: types/tutor.ts

export type TimeMode = 'foundation' | 'acceleration' | 'triage';

export type SelfAssessment = 'weak' | 'okay' | 'strong';

export type SessionStatus = 'active' | 'completed' | 'abandoned';

export type CardType = 'session' | 'recovery';

export type DifficultyTier = 1 | 2 | 3;

export type SelectedOption = 'A' | 'B' | 'C' | 'D';

export interface ExamProfile {
  profile_id: string;
  user_id: string;
  exam_name: string;
  target_date: string;
  time_mode: TimeMode;
  is_active: boolean;
  created_at: string;
}

export interface SM2State {
  mastery_score: number;
  total_attempted: number;
  total_correct: number;
  review_interval_days: number;
  review_ease_factor: number;
  next_review_at: string;
  last_seen_at: string;
}

export interface ConceptMastery extends SM2State {
  id: string;
  user_id: string;
  exam_profile_id: string;
  skill_domain: string;
  created_at: string;
}

export interface SessionQuestion {
  question_id: string;
  question_text: string;
  options: Record<string, string>;
  correct_option: string;
  explanation: string;
  distractor_analysis: Record<string, string>;
  skill_domain: string;
  difficulty_tier: DifficultyTier;
  time_estimate_seconds: number;
  misconception: string;
}

export interface TutorSession {
  id: string;
  user_id: string;
  exam_profile_id: string;
  questions_json: SessionQuestion[];
  target_domains: string[];
  status: SessionStatus;
  created_at: string;
  completed_at: string | null;
}

export interface QuestionResult {
  id: string;
  session_id: string;
  question_id: string;
  user_id: string;
  exam_profile_id: string;
  skill_domain: string;
  selected_option: SelectedOption;
  is_correct: boolean;
  was_revealed: boolean;
  time_to_answer_ms: number | null;
  answered_at: string;
}

export interface MasteryHistory {
  id: string;
  user_id: string;
  exam_profile_id: string;
  skill_domain: string;
  mastery_score: number;
  recorded_at: string;
}

export interface MasteryDelta {
  domain: string;
  before: number;
  after: number;
}

export interface ResultCardData {
  exam_name: string;
  score: number;
  total_questions: number;
  score_percent: number;
  primary_domain: string;
  mastery_deltas: MasteryDelta[];
  session_id: string;
}

export interface ResultCard {
  id: string;
  user_id: string;
  card_type: CardType;
  card_data: ResultCardData;
  share_token: string;
  view_count: number;
  created_at: string;
}

export type ExamTaxonomy = {
  _schema_version: number;
  [examName: string]: number | Record<string, string[]>;
};

export type SessionStartInput = {
  exam_profile_id: string;
};

export type SessionStartOutput = {
  session_id: string;
  questions: SessionQuestion[];
  target_domains: string[];
};

export type SessionAnswerInput = {
  session_id: string;
  question_id: string;
  selected_option: SelectedOption;
  is_correct: boolean;
  was_revealed: boolean;
  time_to_answer_ms: number | null;
  skill_domain: string;
  exam_profile_id: string;
};

export type SessionAnswerOutput = {
  accepted: boolean;
  correct_option: string;
  explanation: string;
  distractor_analysis: Record<string, string>;
};

export type SessionCompleteInput = {
  session_id: string;
  exam_profile_id: string;
};

export type SessionCompleteOutput = {
  session_id: string;
  status: SessionStatus;
  mastery_updates: ConceptMastery[];
  share_token: string;
  readiness_index: number;
};

export type DashboardData = {
  readiness_index: number;
  days_remaining: number;
  time_mode: TimeMode;
  active_profile: ExamProfile | null;
  due_domains: string[];
  directive: string;
};

export type ReadinessData = {
  readiness_index: number;
  domain_scores: Record<string, number>;
  total_domains: number;
  mastered_domains: number;
  weak_domains: number;
};

export interface SM2Result {
  quality: number;
  new_ease_factor: number;
  new_interval_days: number;
  new_mastery_score: number;
  was_excluded: boolean;
}
