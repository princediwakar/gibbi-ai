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


export const LANGUAGES = [
	// Europe
	{ code: "Auto", name: "Auto" },
	{ code: "English", name: "English" },
	{ code: "French", name: "Français" },
	{ code: "German", name: "Deutsch" },
	{ code: "Spanish", name: "Español" },
	{ code: "Italian", name: "Italiano" },
	{ code: "Portuguese", name: "Português" },
	{ code: "Dutch", name: "Nederlands" },
	{ code: "Polish", name: "Polski" },
	{ code: "Swedish", name: "Svenska" },
	{ code: "Danish", name: "Dansk" },
	{ code: "Norwegian", name: "Norsk" },
	{ code: "Finnish", name: "Suomi" },
	{ code: "Greek", name: "Ελληνικά" },
	{ code: "Romanian", name: "Română" },
	{ code: "Czech", name: "Čeština" },
	{ code: "Hungarian", name: "Magyar" },
	{ code: "Bulgarian", name: "Български" },
	{ code: "Croatian", name: "Hrvatski" },
	{ code: "Slovak", name: "Slovenčina" },
	{ code: "Slovenian", name: "Slovenščina" },
	{ code: "Serbian", name: "Српски" },
	{ code: "Albanian", name: "Shqip" },
	{ code: "Georgian", name: "ქართული" },
	{ code: "Armenian", name: "Հայերեն" },
	{ code: "Basque", name: "Euskara" },
	{ code: "Catalan", name: "Català" },
	{ code: "Galician", name: "Galego" },
	{ code: "Icelandic", name: "Íslenska" },
	{ code: "Azerbaijani", name: "Azərbaycan dili" },
	{ code: "Belarusian", name: "Беларуская" },
  
	// Middle East & Central Asia
	{ code: "Arabic", name: "العربية" },
	{ code: "Persian", name: "فارسی" },
	{ code: "Turkish", name: "Türkçe" },
	{ code: "Kazakh", name: "Қазақша" },
	{ code: "Uzbek", name: "O‘zbekcha" },
	{ code: "Turkmen", name: "Türkmen dili" },
	{ code: "Tajik", name: "Тоҷикӣ" },
	{ code: "Hebrew", name: "עברית" },
  
	// South Asia
	{ code: "Hindi", name: "हिन्दी" },
	{ code: "Bengali", name: "বাংলা" },
	{ code: "Tamil", name: "தமிழ்" },
	{ code: "Telugu", name: "తెలుగు" },
	{ code: "Marathi", name: "मराठी" },
	{ code: "Gujarati", name: "ગુજરાતી" },
	{ code: "Punjabi", name: "ਪੰਜਾਬੀ" },
	{ code: "Urdu", name: "اردو" },
	{ code: "Nepali", name: "नेपाली" },
	{ code: "Sinhalese", name: "සිංහල" },
	{ code: "Malayalam", name: "മലയാളം" },
  
	// East & Southeast Asia
	{ code: "Chinese", name: "中文" },
	{ code: "Japanese", name: "日本語" },
	{ code: "Korean", name: "한국어" },
	{ code: "Vietnamese", name: "Tiếng Việt" },
	{ code: "Thai", name: "ไทย" },
	{ code: "Indonesian", name: "Bahasa Indonesia" },
	{ code: "Malay", name: "Bahasa Melayu" },
	{ code: "Khmer", name: "ខ្មែរ" },
	{ code: "Mongolian", name: "Монгол" },
  
	// Sub-Saharan Africa
	{ code: "Swahili", name: "Kiswahili" },
  
	// North America & Caribbean
	{ code: "Haitian Creole", name: "Kreyòl Ayisyen" }
  ];
  