import { Quiz } from "@/types/quiz";

// Utility to check if the accumulated response is complete.
export const isCompleteResponse = (text: string): boolean => {
	return text.trim().endsWith("END_OF_JSON");
};

// Clean response: remove markdown formatting, the END_OF_JSON marker, and invalid control characters.
export const cleanResponse = (text: string): string => {
	try {
		text = text
			.replace(/```(?:json)?\s*/gi, "")
			.replace(/\s*```/gi, "");
		text = text.replace(/END_OF_JSON\s*$/, "").trim();
		return text.replace(/[\x00-\x1F\x7F]/g, "");
	} catch (error) {
		console.error("Error cleaning response:", error);
		throw new Error("Failed to clean response");
	}
};

// Safely parse JSON, removing problematic control characters and invalid escape sequences.
export const parseJSONSafely = (jsonString: string): Quiz => {
	try {
		let cleanedString = jsonString.replace(
			/[\x00-\x1F\x7F]/g,
			""
		);
		cleanedString = cleanedString.replace(
			/\\(?!["\\\/bfnrt]|u[0-9A-Fa-f]{4})/g,
			""
		);
		return JSON.parse(cleanedString);
	} catch (err) {
		console.error("Failed to parse JSON:", jsonString);
		throw new Error(
			`Failed to parse JSON: ${err instanceof Error
				? err.message
				: "Unknown error"
			}`
		);
	}
};
