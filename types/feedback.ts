export interface Feedback {
	id: string;
	message: string;
	type: "feedback" | "feature" | "bug";
	rating?: number;
	created_at: string;
	user_id?: string;
	user?: {
		email?: string;
		user_metadata?: {
			name?: string;
		};
	};
}
