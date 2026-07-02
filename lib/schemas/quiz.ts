import { z } from "zod";

// Options: either object map or array of strings
export const OptionObjectSchema = z.record(z.string(), z.string());
export const OptionArraySchema = z.array(z.string());
export const OptionSchema = z.union([OptionObjectSchema, OptionArraySchema]).transform((opts) => {
  if (Array.isArray(opts)) {
    return Object.fromEntries(opts.map((val, idx) => [String.fromCharCode(65 + idx), val]));
  }
  return opts;
});

export const QuestionSchema = z.object({
  question_text: z.string(),
  options: OptionSchema,
  correct_option: z.string(),
  explanation: z.string().optional().default(""),
  topics: z.array(z.string()).optional().default([]),
  difficulty_tier: z.enum(["foundation", "application", "advanced", "expert"]).optional(),
  distractor_analysis: z.record(z.string(), z.string()).optional(),
  skill_domain: z.string().optional(),
  time_estimate_seconds: z.number().optional(),
  misconception: z.string().optional(),
});
export type Question = z.infer<typeof QuestionSchema>;

// Allow both string and number in table cells, convert numbers to strings
// const TableCellSchema = z.union([z.string(), z.number()]).transform(val => String(val));

// Supporting content schemas for different types
const GraphContentSchema = z.object({
  type: z.enum(['bar', 'line', 'pie']),
  title: z.string(),
  labels: z.array(z.string()),
  datasets: z.array(z.object({
    label: z.string(),
    values: z.array(z.number())
  }))
});

const TableContentSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.union([z.string(), z.number()])))
});

type GraphContent = z.infer<typeof GraphContentSchema>;
type TableContent = z.infer<typeof TableContentSchema>;

// Type guards for content validation
function isGraphContent(content: unknown): content is GraphContent {
  if (!content || typeof content !== 'object') return false;
  const c = content as Record<string, unknown>;
  return (
    ['bar', 'line', 'pie'].includes(c.type as string) &&
    Array.isArray(c.labels) &&
    Array.isArray(c.datasets) &&
    c.datasets.every((ds: unknown) =>
      typeof ds === 'object' &&
      ds !== null &&
      typeof (ds as Record<string, unknown>).label === 'string' &&
      Array.isArray((ds as Record<string, unknown>).values) &&
      ((ds as Record<string, unknown>).values as unknown[]).every((v: unknown) => typeof v === 'number')
    )
  );
}

function isTableContent(content: unknown): content is TableContent {
  if (!content || typeof content !== 'object') return false;
  const c = content as Record<string, unknown>;
  return (
    Array.isArray(c.headers) &&
    c.headers.every((h: unknown) => typeof h === 'string') &&
    Array.isArray(c.rows) &&
    c.rows.every((row: unknown) =>
      Array.isArray(row) &&
      (row as unknown[]).every((cell: unknown) =>
        typeof cell === 'string' || typeof cell === 'number'
      )
    )
  );
}

// Supporting content with type-specific validation
export const SupportingContentSchema = z.object({
  type: z.enum(['text', 'image', 'graph', 'table']),
  content: z.union([
    z.string(),
    GraphContentSchema,
    TableContentSchema
  ]),
  caption: z.string().optional().default("")
}).transform((content) => {
  // Normalize graph types
  if (content.type === 'graph' && isGraphContent(content.content)) {
    if (['line', 'bar', 'pie'].includes(content.content.type)) {
      return {
        ...content,
        type: 'graph' as const,
        content: {
          ...content.content,
          datasets: content.content.datasets.map(ds => ({
            ...ds,
            values: ds.values.map(String)
          }))
        },
        caption: content.caption || ""
      };
    }
  }
  // Convert table numbers to strings
  if (content.type === 'table' && isTableContent(content.content)) {
    return {
      ...content,
      content: {
        headers: content.content.headers,
        rows: content.content.rows.map(row =>
          row.map(cell => String(cell))
        )
      },
      caption: content.caption || ""
    };
  }
  return {
    ...content,
    caption: content.caption || ""
  };
});

export type SupportingContent = z.infer<typeof SupportingContentSchema>;

export const QuestionGroupSchema = z.object({
  group_id: z.string(),
  group_title: z.string(),
  supporting_content: SupportingContentSchema,
  questions: z.array(QuestionSchema)
});

export type QuestionGroup = z.infer<typeof QuestionGroupSchema>;

export const GeneratedQuizSchema = z.object({
  title: z.string(),
  description: z.string(),
  topic: z.string(),
  subject: z.string(),
  language: z.string(),
  difficulty: z.string(),
  questions: z.array(QuestionSchema).optional().default([]),
  question_groups: z.array(QuestionGroupSchema).optional().default([])
});

export type GeneratedQuiz = z.infer<typeof GeneratedQuizSchema>;
