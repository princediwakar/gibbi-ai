export interface Quiz {
	quiz_id: string;
	creator_id: string | null;
	title: string;
	description: string | null;
	subject: string; // New field
	topic: string;
	difficulty: string;
	num_questions: number; // Make this optional
	is_public: boolean;
	created_at: string;
	updated_at: string;
	creatorName?: string; // Add this
	questions?: Array<{
		question_id: string;
		question_text: string;
		options: string[];
		correct_option: string;
	}>;
}
