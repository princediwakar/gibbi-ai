// ----- Session-Based Variability Engine -----
// Simplified approach using intelligent prompting instead of complex programmatic logic

// Session fingerprint generation (Web Crypto API — Edge + Client compatible)
function buf2hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Slice(input: string, length: number): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return buf2hex(hash).slice(0, length);
}

function randomHex(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

let _fingerprintSeed: string | null = null;
async function getContentHash(content: string): Promise<string> {
  _fingerprintSeed ??= randomHex(4);
  const encoder = new TextEncoder();
  const data = encoder.encode(content.toLowerCase().trim() + _fingerprintSeed);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return buf2hex(hash).slice(0, 8);
}

export async function generateSessionFingerprint(content: string, userId?: string): Promise<string> {
  const timestamp = Date.now();
  const contentHash = await getContentHash(content);
  const userComponent = userId ? await sha256Slice(userId, 4) : 'anon';
  const randomComponent = randomHex(4);

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

  return `You are an elite educational assessment architect. Your objective is to generate ${remaining} high-stakes exam questions at the "${difficulty}" difficulty level in ${language}.

# CORE DIRECTIVES
1. AUTHENTICITY: Questions must mirror the cognitive load of actual competitive exams (e.g., GMAT, GRE, SAT). No trivial recall.
2. DISTRACTOR CRAFTSMANSHIP: Every incorrect option must target a specific, documented pedagogical trap or misconception.
3. COGNITIVE DEMAND: Require multi-step reasoning, synthesis, or applied analysis.

# VARIABILITY INJECTOR
${variability}

${customInstructions ? `# SPECIFIC CONSTRAINTS\n${customInstructions}` : ''}

# OUTPUT SCHEMA (STRICT JSON ONLY)
You must output a raw JSON object conforming EXACTLY to this TypeScript interface. Do not wrap in markdown or code blocks.

interface QuizResponse {
  title: string;
  description: string;
  topic: string;
  subject: string;
  language: "${language}";
  difficulty: "${difficulty}";
  question_groups?: Array<{
    group_id: string;
    group_title: string;
    supporting_content: {
      type: "text" | "table" | "graph";
      content: any; // Raw text, or structured table/graph data
      caption?: string;
    };
    questions: Question[];
  }>;
  questions: Question[]; // Standalone questions
}

interface Question {
  question_text: string;
  options: { A: string; B: string; C: string; D: string };
  correct_option: "A" | "B" | "C" | "D";
  explanation: string; // Step-by-step logic proving the answer
  topics: string[]; // 1-2 specific sub-topics
  difficulty_tier: "foundation" | "application" | "advanced" | "expert";
  distractor_analysis: { A: string; B: string; C: string; D: string }; // Specifically why a student would wrongly pick this
  skill_domain: string;
  time_estimate_seconds: number; // 30-180
  misconception: string; // The primary fallacy tested
}

Execute immediately. Return only the JSON object.`;
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
export async function getVariabilityInstructions(
  sessionFingerprint?: string,
  difficulty: string = "Medium",
  userId?: string
): Promise<string> {
  const fingerprint = sessionFingerprint || await generateSessionFingerprint(Date.now().toString(), userId);

  return generateIntelligentVariabilityPrompt(fingerprint, difficulty);
}
