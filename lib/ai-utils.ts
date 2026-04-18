// lib/ai-utils.ts
import { z } from "zod";
import * as crypto from "crypto";

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

// ----- Session-Based Variability Engine -----
// Simplified approach using intelligent prompting instead of complex programmatic logic

// Session fingerprint generation
export function generateSessionFingerprint(content: string, userId?: string): string {
  const timestamp = Date.now();
  const contentHash = crypto.createHash('sha256').update(content.toLowerCase().trim()).digest('hex').slice(0, 8);
  const userComponent = userId ? crypto.createHash('sha256').update(userId).digest('hex').slice(0, 4) : 'anon';
  const randomComponent = crypto.randomBytes(4).toString('hex');
  
  return `${timestamp}_${contentHash}_${userComponent}_${randomComponent}`;
}

// Helper function for difficulty calibration descriptions
function getDifficultyCalibration(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'Focus on fundamental understanding and basic application. Questions should test core concepts clearly without overly complex scenarios.';
    case 'medium':
      return 'Require application of knowledge in new contexts. Include multi-step reasoning processes while balancing conceptual and practical elements.';
    case 'hard':
      return 'Demand sophisticated analysis and synthesis. Include counterintuitive or complex scenarios requiring expert-level reasoning and insight.';
    default:
      return 'Adjust complexity to match the implied sophistication level of the request.';
  }
}

// ----- INTELLIGENT PROMPT ENGINEERING SYSTEM -----

// Core intelligence principles for question generation
const QUESTION_INTELLIGENCE_PRINCIPLES = [
  "Study the user's request deeply - if they mention 'GMAT', 'SAT', 'GRE', etc., understand they want authentic exam-level questions",
  "Recognize difficulty levels: 'Easy' = conceptual understanding, 'Medium' = application skills, 'Hard' = advanced analysis and synthesis",
  "If the request mentions 'reading comprehension', create substantial passages that require actual comprehension, not just vocabulary",
  "If the request mentions 'data analysis' or 'data insights', create meaningful datasets that require real analytical thinking",
  "If the request mentions 'math', create problems that require multi-step reasoning, not just formula recall",
  "Match the sophistication level to the context - business school prep should have business scenarios, college prep should be academic"
];

// Universal quality standards that apply to any quiz
const UNIVERSAL_QUALITY_STANDARDS = [
  "Every question must require genuine thinking - no trivial recall or obvious answers",
  "Wrong answer choices (distractors) should be plausible and test common misconceptions",
  "Questions should prepare learners for real-world applications of the knowledge",
  "Avoid repetitive patterns in question stems or answer formats",
  "Each question should add unique value to the overall learning experience"
];

// Session-based variability prompts
function generateIntelligentVariabilityPrompt(sessionFingerprint: string, difficulty: string): string {
  const seed = sessionFingerprint.split('_')[0] || '0';
  const sessionNumber = parseInt(seed) % 100;
  
  // Create variety through different cognitive approaches
  const approaches = [
    {
      focus: "analytical reasoning",
      style: "break down complex information systematically",
      examples: "cause-and-effect analysis, data interpretation, logical reasoning"
    },
    {
      focus: "practical application", 
      style: "connect theory to real-world scenarios",
      examples: "case studies, problem-solving, decision-making"
    },
    {
      focus: "conceptual synthesis",
      style: "combine multiple ideas into coherent understanding",
      examples: "comparative analysis, relationship mapping, pattern recognition"
    },
    {
      focus: "critical evaluation",
      style: "assess, judge, and critique information",
      examples: "argument analysis, evidence evaluation, quality assessment"
    }
  ];
  
  const selectedApproach = approaches[sessionNumber % approaches.length];
  
  const contentStyles = [
    "academic research and scholarly analysis",
    "business scenarios and professional contexts", 
    "current events and contemporary issues",
    "historical examples and case studies",
    "scientific discoveries and technical concepts"
  ];
  
  const selectedStyle = contentStyles[(sessionNumber + 1) % contentStyles.length];
  
  return `
SESSION INTELLIGENCE DIRECTIVE:
Your primary cognitive approach for this session: ${selectedApproach.focus}
Content style emphasis: ${selectedStyle}
Question creation method: ${selectedApproach.style}
Key question types to include: ${selectedApproach.examples}

DIFFICULTY CALIBRATION FOR ${difficulty.toUpperCase()}:
${getDifficultyCalibration(difficulty)}

CONTENT SOPHISTICATION REQUIREMENTS:
- Match the intellectual level appropriate to the subject matter
- Use authentic, professional-quality content
- Ensure questions would be valuable for serious test preparation
- Create supporting materials (passages, data, graphs) that are substantial and meaningful
  `;
}

// Enhanced system message builder with intelligent prompting
export function buildSystemMessage(
  variability: string,
  language: string,
  difficulty: string,
  remaining: number,
  maxTokens: number,
  customInstructions: string = ''
): string {
  
  const ROLE = `You are an elite Test Creation Specialist with expertise in creating high-quality educational assessments. Your questions are used by serious students preparing for important exams and academic challenges.`;
  
  const CORE_INTELLIGENCE = `
FUNDAMENTAL UNDERSTANDING:
${QUESTION_INTELLIGENCE_PRINCIPLES.map(p => `• ${p}`).join('\n')}

UNIVERSAL QUALITY STANDARDS:
${UNIVERSAL_QUALITY_STANDARDS.map(s => `• ${s}`).join('\n')}

YOUR MISSION: Create ${remaining} questions that truly challenge and educate learners at the ${difficulty} level.
  `;

  const CONTENT_CREATION_MASTERY = `
CONTENT CREATION EXCELLENCE:
1. AUTHENTIC SUPPORTING MATERIALS:
   - Reading passages should be dense, informative, and require careful analysis
   - Data tables should contain meaningful, realistic information
   - Graphs should show actual trends or relationships worth interpreting
   - All supporting content should justify multiple sophisticated questions

2. QUESTION SOPHISTICATION:
   - Each question should require specific knowledge or skills
   - Distractors should test genuine understanding, not just guessing
   - Questions should mirror the complexity students face in real academic/professional contexts
   - Avoid questions that can be answered without understanding the material

3. COGNITIVE VARIETY:
   - Include questions that test different thinking skills
   - Mix recall, application, analysis, and evaluation appropriately
   - Ensure questions require different approaches to solve
   - Create questions that build upon each other when grouped
  `;

  const STRUCTURAL_REQUIREMENTS = `
QUIZ STRUCTURE REQUIREMENTS:
• Generate EXACTLY ${remaining} questions total - this is critical
• Use question_groups when you have substantial supporting content (passages, data, graphs)
• Put standalone questions in the main "questions" array
• Each question group should have 2-3 questions maximum
• Supporting content must be substantial enough to warrant multiple questions
• Give descriptive group_titles and unique group_ids
  `;

  const JSON_FORMAT = `
OUTPUT FORMAT - Return ONLY this JSON structure:
{
  "title": "Engaging, descriptive title",
  "description": "Clear description of what this quiz tests", 
  "topic": "Main subject area",
  "subject": "Academic field",
  "language": "${language}",
  "difficulty": "${difficulty}",
  "question_groups": [
    {
      "group_id": "unique_identifier",
      "group_title": "Descriptive title",
      "supporting_content": {
        "type": "text|table|graph",
        "content": "substantial_content_here",
        "caption": "optional_description"
      },
      "questions": [...]
    }
  ],
  "questions": [
    {
      "question_text": "Well-crafted question requiring thought",
      "options": {"A": "option1", "B": "option2", "C": "option3", "D": "option4"},
      "correct_option": "A|B|C|D"
    }
  ]
}

For tables: {"type": "table", "content": {"headers": [...], "rows": [...]}}
For graphs: {"type": "graph", "content": {"type": "bar|line|pie", "title": "", "labels": [...], "datasets": [...]}}

End with: END_OF_JSON
  `;

  return [
    ROLE,
    CORE_INTELLIGENCE,
    variability,
    CONTENT_CREATION_MASTERY,
    STRUCTURAL_REQUIREMENTS,
    customInstructions ? `ADDITIONAL REQUIREMENTS:\n${customInstructions}` : '',
    JSON_FORMAT
  ].filter(Boolean).join('\n\n');
}

// Simplified but powerful user message
export function buildUserMessage(
  content: string,
  remaining: number,
  uniqueToken: string,
  searchContext?: string | null
): string {
  
  return `
CREATE A QUIZ: ${content}

${searchContext ? searchContext + '\n\n' : ''}
REQUIREMENTS:
- Generate exactly ${remaining} questions
- Match the sophistication level implied by the request
- If this is for a specific exam (GMAT, SAT, etc.), create questions that would genuinely help someone prepare
- Use your expertise to determine what types of questions would be most valuable
- Session ID: ${uniqueToken}

Make this quiz something a serious student would find genuinely useful for their preparation.
  `;
}

// Simplified variability system using pure prompt intelligence
export function getVariabilityInstructions(
  sessionFingerprint?: string, 
  difficulty: string = "Medium",
  userId?: string
): string {
  const fingerprint = sessionFingerprint || generateSessionFingerprint(Date.now().toString(), userId);
  
  return generateIntelligentVariabilityPrompt(fingerprint, difficulty);
}

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
export function parseQuiz(raw: string, expectedQuestionCount?: number): GeneratedQuiz {
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
        
  // Handle question count mismatch by truncating if needed
  if (expectedQuestionCount !== undefined && totalQuestions !== expectedQuestionCount) {
    console.log(`Adjusting question count: Generated ${totalQuestions}, requested ${expectedQuestionCount}`);
    
    if (totalQuestions > expectedQuestionCount) {
      // Truncate excess questions
      const excess = totalQuestions - expectedQuestionCount;
      console.log(`Truncating ${excess} excess questions`);
      
      // First truncate from standalone questions
      if (quiz.questions && quiz.questions.length > 0) {
        const standaloneToRemove = Math.min(excess, quiz.questions.length);
        quiz.questions = quiz.questions.slice(0, quiz.questions.length - standaloneToRemove);
        console.log(`Removed ${standaloneToRemove} standalone questions`);
      }
      
      // If still need to remove more, truncate from question groups
      let remainingToRemove = totalQuestions - expectedQuestionCount - (quiz.questions?.length || 0);
      const groupedCurrent = quiz.question_groups?.reduce((sum, group) => sum + (group.questions?.length || 0), 0) || 0;
      remainingToRemove = Math.min(remainingToRemove, groupedCurrent);
      
      if (remainingToRemove > 0 && quiz.question_groups) {
        for (let i = quiz.question_groups.length - 1; i >= 0 && remainingToRemove > 0; i--) {
          const group = quiz.question_groups[i];
          if (group.questions && group.questions.length > 0) {
            const toRemoveFromGroup = Math.min(remainingToRemove, group.questions.length);
            group.questions = group.questions.slice(0, group.questions.length - toRemoveFromGroup);
            remainingToRemove -= toRemoveFromGroup;
            
            // Remove empty groups
            if (group.questions.length === 0) {
              quiz.question_groups.splice(i, 1);
            }
          }
        }
      }
    } else {
      // If we have fewer questions than expected, log a warning but continue
      console.warn(`Generated ${totalQuestions} questions, but ${expectedQuestionCount} were requested. Continuing with available questions.`);
    }
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

// ----- Extraction Helper -----
export function extractValidQuestions(raw: string, expectedQuestionCount?: number) {
  const quiz = parseQuiz(raw, expectedQuestionCount);
  return { validQuestions: quiz.questions, validQuestionGroups: quiz.question_groups, metadata: quiz };
}

// All exam-specific intelligence is now handled through natural language prompting
// The AI will understand exam context from the user's request and respond appropriately
