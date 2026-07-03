# Gibbi AI — JEE-First Master Plan
### Product Architecture, Build Sequence & Go-To-Market
*Version 4.0 — Locked. Standalone document, ready to hand to engineering, growth, and leadership.*

---

## 0. TL;DR

- **One vertical first:** JEE (Main). Not NEET, not UPSC.
- **One bulletproof metric, stated as a pair, not a single number:** Verified Interval Accuracy (VIA) — *coverage* (% of users whose actual NTA percentile lands inside their projected band) reported **alongside** *sharpness* (median band width). Coverage without a width cap is gameable by predicting nothing, confidently, everywhere.
- **One data pipeline.** Every session feeds the model. "Quiet" sessions hide the score update from the user; the engine never stops learning from them.
- **Decoupled acquisition, with an honest cold start.** A free, standalone Rank Predictor ships in week 2, calibrated at launch against public NTA normalization tables (2025/2026 cycles) as a bootstrap prior, then blended toward proprietary data as it accumulates.
- **Ground-truth validation before Sprint 1**, explicitly scoped as a qualitative friction test, not a statistical validation of pedagogy.
- **Event-triggered GTM, with a dated calendar underneath it** — the launch fires on "NTA opens registration," but hiring, contracting, and creator outreach still run against real target dates.

---

## 1. North Star & Operating Principles

**North Star Metric: Verified Interval Accuracy (VIA) — reported as a pair**

| Component | Definition | Why it's paired |
|---|---|---|
| **Coverage** | % of active users (≥20 tracked sessions) whose actual NTA percentile lands inside their frozen projected band | Alone, this is gameable — a band of ±15 points hits 80% coverage while being useless |
| **Sharpness** | Median band width across the same cohort | Alone, this is gameable the other way — a narrow band with low coverage is just confident and wrong |

**The two are never reported separately.** Every internal dashboard, every public accuracy report, every creator pitch states both: *"80% coverage at a median width of 4 percentile points"* — not *"80% accurate."* If Sprint 6 (Calibration Infrastructure) ever shows coverage improving while sharpness widens, that is a regression, not a win, and gets treated as one.

**Operating Principles:**

1. **Decoupled growth:** acquisition tools (the Predictor) don't block on core infrastructure builds.
2. **No blind spots:** no feature ships two data pipelines. Everything feeds the central algorithm.
3. **Pedagogy over math:** an unconstrained time-efficiency optimizer will always prefer cheap topics over expensive-but-critical ones. The Priority Engine's time term is capped for exactly this reason (Section 3.2).
4. **Do no harm:** the majority of users are highly stressed minors. Every mechanic must reduce exam anxiety, not exploit it. Visible-score opt-outs are mandatory, not a settings-menu afterthought.
5. **Physical ground-truthing, scoped honestly:** live tests with real students catch UI and pedagogy friction fast. They are a qualitative gate. They do not substitute for statistical validation against real exam outcomes — that only comes from the Calibration Loop (Section 3.4).
6. **No metric ships without a way to be caught gaming itself.** VIA's pairing, the Priority Engine's cap, and the cold-start blending rule (Section 3.5) all exist because of this principle.

---

## 2. Market Selection: Why JEE First

| Filter | JEE (Main) | NEET | UPSC |
|---|---|---|---|
| Feedback loop | 2 sessions/year (Jan + Apr) | 1 session/year | 1 prelims/year, multi-stage over 12+ months |
| Content format | MCQ + NVQ, objective, cleanly gradable | Mostly MCQ, but Biology is memorization-heavy | Essay, GS, ethics — not algorithmically gradable |
| "Predict my score" habit | Huge — unofficial predictors go viral every session | Present, smaller tooling ecosystem | Doesn't meaningfully exist |
| Calibration speed | Two data points/year against a public percentile formula | One data point/year | Extremely slow, tiny usable n, huge variance |
| Willingness to pay | High — families already spend heavily on coaching | High | High, smaller addressable base |

**Decision: JEE Main first.** It's the only vertical where diagnose → drill → retest → recalibrate can be built and proven twice a year against public, immovable data.

---

## 3. Product Architecture

### 3.1 The Unified Pipeline & "Quiet Sessions"

No isolated sandbox. Every interaction feeds the model.

```
sessions {
  id
  user_id
  session_intent: 'tracked' | 'quiet'
  concept_ids[]
  responses[]
}
```

- Both `tracked` and `quiet` sessions write to `concept_mastery` / `mastery_history` via the SM-2 engine.
- `quiet` only suppresses the *visible* Projected Interval update — the model still learns.
- UI copy: *"This drill won't move your visible projection today, but it still helps Gibbi understand your baseline."*

### 3.2 The Tiered Priority Engine

$$ \text{Priority Score} = \frac{\text{Exam Weight} \times \text{Knowledge Gap} \times \text{Forgetting Risk}}{\min(\text{Estimated Minutes to Mastery},\ C_{\text{tier}})} $$

- **Uncapped, this formula fails predictably:** it always prefers cheap topics over expensive-but-structurally-critical ones (e.g., Rotational Mechanics gets deferred forever because it's never the fastest win).
- **$C_{\text{tier}}$ is per-topic-tier, not global**, and is *derived*, not asserted:
  - During Sprint 0/1, log actual completion times per topic and difficulty tier.
  - Set $C_{\text{tier}}$ at the 75th percentile of observed completion time for that tier — high enough to allow genuine deep-intervention topics through the cap, low enough to still bound worst-case session length.
  - Recompute quarterly as the completion-time dataset grows; this is a living parameter, not a launch-day constant.
- **Exam Weight** comes from actual JEE Main past-10-year question-frequency data by topic — not a guess.

### 3.3 The Comeback Queue (Spaced Escalation)

- **Immediate:** one same-difficulty retry, gated behind a mandatory worked explanation.
- **+24–48 hrs:** one same-difficulty variant, different surface features.
- **+5–7 days:** one harder variant, testing conceptual transfer.
- All three must clear, spaced, to fully clear the queue and recover lost projected points. This is deliberately slower than an instant-gratification redo loop — the product's promise is mastery, not a quick confidence hit.

### 3.4 The Calibration Loop

1. **Freeze** each active user's confidence interval 7 days before the exam.
2. **Capture** actual percentile post-results, opt-in only.
3. **Compute** VIA as the coverage/sharpness pair across the cohort, segmented by usage level.
4. **Recalibrate** the model's weightings against the real error.
5. **Publish** an anonymized coverage + sharpness report — doubles as the next acquisition wave's pitch (Section 5).

### 3.5 Cold-Start Calibration (new — closes the Sprint 1 data gap)

The Predictor ships in week 2, before any proprietary user history exists. It cannot be calibrated against data that doesn't exist yet, so it doesn't try to fake precision:

- **Day 1 prior:** confidence intervals are built from publicly available NTA percentile-to-marks normalization tables from the 2025 and 2026 cycles. This is disclosed in-product, plainly: *"Your first prediction uses public NTA data — it gets sharper the more you practice with Gibbi."*
- **Blending rule:** as a user accumulates tracked sessions, their band shifts from the public prior toward a proprietary estimate on a simple weighted schedule (e.g., full weight to the public prior at 0 sessions, full weight to the proprietary model by ~20 sessions — exact curve tuned once Sprint 1 data exists, not fixed here).
- **Cohort-level bootstrap:** before any individual has 20 sessions, cohort-level aggregates (not individual bands) still get blended in as soon as n is large enough to be stable — this is what lets the *first* published accuracy report (Section 5) happen on the Session 1 calibration checkpoint instead of waiting for Session 2.

---

## 4. Build Sequence (Decoupled & Front-Loaded)

| Phase | Duration | Deliverable | Key Focus |
|---|---|---|---|
| **Sprint 0** | 1 wk | Ground-truth friction test | Paper/prototype tests of the Focus Hub and Comeback Queue with real JEE students in Patna coaching centers. **Scope note: this is a qualitative gate for UI/pedagogy friction, not a statistical validation — it does not certify accuracy or mastery outcomes, and no downstream claim should cite it as such.** |
| **Sprint 1** | 2 wks | Standalone Rank Predictor | Build and deploy `/predictor`: phone OTP gate, confidence-interval logic, cold-start prior per Section 3.5. Ships immediately. |
| **Sprint 2** | 2 wks | Unify data pipeline | Deprecate sandbox; implement `tracked`/`quiet` tagging in `/api/session/start`. |
| **Sprint 3** | 2 wks | Tiered Priority Engine | Build `lib/priority-engine.ts`; derive initial $C_{\text{tier}}$ values from Sprint 0/1 completion-time logs. |
| **Sprint 4** | 2 wks | Comeback Queue | Spaced-escalation scheduler (`lib/comeback-queue.ts`). |
| **Sprint 5** | 3 wks | Focus Hub (Dashboard) | Confidence-interval hero metric, single CTA, "Hide Projection" toggle. |
| **Sprint 6** | 2 wks | Calibration infrastructure | `lib/calibration.ts` — freeze bands, capture results, compute coverage + sharpness, publish report. |
| **Sprint 7** | 1 wk | Viral security | Token expiry on `/s/[token]` to prevent assessment answer leakage. |

**~15 weeks core build**, roughly July–October 2026 — the Predictor front-loaded into weeks 1–2 so it's live well before the registration-window traffic spike.

---

## 5. Go-To-Market: The Wedge

**The insight:** don't invent a new habit. JEE aspirants already obsessively use unofficial rank predictors post-exam and during registration windows.

**Event trigger, with a dated planning calendar underneath it** (dates are NTA's expected pattern from the 2025–2026 cycles; re-confirm against the official brochure once NTA publishes it, but hiring/contracting/outreach still need real target dates to plan against):

| Target date | Event | Gibbi action |
|---|---|---|
| Now – Sept 2026 | Pre-launch | Build (Section 4); begin creator outreach conversations early — partnership lead time is real even if launch is event-triggered |
| **Trigger: NTA opens Session 1 registration** (expected late Oct 2026) | Peak search intent | **Launch the Rank Predictor.** Fires on the actual registration-window opening, not a fixed calendar date |
| Nov 2026 | Registration window active | Creator partnerships go live (5–10 exclusive-access JEE Telegram/YouTube channels) |
| Dec 2026 – Jan 2027 | Final prep window | Core app growth push: daily-drill habit formation |
| **Trigger: 7 days pre-exam** (Session 1 expected last week of Jan 2027) | Freeze window | Calibration Loop step 1 |
| **Trigger: Session 1 results released** (expected ~Feb 2027) | **Checkpoint #1** | Capture actual percentiles, compute coverage + sharpness, publish report — this is also a natural second viral moment ("predicted band vs. actual" is inherently shareable) |
| Feb–Mar 2027 | Session 2 registration | Second Predictor push, now backed by a published, real accuracy pair instead of a launch claim |
| **Trigger: Session 2 exam** (expected early Apr 2027) | Freeze again | — |
| **Trigger: Session 2 results** (expected ~Apr 2027) | **Checkpoint #2** | Refine model; this is the go/no-go gate for the NEET port (Section 10) |

**The hook:** the Predictor outputs a confidence interval, not a fake-precise single number — immediate trust differentiation versus competitors.

**The gate:** phone number required to see the subject-wise breakdown.

**The upsell:** *"You're projected at 87–90. Let Gibbi build a 15-minute daily plan aimed at pushing that toward 94–96."* → funnels into the core app.

**Distribution:** zero broad ad spend at launch. 5–10 exclusive creator partnerships, pitched initially on the product's honesty (bands, not fake precision), then — after Checkpoint #1 — pitched on a real published number.

---

## 6. Trust & Safety (Non-Negotiable)

1. **Anxiety opt-out:** a highly visible "Hide Projection" toggle ships with the dashboard in Sprint 5, not added later.
2. **Data minimization:** DPDP Act compliance. Phone numbers and actual-score reports are explicit opt-in, easily revocable.
3. **Constructive framing:** creator partnerships and UI copy are vetted against fear-based messaging. Tone is "guided, guaranteed progress," never "you are falling behind." Any creator whose existing content style leans on anxiety-based hooks is not partnered with, even if their audience size is attractive.
4. **Minors-first design:** the majority of users are 15–18. No mechanic is approved if its primary engagement lever is amplifying comparison anxiety — results-day sharing is available, opt-in, never a default public leaderboard.

---

## 7. Metrics & Success Criteria

| Metric | What it proves | Target (End of Session 1 cycle, ~Feb 2027) |
|---|---|---|
| VIA — coverage | Bands aren't systematically wrong | 80% of active users (≥20 sessions) land inside their projected band |
| VIA — sharpness (paired, always reported together) | Bands aren't wide enough to be meaningless | Median band width ≤ 4 percentile points at 80% coverage |
| Predictor → app conversion | Wedge product acquires effectively | Baseline established from first 4 weeks of live data — no fabricated pre-launch target |
| D7 retention on daily drill | Habit loop is real | Benchmarked against category once available |
| Pipeline unification | Tech debt actually cleared | 100% of sessions, tracked or quiet, write to `concept_mastery` |
| Seed-share leakage rate | Viral loop isn't corrupting the assessment pool | Near-zero repeat-answer correlation post Sprint 7 |

---

## 8. Team (lean, v1)

| Role | Why it exists |
|---|---|
| Founder/PM | Owns VIA (both halves) as north star; final call on any feature trading honesty for engagement |
| 2 full-stack engineers | Core app, dashboard, Predictor |
| 1 data/ML engineer | Priority Engine, Calibration Loop, cold-start blending, exam-weight datasets |
| 1 subject-matter reviewer (ex-JEE coach/selector) | Reviews every difficulty curve and Comeback Queue escalation; runs Sprint 0 alongside the PM |
| 1 growth/partnerships lead | Creator relationships, Predictor launch, results-day virality |

---

## 9. Monetization

- **Free:** Rank Predictor (unlimited use), 1 subject of adaptive practice, capped daily drills.
- **Paid ("Gibbi Pro"):** full Physics/Chemistry/Math adaptive engine, Comeback Queue, full analytics, no drill caps.
- Pricing is validated via a willingness-to-pay survey with the first Predictor cohort (Nov 2026) rather than fixed here — Indian ed-tech subscription pricing moves fast enough that a number locked into this document today would likely be stale by launch.

---

## 10. Expansion Gates (NEET & UPSC)

- **Phase 2 (NEET):** gated entirely by Checkpoint #2 (~Apr 2027). Begins only if the coverage+sharpness pair holds up across two consecutive real exams — not just coverage alone. Same engine, same wedge pattern, Biology-reweighted content.
- **Phase 3 (UPSC):** indefinitely tabled. Different pedagogy (subjective grading), different calibration cadence (single annual checkpoint, 12+ month cycle). Evaluated later as a fully separate product, not a reskin.

---

## 11. Changelog from v3

| v3 | v4 (this document) | Reason |
|---|---|---|
| VIA reported as coverage alone ("80% land in band") | VIA reported as coverage **+** sharpness, always paired | Coverage alone is gameable by widening the band |
| Predictor ships in Sprint 1 with no stated calibration source | Explicit cold-start prior from public NTA normalization tables, with a stated blending rule toward proprietary data | Otherwise Sprint 1 either fakes precision or stalls waiting for data that doesn't exist yet |
| Team and monetization sections removed | Restored, condensed | An executable blueprint still needs to answer who builds it and how it earns money |
| Registration-window trigger only, no dated scaffold | Event triggers kept, with a dated planning calendar underneath for hiring/contracting/outreach lead time | Event-triggered launch logic is correct; teams still need real dates to plan against |
| $C$ (hard cap) asserted as a single global constant | $C_{\text{tier}}$, per-topic-tier, derived empirically from Sprint 0/1 completion-time logs, recomputed quarterly | An asserted constant with no derivation method can't actually be set correctly on day one |
| Sprint 0 stated as a live test with no scope caveat | Sprint 0 explicitly scoped as a qualitative friction gate, not statistical validation | Prevents "we tested it in Patna" from being cited as more evidence than a one-week qualitative test can support |