export interface Question {
	question_text: string;
	options: {
		a: string;
		b: string;
		c: string;
		d: string;
	};
	correct_option: string;
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

// export interface QuizData {
// 	title: string;
// 	description: string;
// 	topic: string;
// 	subject: string;
// 	difficulty: string;
// 	question_count: number;
// 	questions: Array<{
// 		question_text: string;
// 		options: {
// 			a: string;
// 			b: string;
// 			c: string;
// 			d: string;
// 		};
// 		correct_option: string;
// 	}>;
// }
