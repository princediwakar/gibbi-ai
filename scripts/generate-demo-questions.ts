// Path: scripts/generate-demo-questions.ts

/**
 * Build-time script: generates one high-trap demo question per exam from
 * taxonomies.json and caches them to lib/demo-questions.json.
 *
 * Zero maintenance — adding exams to the taxonomy auto-generates their demo
 * question on the next build.
 *
 * Usage:
 *   npx tsx scripts/generate-demo-questions.ts
 *   npx tsx scripts/generate-demo-questions.ts --dry-run
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { openai, MODEL } from "../lib/ai";
import {
  getPracticeSystemPrompt,
  buildPracticeUserMessage,
  flattenTaxonomy,
} from "../lib/geo-prompts";
import { QuestionSchema } from "../lib/ai-utils";
import { z } from "zod";
import taxonomyRaw from "../lib/taxonomies.json";

// ---- Types ----

const taxonomy = taxonomyRaw as Record<string, unknown>;

const DemoQuestionsSchema = z.object({
  _generated_at: z.string(),
  exams: z.record(
    z.string(),
    z.object({
      exam_name: z.string(),
      subject: z.string(),
      domain: z.string(),
      question: QuestionSchema,
    }),
  ),
});

type DemoQuestions = z.infer<typeof DemoQuestionsSchema>;

// AI returns `{ questions: [...] }` wrapping the QuestionSchema array.
const WrapperSchema = z.object({ questions: z.array(QuestionSchema) });

// ---- Config ----

const OUTPUT_PATH = path.resolve(
  import.meta.dirname,
  "../lib/demo-questions.json",
);
const DELAY_MS = 600;
const MAX_RETRIES = 2;

// ---- Helpers ----

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseResponse(raw: string): z.infer<typeof QuestionSchema>[] {
  const cleaned = raw.trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in response");
    parsed = JSON.parse(match[0]);
  }

  const result = WrapperSchema.parse(parsed);
  return result.questions;
}

async function generateForExam(examName: string, subject: string, domain: string) {
  const userMessage = buildPracticeUserMessage(examName, subject, domain, 1);

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

      return questions[0];
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt < MAX_RETRIES) {
        const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.log(`  Retry ${attempt + 1}/${MAX_RETRIES} after ${Math.round(backoff)}ms...`);
        await sleep(backoff);
      }
    }
  }

  throw new Error(lastError ?? "Unknown error");
}

// ---- Main ----

async function main() {
  const isDryRun = process.argv.includes("--dry-run");

  const entries = flattenTaxonomy(taxonomy);

  // Group by exam: pick the first subject's first domain for each exam
  const examMap = new Map<string, { subject: string; domain: string }>();
  for (const entry of entries) {
    if (!examMap.has(entry.exam)) {
      examMap.set(entry.exam, { subject: entry.subject, domain: entry.domain });
    }
  }

  console.log(`Exams: ${examMap.size} (${entries.length} total domains)`);
  console.log();

  const exams: DemoQuestions["exams"] = {};

  if (isDryRun) {
    console.log("[DRY RUN] Would generate demo questions for:");
    for (const [exam, { subject, domain }] of examMap) {
      console.log(`  ${exam} > ${subject} > ${domain}`);
    }
    return;
  }

  const examNames = Array.from(examMap.entries());
  for (let i = 0; i < examNames.length; i++) {
    const [examName, { subject, domain }] = examNames[i];
    const prefix = `[${i + 1}/${examNames.length}]`;

    try {
      const question = await generateForExam(examName, subject, domain);
      console.log(`${prefix} ${examName} > ${subject} > ${domain} — OK`);

      exams[examName] = {
        exam_name: examName,
        subject,
        domain,
        question: {
          ...question,
          options: question.options as Record<string, string>,
        },
      };
    } catch (err) {
      console.error(`${prefix} ${examName} — FAILED: ${err instanceof Error ? err.message : String(err)}`);
    }

    if (i < examNames.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  const output: DemoQuestions = {
    _generated_at: new Date().toISOString(),
    exams,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");

  console.log();
  console.log(`Done. ${Object.keys(exams).length}/${examMap.size} exams written to ${OUTPUT_PATH}`);
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/^\.\//, ""));
const isDirectExecution = process.argv[1]?.includes("generate-demo-questions");

if (isMain || isDirectExecution) {
  main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
