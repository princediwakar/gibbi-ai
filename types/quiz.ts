import { User as SupabaseUser } from "@supabase/supabase-js";


export interface Question {
	question_id?: number;
	question_text: string;
	options: Record<string, string>; // Allows a dynamic number of options
	correct_option: string;
	isNew?: boolean; // Optional flag for new questions
	
}


export interface Quiz {
	quiz_id: string;
	title: string;
	description: string;
	topic: string;
	subject: string;
	difficulty: string;
	slug: string;
	status: string;
	creator_id: string;
	created_at: string;
	updated_at: string;
	question_count: number; // Added from the view
	creator_name?: string;
	questions: Question[];
}


// Generate a temporary ID for new questions
export function generateTempId(): number {
	return -Math.floor(Math.random() * 1000000); // Temporary negative ID for client-side only
  }


export type User = SupabaseUser;