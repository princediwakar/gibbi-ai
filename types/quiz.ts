import { User as SupabaseUser } from "@supabase/supabase-js";
import { Database } from './supabase';

// Core Content Types
export type ContentType = 'text' | 'graph' | 'table' | 'image';

// Quiz Generation Parameters
export interface GeneratedQuiz {
  title: string;
  description: string;
  topic: string;
  subject: string;
  language: string;
  difficulty: string;
  questions: Question[];
  question_groups: QuestionGroup[];
}

// Specific types for structured content
export interface GraphContent {
  type: "bar" | "line" | "pie";
  title: string;
  labels: string[];
  datasets: { label: string; values: number[] }[];
}

export interface TableContent {
  headers: string[];
  rows: string[][];
}

// Union of possible content types
export type StructuredContent = GraphContent | TableContent;

// Supporting content with unified structure
export interface SupportingContent {
  type: ContentType;
  content: string | StructuredContent;
  caption?: string;
}

// Question Structures
export interface Question {
  question_text: string;
  options: Record<string, string>;
  correct_option: string;
  explanation?: string;
  type?: string;
  content?: {
    type: ContentType;
    data: string;
  };
  group_id?: number;
  created_at?: string;
  question_id?: number;
  quiz_id?: string;
}

export interface QuestionGroup {
  group_id?: number;
  supporting_content?: SupportingContent;
  questions: Question[];
}

// Quiz Structure
export type Quiz = Database['public']['Tables']['quizzes']['Row'] & {
  questions: Question[];
};

// Helper Types
export interface FlattenedQuestion {
  question: Question;
  supportingContent: SupportingContent | null;
  source: "standalone" | `group-${number}`;
  originalIndex: number;
}

export type User = SupabaseUser;

// Utility
export function generateTempId(): number {
  return -Math.floor(Math.random() * 1000000);
}

export interface QuizMetadata {
  format: string;
  topicFocus: string[];
  sections: string[];
  questionDistribution: {
    standaloneCount: number;
    groups: Array<{
      title: string;
      questionCount: number;
      contentType: ContentType;
    }>;
  };
}

export interface QuizCreationResponse {
  success: boolean;
  message: string;
  quiz?: Quiz;
  error?: string;
}
