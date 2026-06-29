// Path: lib/services/skill-normalizer.ts
import { buildTaxonomyMap } from "@/lib/constants/topics";

const taxonomy = buildTaxonomyMap();

export function normalizeSkillDomain(raw: string): string {
  // Pass 1: Canonicalize
  let normalized = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Pass 2: Exact match against taxonomy (O(1) map lookup)
  if (taxonomy.has(normalized)) return taxonomy.get(normalized)!;

  // Pass 3: Strip common LLM decorations, retry
  const cleaned = normalized
    .replace(/^(physics|chemistry|math|biology|economics|history|computer science)[:\s-]+/i, "")
    .replace(/[:\s-]+(advanced|intro|basic|intermediate|overview)$/i, "")
    .trim();
  if (cleaned && taxonomy.has(cleaned)) return taxonomy.get(cleaned)!;

  // Pass-through: new topic enters ecosystem organically
  return cleaned || normalized;
}
