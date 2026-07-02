import taxonomy from "@/lib/taxonomies.json";

type TaxonomyData = Record<string, Record<string, string[]>>;
const taxonomyData = taxonomy as unknown as TaxonomyData;

export function getDomainsForExam(examName: string): string[] {
  const subjects = taxonomyData[examName];
  if (!subjects) return [];
  return Object.values(subjects).flat();
}
