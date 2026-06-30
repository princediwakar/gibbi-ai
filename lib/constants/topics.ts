// Path: lib/constants/topics.ts
import taxonomy from "@/lib/taxonomies.json";

type TaxonomyData = Record<string, Record<string, string[]>>;
const taxonomyData = taxonomy as unknown as TaxonomyData;

export function buildTaxonomyMap(): Map<string, string> {
  const map = new Map<string, string>();

  for (const exam of Object.values(taxonomyData)) {
    for (const subjects of Object.values(exam)) {
      for (const domain of subjects) {
        const key = domain
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        if (!map.has(key)) {
          map.set(key, domain);
        }
      }
    }
  }

  return map;
}
