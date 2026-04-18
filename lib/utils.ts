import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const extractIdFromSlug = (slug: string) => {
	const parts = slug.split("_");
	const id = parts.pop();
	return id && id !== "undefined" ? id : null;
};