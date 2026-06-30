Here is the finalized, streamlined production plan. We have completely stripped out the Battle Mode features (eliminating peer-to-peer competition complexity) and removed the hardcoded topic weights in favor of a maintenance-free, Zero-Config Readiness Index backed by a static JSON taxonomy.

The system is now a pure, hyper-focused, real-time AI tutor.

---

# GibbiAI: Final Production Plan — Pure LLM-Native Tutor

## 1. Executive Architecture Vision

The system operates exclusively as an on-demand tutoring engine for competitive exams (JEE, NEET, UPSC, GMAT, etc.). We rely on a synchronous, context-cached LLM (DeepSeek-V4-Flash) to generate deeply personalized multiple-choice questions in real-time based on a Spaced Repetition (SM-2) queue.

**What is gone:** The async content factory, pgvector, blind verification pipelines, peer-to-peer Battle Mode, and database-driven exam topic weights.

---

## 2. User Experience (UX) and Interface (UI) Design

### 2.1 Frictionless Onboarding (`/setup`)

Optimized purely for time-to-first-question.

1. **Exam and Temporal Calibration:** A single dropdown to select the target exam (e.g., "JEE Main"). A mandatory date picker captures the exam date. The client instantly displays the assigned temporal strategy: "Foundation mode" (>90 days), "Acceleration mode" (30-90 days), or "Triage mode" (<30 days).
2. **Baseline Self-Assessment:** The user sees the high-level subjects for their exam (e.g., Physics, Chemistry, Mathematics). They tap a segmented control (Weak / Okay / Strong) for each. This seeds the `mastery_score` priors at `0.25`, `0.5`, or `0.75`.
3. **Instant Session Launch:** Tapping "Start my first session" fires `POST /api/session/start`. No dashboard, no tutorial. The first AI-generated question renders within 3 seconds.

### 2.2 The Session Player (`/session/[session_id]`)

* **Question Rendering:** Uses the existing KaTeX-enabled `QuizPlayer`.
* **Inline Feedback:** Upon selecting an option, the UI locks. The `AnswerFeedback` component slides in, displaying the universal explanation AND the specific `distractor_analysis` for the chosen option. If correct, it explains the right answer plus the trap of the most common wrong answer.
* **Pacing:** The "Next Question" button disables for 2 seconds to ensure the student absorbs the distractor analysis.
* **The "Reveal Answer" Affordance:** A ghost-style button instantly surfaces the explanation but flags the telemetry with `was_revealed: true`, excluding it from SM-2 mastery calculations.

### 2.3 The War Room Dashboard (`/dashboard`)

Four elements above the fold, heavily prioritizing action:

1. **The Deterministic Directive:** One server-computed sentence driven by the SM-2 queue (e.g., "Review 3 due concepts in Physics.").
2. **Temporal Urgency:** Days remaining until the target exam.
3. **Readiness Index:** A zero-config, 100-point metric reflecting overall mastery (e.g., "Readiness: 68/100").
4. **Primary Action:** A massive "Start Session" button.

### 2.4 Product-Led Growth & Sharing (`/s/[token]`)

Upon completing a session, the user can share their result.

* **The Card:** `@vercel/og` dynamically generates a social card showing the exam, the score (e.g., 8/10), the topic, and the explicit mastery delta (e.g., 38% → 61%).
* **The Funnel:** Unauthenticated users clicking the link see the social card and a single CTA: "Start your free prep," routing directly to `/setup`.

---

## 3. Database & Taxonomy Architecture

### 3.1 Static JSON Taxonomy (Zero Maintenance)

Instead of database tables for exams and topics, maintain a single static `taxonomies.json` file in the codebase. This powers the onboarding UI and strictly limits the LLM's allowed topics.

```json
{
  "JEE Main": {
    "Physics": ["Kinematics", "Laws of Motion", "Work, Energy and Power", "Rotational Motion", "Thermodynamics", "Electrostatics", "Current Electricity", "Optics", "Modern Physics"],
    "Chemistry": ["Atomic Structure", "Chemical Bonding", "Thermodynamics", "Equilibrium", "Coordination Compounds", "Organic Chemistry", "Hydrocarbons"],
    "Mathematics": ["Complex Numbers", "Matrices and Determinants", "Calculus", "Coordinate Geometry", "Vector Algebra", "Probability"]
  }
}

```

### 3.2 The PostgreSQL Schema (Supabase)

```sql
-- 1. Exam Profiles
CREATE TABLE exam_profiles (
  profile_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_name text NOT NULL,
  target_date date NOT NULL,
  time_mode text NOT NULL DEFAULT 'foundation' CHECK (time_mode IN ('foundation', 'acceleration', 'triage')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. Concept Mastery (The SM-2 Engine)
CREATE TABLE concept_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_profile_id uuid NOT NULL REFERENCES exam_profiles(profile_id) ON DELETE CASCADE,
  skill_domain text NOT NULL,
  mastery_score real NOT NULL DEFAULT 0.5 CHECK (mastery_score BETWEEN 0 AND 1),
  total_attempted integer NOT NULL DEFAULT 0,
  total_correct integer NOT NULL DEFAULT 0,
  review_interval_days integer NOT NULL DEFAULT 1,
  review_ease_factor real NOT NULL DEFAULT 2.5,
  next_review_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, exam_profile_id, skill_domain)
);

-- 3. Sessions
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_profile_id uuid NOT NULL REFERENCES exam_profiles(profile_id) ON DELETE CASCADE,
  questions_json jsonb NOT NULL,
  target_domains text[] NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- 4. Question Results (Telemetry)
CREATE TABLE question_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_profile_id uuid NOT NULL REFERENCES exam_profiles(profile_id),
  skill_domain text NOT NULL,
  selected_option text CHECK (selected_option IN ('A','B','C','D')),
  is_correct boolean NOT NULL,
  was_revealed boolean NOT NULL DEFAULT false,
  time_to_answer_ms integer,
  answered_at timestamptz DEFAULT now(),
  UNIQUE (session_id, question_id)
);

-- 5. Mastery History
CREATE TABLE mastery_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_profile_id uuid NOT NULL REFERENCES exam_profiles(profile_id),
  skill_domain text NOT NULL,
  mastery_score real NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

-- 6. Result Cards
CREATE TABLE result_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_type text NOT NULL CHECK (card_type IN ('session', 'recovery')),
  card_data jsonb NOT NULL,
  share_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

```

### 3.3 The Idempotent Postgres RPC

To prevent race conditions, rapid clicking, or multi-tab issues from double-counting mastery telemetry, answer ingestion runs through an atomic Postgres function.

```sql
CREATE OR REPLACE FUNCTION submit_answer(
  p_session_id uuid, p_question_id text, p_user_id uuid, p_exam_profile_id uuid,
  p_skill_domain text, p_selected_option text, p_is_correct boolean,
  p_was_revealed boolean, p_time_to_answer_ms integer
) RETURNS TABLE(inserted boolean) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO question_results (
    session_id, question_id, user_id, exam_profile_id, skill_domain,
    selected_option, is_correct, was_revealed, time_to_answer_ms
  )
  VALUES (
    p_session_id, p_question_id, p_user_id, p_exam_profile_id, p_skill_domain,
    p_selected_option, p_is_correct, p_was_revealed, p_time_to_answer_ms
  )
  ON CONFLICT (session_id, question_id) DO UPDATE SET answered_at = question_results.answered_at
  RETURNING (xmax = 0) AS inserted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

```

---

## 4. Server and API Route Topology

| Route Path | Method | Core Responsibility |
| --- | --- | --- |
| `/api/session/start` | POST | Identifies due/weak topics from `concept_mastery`, builds the dynamic user prompt, queries DeepSeek via SSE, validates the JSON, and inserts into `sessions`. |
| `/api/session/answer` | POST | Executes the `submit_answer` RPC. Returns localized `distractor_analysis` instantly from the frozen session JSON. Executed with `keepalive: true`. |
| `/api/session/complete` | POST | Runs the SM-2 interval calculations for the session, updates `concept_mastery`, and provisions the shareable result card. |
| `/s/[token]` | GET | Public, unauthenticated route. Renders the Vercel OG image card and the CTA to start onboarding. |

---

## 5. The Large Language Model Integration Contract

### 5.1 Model Configuration

* **Model:** `deepseek-v4-flash`
* **Features:** `{"thinking": {"type": "disabled"}}` (to eliminate TTFT latency) and `{"response_format": {"type": "json_object"}}`.

### 5.2 System Prompt (Immutable & Cached)

Hardcode the exact 1,500-token prompt block drafted previously. **Do not inject any dynamic data into this string.** DeepSeek will cache this string for subsequent users, reducing the input cost from $0.14/M to $0.0028/M.

### 5.3 User Message (Dynamic)

Generated per session using the SM-2 queue and the JSON taxonomy:

```text
Exam: JEE Main 2026
Time mode: acceleration (41 days remaining)

Target domains and current mastery:
- Rotational Motion: 0.38 (recent errors: torque direction errors, moment of inertia of compound bodies)
- Optics: 0.52 (recent errors: sign convention in lens maker's formula, total internal reflection boundaries)
- Electrostatics: 0.22 (recent errors: Gauss's law application on cylindrical symmetry)

Questions requested: 10
Difficulty distribution: 3 easy (difficulty 1), 5 medium (difficulty 2), 2 hard (difficulty 3)

Do not repeat question stems from prior sessions in this domain. Ensure strict adherence to the defined skill domains.

```

---

## 6. Mathematical Engines

### 6.1 Spaced Repetition (SM-2 Algorithm)

Runs during `/api/session/complete`. Excludes any `question_results` row where `was_revealed = true`.

1. **Quality ($Q$):** Graded 0–5 based on correctness and time-to-answer vs the LLM's `time_estimate_seconds`.
2. **Ease Factor ($EF$):** $EF_{new} = EF_{old} + (0.1 - (5 - Q) \times (0.08 + (5 - Q) \times 0.02))$
3. **Interval ($I$):** If streak = 1, interval = 1. If streak = 2, interval = 6. Otherwise, $I_{new} = \lceil I_{old} \times EF_{new} \rceil$.

### 6.2 The Zero-Config Readiness Index

Calculated dynamically for the dashboard without relying on hardcoded topic weights or external cohort data. It treats every domain in the exam's taxonomy file as equally necessary for full preparedness.

$$\text{Readiness Index} = \left( \frac{\sum_{i=1}^{N} M_i}{N} \right) \times 100$$


*(Where $M_i$ is the `mastery_score` for a domain, and $N$ is the total number of domains listed for that exam in `taxonomies.json`)*