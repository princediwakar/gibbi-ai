// Path: lib/priority-engine/seed-exam-weights.ts
// Seed script to populate exam_topic_weights table with JEE Main data
// Run once after migration

import { supabaseAdmin } from "@/lib/supabase/admin";

// Default C_tier caps by difficulty tier (minutes)
const DEFAULT_C_TIER: Record<string, number> = {
  foundation: 30,
  application: 45,
  advanced: 60,
  expert: 75,
};

const EXAM_NAME = "JEE Main";

const TOPIC_DATA = [
  // Physics
  { topic: "Kinematics", subject: "Physics", weight: 0.05, freq: 45, tier: "foundation" as const },
  { topic: "Laws of Motion", subject: "Physics", weight: 0.07, freq: 58, tier: "application" as const },
  { topic: "Work, Energy and Power", subject: "Physics", weight: 0.06, freq: 52, tier: "application" as const },
  { topic: "Rotational Motion", subject: "Physics", weight: 0.08, freq: 65, tier: "advanced" as const },
  { topic: "Thermodynamics", subject: "Physics", weight: 0.05, freq: 42, tier: "advanced" as const },
  { topic: "Electrostatics", subject: "Physics", weight: 0.08, freq: 68, tier: "application" as const },
  { topic: "Current Electricity", subject: "Physics", weight: 0.07, freq: 55, tier: "application" as const },
  { topic: "Optics", subject: "Physics", weight: 0.06, freq: 50, tier: "advanced" as const },
  { topic: "Modern Physics", subject: "Physics", weight: 0.08, freq: 72, tier: "advanced" as const },
  // Chemistry
  { topic: "Atomic Structure", subject: "Chemistry", weight: 0.06, freq: 55, tier: "foundation" as const },
  { topic: "Chemical Bonding", subject: "Chemistry", weight: 0.08, freq: 70, tier: "application" as const },
  { topic: "Chemical Equilibrium", subject: "Chemistry", weight: 0.05, freq: 40, tier: "advanced" as const },
  { topic: "Coordination Compounds", subject: "Chemistry", weight: 0.06, freq: 52, tier: "advanced" as const },
  { topic: "Organic Chemistry Basics", subject: "Chemistry", weight: 0.10, freq: 85, tier: "advanced" as const },
  { topic: "Hydrocarbons", subject: "Chemistry", weight: 0.07, freq: 60, tier: "advanced" as const },
  // Mathematics
  { topic: "Complex Numbers", subject: "Mathematics", weight: 0.04, freq: 35, tier: "application" as const },
  { topic: "Matrices and Determinants", subject: "Mathematics", weight: 0.05, freq: 42, tier: "application" as const },
  { topic: "Calculus", subject: "Mathematics", weight: 0.15, freq: 120, tier: "advanced" as const },
  { topic: "Coordinate Geometry", subject: "Mathematics", weight: 0.08, freq: 68, tier: "application" as const },
  { topic: "Vector Algebra", subject: "Mathematics", weight: 0.05, freq: 40, tier: "advanced" as const },
  { topic: "Probability and Statistics", subject: "Mathematics", weight: 0.06, freq: 50, tier: "application" as const },
];

export async function seedExamTopicWeights() {
  console.log(`[Seed] Populating exam_topic_weights for ${EXAM_NAME}...`);

  const rows = TOPIC_DATA.map((t) => ({
    exam_name: EXAM_NAME,
    subject: t.subject,
    topic: t.topic,
    skill_domain: t.topic, // Same as topic for JEE
    difficulty_tier: t.tier,
    exam_weight: t.weight,
    question_frequency_10yr: t.freq,
    c_tier_cap: DEFAULT_C_TIER[t.tier],
    estimated_minutes_to_mastery: null,
  }));

  const { error } = await supabaseAdmin
    .from("exam_topic_weights")
    .upsert(rows, { onConflict: "exam_name,skill_domain" });

  if (error) {
    console.error("[Seed] Failed to upsert exam_topic_weights:", error);
    throw error;
  }

  console.log(`[Seed] Successfully populated ${rows.length} topics for ${EXAM_NAME}`);
}

// Also add NEET and other exams as stubs (for future)
const NEET_TOPICS = [
  // Physics
  { topic: "Mechanics", subject: "Physics", weight: 0.25, tier: "application" as const },
  { topic: "Electrodynamics", subject: "Physics", weight: 0.25, tier: "advanced" as const },
  { topic: "Thermodynamics", subject: "Physics", weight: 0.15, tier: "advanced" as const },
  { topic: "Modern Physics", subject: "Physics", weight: 0.20, tier: "advanced" as const },
  { topic: "Optics", subject: "Physics", weight: 0.15, tier: "advanced" as const },
  // Chemistry
  { topic: "Physical Chemistry", subject: "Chemistry", weight: 0.35, tier: "application" as const },
  { topic: "Inorganic Chemistry", subject: "Chemistry", weight: 0.30, tier: "advanced" as const },
  { topic: "Organic Chemistry", subject: "Chemistry", weight: 0.35, tier: "advanced" as const },
  // Biology
  { topic: "Cell Structure and Function", subject: "Biology", weight: 0.10, tier: "foundation" as const },
  { topic: "Human Physiology", subject: "Biology", weight: 0.25, tier: "application" as const },
  { topic: "Plant Physiology", subject: "Biology", weight: 0.15, tier: "application" as const },
  { topic: "Genetics and Evolution", subject: "Biology", weight: 0.25, tier: "advanced" as const },
  { topic: "Ecology and Environment", subject: "Biology", weight: 0.25, tier: "advanced" as const },
];

export async function seedAllExamWeights() {
  await seedExamTopicWeights();

  const neetRows = NEET_TOPICS.map((t, i) => ({
    exam_name: "NEET",
    subject: t.subject,
    topic: t.topic,
    skill_domain: t.topic,
    difficulty_tier: t.tier,
    exam_weight: t.weight,
    question_frequency_10yr: 0,
    c_tier_cap: DEFAULT_C_TIER[t.tier],
    estimated_minutes_to_mastery: null,
  }));

  await supabaseAdmin
    .from("exam_topic_weights")
    .upsert(neetRows, { onConflict: "exam_name,skill_domain" });

  console.log("[Seed] NEET weights populated");
}