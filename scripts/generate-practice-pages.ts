// Path: scripts/generate-practice-pages.ts

/**
 * One-shot script to generate ~113 SEO practice question sets and store them in Supabase.
 *
 * Usage:
 *   npx tsx scripts/generate-practice-pages.ts
 *   npx tsx scripts/generate-practice-pages.ts --dry-run
 *
 * Reads lib/taxonomies.json, flattens to domain entries, calls DeepSeek/OpenAI
 * for each domain, and upserts results into practice_questions.
 */

import { openai, MODEL } from "../lib/ai";
import { supabaseAdmin } from "../lib/supabase/admin";
import {
  getPracticeSystemPrompt,
  buildPracticeUserMessage,
  flattenTaxonomy,
  type PracticeDomainEntry,
} from "../lib/geo-prompts";
import { QuestionSchema } from "../lib/schemas/quiz";
import { z } from "zod";
import taxonomyRaw from "../lib/taxonomies.json";

// ---- Type ----

const taxonomy = taxonomyRaw as Record<string, unknown>;

// We only need questions from parseQuiz, not the full GeneratedQuiz wrapper.
const PracticeQuestionsOnlySchema = z.object({
  questions: z.array(QuestionSchema),
});

// ---- Config ----

const DELAY_MS = 500;
const MAX_RETRIES = 2;
const QUESTIONS_PER_DOMAIN = 3;

// ---- Helpers ----

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseResponse(raw: string): z.infer<typeof QuestionSchema>[] {
  // The AI returns `{ questions: [...] }`. Try to parse it.
  const cleaned = raw.trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Try to extract JSON from wrapped markdown
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in response");
    parsed = JSON.parse(match[0]);
  }

  // Validate
  const result = PracticeQuestionsOnlySchema.parse(parsed);
  return result.questions;
}

async function generateForDomain(
  entry: PracticeDomainEntry,
): Promise<{ questions: z.infer<typeof QuestionSchema>[] } | { error: string }> {
  const userMessage = buildPracticeUserMessage(entry.exam, entry.subject, entry.domain, QUESTIONS_PER_DOMAIN);

  let lastError: string | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: getPracticeSystemPrompt() },
          { role: "user", content: userMessage },
        ],
        temperature: 0.95,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0]?.message?.content || "";
      const questions = parseResponse(raw);

      if (questions.length === 0) {
        throw new Error("AI returned 0 valid questions");
      }

      return { questions };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt < MAX_RETRIES) {
        const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.log(`  Retry ${attempt + 1}/${MAX_RETRIES} after ${Math.round(backoff)}ms...`);
        await sleep(backoff);
      }
    }
  }

  return { error: lastError ?? "Unknown error" };
}

// ---- Main ----

async function main() {
  const isDryRun = process.argv.includes("--dry-run");

  const entries = flattenTaxonomy(taxonomy);
  console.log(`Total domains: ${entries.length}`);
  console.log();

  if (isDryRun) {
    console.log("[DRY RUN] Would generate questions for:");
    entries.forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.exam} > ${e.subject} > ${e.domain}`);
    });
    console.log(`\n[DRY RUN] Total: ${entries.length} domains. No AI calls made.`);
    return;
  }

  let successCount = 0;
  const total = entries.length;

  for (let i = 0; i < total; i++) {
    const entry = entries[i];
    const prefix = `[${i + 1}/${total}]`;

    const result = await generateForDomain(entry);

    if ("error" in result) {
      console.log(`${prefix} ${entry.exam} > ${entry.subject} > ${entry.domain} — FAILED: ${result.error}`);
      continue;
    }

    console.log(`${prefix} ${entry.exam} > ${entry.subject} > ${entry.domain} — ${result.questions.length} questions`);

    // Upsert into Supabase
    const { error: dbError } = await supabaseAdmin
      .from("practice_questions")
      .upsert(
        {
          exam_name: entry.exam,
          subject: entry.subject,
          domain: entry.domain,
          questions_json: result.questions,
        },
        { onConflict: "exam_name,subject,domain" },
      );

    if (dbError) {
      console.log(`  DB upsert error: ${dbError.message}`);
    } else {
      successCount++;
    }

    // Delay between domains to respect rate limits
    if (i < total - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log();
  console.log(`Done. Generated questions for ${successCount}/${total} domains.`);
}

// Run only when executed directly (not imported)
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/^\.\//, ""));
const isDirectExecution = process.argv[1]?.includes("generate-practice-pages");

if (isMain || isDirectExecution) {
  main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
