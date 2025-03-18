import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export const extractIdFromSlug = (slug: string) => {
	return slug.split("_").pop(); // Extract the last part as ID
};

export function generateSlug(title: string, quizId: string) {
	// Generate the slug using underscore as a separator
	const slug = `${title
		.replace(/\s+/g, "-")
		.toLowerCase()}_${quizId}`;

	return slug;
}