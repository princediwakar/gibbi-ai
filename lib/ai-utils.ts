import { Quiz } from "@/types/quiz";

// Utility to check if the response contains the END_OF_JSON marker anywhere
export const isCompleteResponse = (text: string): boolean => {
  return text.includes("END_OF_JSON");
};

// Clean response: truncate at END_OF_JSON, remove markdown, and invalid control characters
export const cleanResponse = (text: string): string => {
  try {
    // Truncate everything after END_OF_JSON
    const endIndex = text.indexOf("END_OF_JSON");
    if (endIndex !== -1) {
      text = text.substring(0, endIndex);
    }

    // Remove markdown formatting
    text = text
      .replace(/```(?:json)?\s*/gi, "")
      .replace(/\s*```/gi, "")
      .trim();

    // Remove control characters
    return text.replace(/[\x00-\x1F\x7F]/g, "");
  } catch (error) {
    console.error("Error cleaning response:", error);
    throw new Error("Failed to clean response");
  }
};

// Safely parse JSON, removing problematic control characters and invalid escape sequences
export const parseJSONSafely = (jsonString: string): Quiz => {
  try {
    let cleanedString = jsonString.replace(/[\x00-\x1F\x7F]/g, "");
    cleanedString = cleanedString.replace(/\\(?!["\\\/bfnrt]|u[0-9A-Fa-f]{4})/g, "");
    return JSON.parse(cleanedString);
  } catch (err) {
    console.error("Failed to parse JSON:", jsonString);
    throw new Error(
      `Failed to parse JSON: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
};