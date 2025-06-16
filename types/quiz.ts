import { User as SupabaseUser } from "@supabase/supabase-js";

// Core Content Types
export type ContentType = "text" | "image" | "graph" | "table";

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
  question_id?: number;
  question_text: string;
  // Options may be stored as an object or raw JSON string
  options: Record<string, string> | string;
  correct_option: string;
  isNew?: boolean;
  group_id?: number;
}

export interface QuestionGroup {
  group_id?: number;
  supporting_content?: SupportingContent;
  questions: Question[];
}

// Quiz Structure
export interface Quiz {
  quiz_id: string;
  title: string;
  description: string;
  topic: string;
  subject: string;
  difficulty: string;
  slug: string;
  status: string;
  language: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  question_count: number;
  creator_name?: string;
  questions: Question[];
  question_groups?: QuestionGroup[];
}

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
