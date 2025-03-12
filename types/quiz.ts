export interface Question {
	question_text: string;
	options: Record<string, string>;
	correct_option: string;
}

export interface Quiz {
	quiz_id: string;
	title: string;
	description?: string;
	topic?: string;
	subject?: string;
	difficulty?: string;
	num_questions: number;
	created_at: string;
	updated_at: string;
	is_public: boolean;
	creator_id: string;
	creatorName?: string;
	questions?: Question[];
}
