// lib/ai-utils.ts
import { z } from "zod";

// ----- Schemas and Types -----

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
});
export type Question = z.infer<typeof QuestionSchema>;

// Allow both string and number in table cells, convert numbers to strings
const TableCellSchema = z.union([z.string(), z.number()]).transform(val => String(val));

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
  const c = content as any;
  return (
    ['bar', 'line', 'pie'].includes(c.type) &&
    Array.isArray(c.labels) &&
    Array.isArray(c.datasets) &&
    c.datasets.every((ds: any) => 
      typeof ds === 'object' &&
      typeof ds.label === 'string' &&
      Array.isArray(ds.values) &&
      ds.values.every((v: any) => typeof v === 'number')
    )
  );
}

function isTableContent(content: unknown): content is TableContent {
  if (!content || typeof content !== 'object') return false;
  const c = content as any;
  return (
    Array.isArray(c.headers) &&
    c.headers.every((h: any) => typeof h === 'string') &&
    Array.isArray(c.rows) &&
    c.rows.every((row: any) => 
      Array.isArray(row) &&
      row.every((cell: any) => 
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

// ----- Response Cleaning -----
export function cleanResponse(text: string): string {
  const idx = text.indexOf("END_OF_JSON");
  if (idx !== -1) text = text.slice(0, idx);
  return text
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/\s*```/gi, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim();
}

// ----- Parsing & Validation -----
export function parseQuiz(raw: string): GeneratedQuiz {
  const cleaned = cleanResponse(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Invalid JSON: ${err instanceof Error ? err.message : err}`);
  }
  
  // Validate the parsed quiz
  const quiz = GeneratedQuizSchema.parse(parsed);

  // Count total questions (standalone + grouped)
  const standaloneCount = quiz.questions?.length || 0;
  const groupedCount = quiz.question_groups?.reduce((sum, group) => sum + (group.questions?.length || 0), 0) || 0;
  const totalQuestions = standaloneCount + groupedCount;

  // Extract question count from user message
  const userMessage = buildUserMessage(quiz.topic, 0, ""); // 0 is a dummy value, we just need the message format
  const requestedCount = parseInt(userMessage.match(/Generate exactly (\d+) questions/)?.[1] || "10");

  if (totalQuestions !== requestedCount) {
    console.error(`Warning: Generated ${totalQuestions} questions, but ${requestedCount} were requested`);
    throw new Error(`Invalid number of questions: got ${totalQuestions}, expected ${requestedCount}. This is a critical error that must be fixed.`);
  }

  // Additional validation for question groups
  quiz.question_groups?.forEach((group, idx) => {
    if (!group.questions?.length) {
      throw new Error(`Question group ${idx + 1} (${group.group_id}) has no questions`);
    }
    if (group.questions.length > 4) {
      throw new Error(`Question group ${idx + 1} (${group.group_id}) has too many questions (${group.questions.length}). Maximum is 4 per group.`);
    }
  });

  return quiz;
}

// ----- Variability Instructions -----
const tones = [
  "Engaging and clear",
  "Challenging and thought-provoking", 
  "Informative and concise",
  "Professional and analytical",
  "Practical and application-focused"
];

const creativityMods = [
  "Ensure questions cover multiple cognitive levels (remember, understand, apply, analyze, evaluate, create).",
  "Incorporate diverse real-world applications and scenarios.",
  "Mix theoretical concepts with practical applications.",
  "Balance abstract thinking with concrete examples.",
  "Include both straightforward and complex problem-solving approaches."
];

const qTypes = [
  "Direct recall questions testing fundamental knowledge",
  "Analysis questions requiring breaking down complex information",
  "Synthesis questions combining multiple concepts",
  "Evaluation questions requiring judgment and assessment",
  "Application questions using real-world scenarios",
  "Comparison questions exploring relationships between concepts",
  "Case study questions with detailed scenarios",
  "Data interpretation questions with graphs or tables",
  "Process explanation questions about sequences or procedures",
  "Problem-solving questions requiring multi-step solutions"
];

// Question category weights to ensure balanced distribution
export const questionCategories = {
  RECALL: 'recall',
  COMPREHENSION: 'comprehension',
  APPLICATION: 'application',
  ANALYSIS: 'analysis',
  SYNTHESIS: 'synthesis',
  EVALUATION: 'evaluation'
} as const;

type QuestionCategory = typeof questionCategories[keyof typeof questionCategories];

function pick<T>(arr: T[], rng: () => number) { return arr[Math.floor(rng() * arr.length)]; }

export function getVariabilityInstructions(rng: () => number = Math.random): string {
  // Pick multiple question types to focus on
  const selectedTypes = new Set<string>();
  while(selectedTypes.size < 3) {
    selectedTypes.add(pick(qTypes, rng));
  }

  return [
    `1. Tone: ${pick(tones, rng)}`,
    `2. ${pick(creativityMods, rng)}`,
    `3. Question Types to Include:\n${Array.from(selectedTypes).map(t => `   - ${t}`).join('\n')}`,
    `4. CRITICAL DIVERSITY REQUIREMENTS:`,
    `   - No more than 25% of questions should be reading comprehension`,
    `   - Mix standalone questions with grouped questions`,
    `   - Vary question complexity within the chosen difficulty level`,
    `   - Use different cognitive levels (Bloom's Taxonomy)`,
    `5. Content Variety Requirements:`,
    `   - For reading passages: use different types (narrative, descriptive, technical)`,
    `   - For data interpretation: alternate between graphs, tables, and charts`,
    `   - For problem-solving: vary between numerical, logical, and analytical approaches`,
    `6. Structure Requirements:`,
    `   - Ensure each question group has a unique theme or concept`,
    `   - Limit related questions to 2-3 per supporting content`,
    `   - Maintain independence between question groups`,
    `7. Language Requirements:`,
    `   - Vary question stems (avoid repetitive patterns)`,
    `   - Use diverse vocabulary within the appropriate level`,
    `   - Include both positive and negative question forms`,
    `8. Answer Options Requirements:`,
    `   - Ensure plausible distractors`,
    `   - Vary the position of correct answers`,
    `   - Maintain consistent option length and style`
  ].join('\n');
}

export function buildSystemMessage(
  variability: string,
  language: string,
  difficulty: string,
  remaining: number,
  maxTokens: number,
  customInstructions: string = ''
): string {
  const ROLE = "You are an expert Test Generator specializing in standardized tests as of April 2025.";
  
  const CRITICAL_RULES = `
CRITICAL REQUIREMENTS:
1. You MUST generate EXACTLY ${remaining} questions total - no more, no less
2. Count your questions carefully:
   - Each standalone question counts as 1
   - Each question in a group counts as 1
   - Total = (standalone questions) + (sum of questions in all groups)
3. Before returning JSON:
   - Count all questions to verify the total is exactly ${remaining}
   - If not exactly ${remaining}, adjust your output before returning
4. Quality Requirements:
   - Each question must be complete with question text, 4 options, and correct answer
   - Questions must be substantive and meaningful
   - No placeholder or filler questions
5. If you cannot generate exactly ${remaining} high-quality questions, STOP and return an error
`;
  
  const CONTENT_ALIGNMENT_RULES = `
CRITICAL: Supporting Content and Question Alignment Rules:
1. ONLY create question_groups when you have specific supporting content (text passage, data table, graph, image) that DIRECTLY relates to multiple questions
2. Each question in a group MUST explicitly reference or depend on the supporting content
3. Questions should be answerable ONLY by using the supporting content provided
4. Supporting content should contain ALL information needed to answer the grouped questions
5. If questions can be answered without the supporting content, put them in the standalone "questions" array instead
6. Use supporting content types appropriately:
   - "text": For passages, scenarios, or detailed explanations that questions reference
   - "table": For data tables with headers and rows that questions analyze
   - "graph": For charts/graphs with structured data that questions interpret
   - "image": For visual content that questions describe or analyze
7. Each question group should have 2-4 questions maximum to maintain focus
8. Supporting content should be substantial enough to warrant multiple questions

GROUPING STRUCTURE REQUIREMENTS:
- Give each question group a unique "group_id" (e.g., "passage_1", "table_data_1", "alexander_study") 
- Add a descriptive "group_title" that clearly identifies what this group is about
- For multiple passages on similar topics (e.g., two Alexander the Great passages), use distinct group_ids like "alexander_military" and "alexander_legacy"
- Questions within a group must ALL reference the SAME supporting content
- Never mix questions from different supporting content in the same group

SPECIAL FORMAT HANDLING:
- If the user requests "reading comprehension", create distinct text passages with unique themes and group_ids
- If the user requests data analysis, create tables or graphs with meaningful data and questions that analyze that data
- If the user mentions specific subjects (history, science, literature), focus the content on those subjects rather than creating questions about the subject names themselves
- When creating multiple passages on similar historical figures/topics, ensure each passage covers a different aspect (military campaigns vs. cultural impact vs. political reforms)
`;

  const SCHEMA_INSTRUCTIONS = `
Output **must** be a single valid JSON object (no markdown, no extra text) in exactly this shape:

{
  "title": "string",
  "description": "string", 
  "topic": "string",
  "subject": "string",
  "language": "${language}",
  "difficulty": "${difficulty}",
  "question_groups": [
    {
      "group_id": "unique_identifier_for_this_group",
      "group_title": "Descriptive title for this group",
      "supporting_content": {
        "type": "text" | "image" | "graph" | "table",
        "content": "string or structured object with meaningful data",
        "caption": "brief description of how content relates to questions (optional, defaults to empty string)"
      },
      "questions": [
        {
          "question_text": "Question that explicitly references the supporting content",
          "options": { "A": "option1", "B": "option2", "C": "option3", "D": "option4" },
          "correct_option": "A" | "B" | "C" | "D"
        }
      ]
    }
  ],
  "questions": [
    {
      "question_text": "Standalone question not requiring supporting content",
      "options": { "A": "option1", "B": "option2", "C": "option3", "D": "option4" },
      "correct_option": "A" | "B" | "C" | "D"
    }
  ]
}

CRITICAL: For graph content, you MUST use this EXACT structure:
{
  "type": "graph",
  "content": {
    "type": "bar" | "line" | "pie",
    "title": "Graph Title",
    "labels": ["Label1", "Label2", "Label3"],
    "datasets": [{"label": "Series Name", "values": [10, 20, 30]}]
  }
}

CRITICAL: For table content, you MUST use this EXACT structure:
{
  "type": "table",
  "content": {
    "headers": ["Column1", "Column2", "Column3"],
    "rows": [["Row1Col1", "Row1Col2", "Row1Col3"], ["Row2Col1", "Row2Col2", "Row2Col3"]]
  }
}

IMPORTANT VALIDATION RULES:
1. For graphs:
   - "type" in supporting_content must be "graph"
   - "content" must be an object with "type" ("bar", "line", or "pie")
   - All graph data must be in the content object
2. For tables:
   - "type" in supporting_content must be "table"
   - "content" must be an object with "headers" and "rows" arrays
3. For text and images:
   - "type" must be "text" or "image"
   - "content" must be a string

Append the literal marker END_OF_JSON immediately after the closing brace.
`;

  const RULES = [
    CRITICAL_RULES,
    CONTENT_ALIGNMENT_RULES,
    `Variability rules:\n${variability}`,
    customInstructions ? `Custom instructions:\n${customInstructions}` : '',
    `Fit your JSON within ${maxTokens} tokens.`,
  ].filter(Boolean).join("\n\n");

  return [ROLE, SCHEMA_INSTRUCTIONS.trim(), RULES].join("\n\n");
}

export function buildUserMessage(
  content: string,
  remaining: number,
  uniqueToken: string
): string {
  // Detect if this is a format request rather than content
  const isReadingComprehension = content.toLowerCase().includes('reading comprehension');
  const isDataAnalysis = content.toLowerCase().includes('data analysis');
  const isGeneralSubject = /^(math|science|history|literature|geography|biology|chemistry|physics|english)$/i.test(content.trim());
  
  const CRITICAL_REMINDER = `
CRITICAL: You must generate EXACTLY ${remaining} questions total.
Count carefully: (standalone questions) + (questions in all groups) must equal ${remaining}.
`;

  const message = [
    CRITICAL_REMINDER,
    `Create a quiz about: ${content}`,
    `Unique token: ${uniqueToken}`
  ].join('\n\n');

  return message;
}

// ----- Extraction Helper -----
export function extractValidQuestions(raw: string) {
  const quiz = parseQuiz(raw);
  return { validQuestions: quiz.questions, validQuestionGroups: quiz.question_groups, metadata: quiz };
}
