// Path: components/landing/InteractiveDemoHero.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Lightbulb, TrendingUp, CheckCircle2, ChevronRight } from "lucide-react";

import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignInButton } from "@/components/SignInButton";
import taxonomy from "@/lib/taxonomies.json";
import demoQuestionsRaw from "@/lib/demo-questions.json";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type TaxonomyData = Record<string, Record<string, string[]>>;
const taxonomyData = taxonomy as unknown as TaxonomyData;
const EXAM_NAMES = Object.keys(taxonomyData).filter((k) => !k.startsWith("_"));

const demoQuestions = demoQuestionsRaw as unknown as {
  _generated_at: string;
  exams: Record<string, DemoEntry>;
};

// Pre-compute the set of exams that have a demo question.
const EXAMS_WITH_DEMO = new Set(Object.keys(demoQuestions.exams));

type Phase = "exam_select" | "question" | "reveal" | "cta";
type OptionKey = string;

interface DemoQuestion {
  question_text: string;
  options: Record<string, string>;
  correct_option: string;
  explanation: string;
  distractor_analysis: Record<string, string>;
  skill_domain: string;
  difficulty_tier: string;
  misconception: string;
  topics: string[];
}

interface DemoEntry {
  exam_name: string;
  subject: string;
  domain: string;
  question: DemoQuestion;
}

// ---------------------------------------------------------------------------
// Framer-motion variants
// ---------------------------------------------------------------------------

const fadeSlideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 28 },
  },
};

const cardEntrance = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 220, damping: 26, delay: 0.15 },
  },
};

const analysisSlideIn = {
  initial: { opacity: 0, height: 0, overflow: "hidden" },
  animate: {
    opacity: 1,
    height: "auto",
    transition: { type: "spring" as const, stiffness: 180, damping: 26, staggerChildren: 0.08 },
  },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
};

const analysisChild = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 220, damping: 24 },
  },
};

const ctaFadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 26, delay: 0.4 },
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function OptionButton({
  letter,
  text,
  isSelected,
  isRevealed,
  isCorrect,
  isTrap,
  onClick,
}: {
  letter: string;
  text: string;
  isSelected: boolean;
  isRevealed: boolean;
  isCorrect: boolean;
  isTrap: boolean;
  onClick: () => void;
}) {
  let borderClass = "border-border bg-card hover:border-border/80";
  if (isRevealed && isSelected) {
    borderClass = isCorrect
      ? "border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]"
      : "border-amber-500/40 bg-amber-500/5 shadow-[0_0_0_1px_rgba(245,158,11,0.15)]";
  }

  return (
    <button
      type="button"
      disabled={isRevealed}
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-4 rounded-xl border p-4 transition-all min-h-[48px] sm:min-h-[52px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !isRevealed && "cursor-pointer",
        isRevealed && "cursor-default",
        borderClass,
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
          isRevealed && isSelected && isCorrect
            ? "bg-emerald-500/15 text-emerald-600"
            : isRevealed && isSelected && !isCorrect
              ? "bg-amber-500/15 text-amber-600"
              : "bg-muted/60 text-muted-foreground",
        )}
      >
        {letter}
      </span>
      <span className="flex-1 text-left text-base font-medium text-foreground">
        {text}
      </span>
      {isRevealed && isTrap && (
        <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
          <TrendingUp className="h-3 w-3" />
          73% pick this
        </span>
      )}
      {isRevealed && isSelected && isCorrect && (
        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function InteractiveDemoHero() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const [exam, setExam] = useState<string>("");
  const [phase, setPhase] = useState<Phase>("exam_select");
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);

  // Resolve the demo question for the selected exam.
  const demoEntry = exam ? demoQuestions.exams[exam] : null;
  const question: DemoQuestion | null = demoEntry?.question ?? null;
  const hasDemo = exam ? EXAMS_WITH_DEMO.has(exam) : false;

  const isCorrect = selectedOption !== null && question !== null && selectedOption === question.correct_option;

  // If the user signs in after clicking the CTA, redirect automatically.
  useEffect(() => {
    if (showSignIn && user) {
      router.push("/setup");
    }
  }, [showSignIn, user, router]);

  // ---- Handlers ----

  const handleExamChange = useCallback(
    (value: string) => {
      setExam(value);
      setSelectedOption(null);
      setShowSignIn(false);
      // If this exam has a demo question, move to question phase.
      // If not, skip straight to CTA.
      if (EXAMS_WITH_DEMO.has(value)) {
        setPhase("question");
      } else {
        setPhase("cta");
      }
    },
    [],
  );

  const handleOptionClick = useCallback((key: OptionKey) => {
    if (phase !== "question") return;
    setSelectedOption(key);
    setPhase("reveal");
  }, [phase]);

  const handleCTA = useCallback(() => {
    if (!exam) return;
    if (!user) {
      localStorage.setItem("landingPrefill", JSON.stringify({ exam }));
      setShowSignIn(true);
    } else {
      router.push("/setup");
    }
  }, [exam, user, router]);

  // ---- Empty state: taxonomy failed to load ----
  if (EXAM_NAMES.length === 0) {
    return (
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-muted-foreground">
            We are updating our exam list. Please check back shortly.
          </p>
        </div>
      </section>
    );
  }

  // ---- Question options derived from demo data ----
  const options = question
    ? Object.entries(question.options).map(([key, text]) => ({ key, text }))
    : [];
  const correctOption = question?.correct_option ?? "";
  const isRevealed = phase === "reveal";

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-16 xl:gap-20">
          {/* ============================================================== */}
          {/* Left column: Headline + subtext                                */}
          {/* ============================================================== */}
          <motion.div
            className="flex-1 space-y-5 text-center lg:text-left lg:pt-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
            }}
          >
            <motion.h1
              className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              variants={fadeSlideUp}
            >
              Stop re-reading. Start retaining.
              <br />
              <span className="text-primary">
                See how GibbiAI spots your mistakes before you make them.
              </span>
            </motion.h1>

            <motion.p
              className="text-base text-muted-foreground sm:text-lg leading-relaxed"
              variants={fadeSlideUp}
            >
              Pick your exam. Answer one question. We&apos;ll show you exactly which
              misconception trips you up — and how to fix it for good.
            </motion.p>
          </motion.div>

          {/* ============================================================== */}
          {/* Right column: Interactive demo cards                           */}
          {/* ============================================================== */}
          <div className="w-full max-w-lg flex-shrink-0 lg:w-[420px]">
            {/* PHASE 1: Exam selector card */}
            <motion.div {...cardEntrance}>
              <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 shadow-sm sm:p-8">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="demo-exam-select"
                      className="text-sm font-medium text-foreground"
                    >
                      Which exam are you preparing for?
                    </label>
                    <Select value={exam} onValueChange={handleExamChange}>
                      <SelectTrigger id="demo-exam-select" className="h-10 w-full">
                        <SelectValue placeholder="Select your target exam..." />
                      </SelectTrigger>
                      <SelectContent>
                        {EXAM_NAMES.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* PHASE 2: Demo question card */}
            <AnimatePresence mode="wait">
              {phase === "question" && question && (
                <motion.div
                  key="question-card"
                  className="mt-6"
                  initial={{ opacity: 0, y: 24, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 26 }}
                >
                  <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 shadow-sm sm:p-8">
                    <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                      {demoEntry?.subject} / {demoEntry?.domain}
                    </span>

                    <p className="mt-5 text-base leading-relaxed text-foreground sm:text-lg">
                      {question.question_text}
                    </p>

                    <div className="mt-6 space-y-3">
                      {options.map(({ key, text }) => (
                        <OptionButton
                          key={key}
                          letter={key}
                          text={text}
                          isSelected={selectedOption === key}
                          isRevealed={isRevealed}
                          isCorrect={key === correctOption}
                          isTrap={selectedOption === key && key !== correctOption}
                          onClick={() => handleOptionClick(key)}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHASE 3: Analysis panel */}
            <AnimatePresence mode="wait">
              {phase === "reveal" && selectedOption && question && (
                <motion.div
                  key="analysis"
                  className="mt-6"
                  variants={analysisSlideIn}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 shadow-sm sm:p-8">
                    <motion.div variants={analysisChild} className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                          isCorrect ? "bg-emerald-500/10" : "bg-amber-500/10",
                        )}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Brain className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <h3 className={cn("text-lg font-semibold", isCorrect ? "text-emerald-600" : "text-amber-600")}>
                          {isCorrect
                            ? "Correct! Here's why most students get this wrong:"
                            : "73% of students pick this answer too. Here is exactly why:"}
                        </h3>
                      </div>
                    </motion.div>

                    <motion.div variants={analysisChild} className="mt-5 flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                        <Brain className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">The misconception</h3>
                        <p className="mt-1.5 leading-relaxed text-muted-foreground">
                          {question.misconception}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div variants={analysisChild} className="mt-5 flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                        <Lightbulb className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">The correct path</h3>
                        <p className="mt-1.5 leading-relaxed text-muted-foreground">
                          {question.explanation}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={analysisChild}
                      className="mt-6 flex items-center gap-6 rounded-2xl border border-primary/20 bg-primary/5 p-5"
                    >
                      <div className="flex-shrink-0">
                        <p className="text-3xl font-bold text-primary">4.2x</p>
                        <p className="text-xs text-muted-foreground">retention lift</p>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Students who understand their mistakes are{" "}
                        <span className="font-medium text-foreground">
                          4.2x more likely
                        </span>{" "}
                        to retain the concept.
                      </p>
                    </motion.div>

                    <div className="mt-5">
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={() => setPhase("cta")}
                      >
                        Continue
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHASE 4: CTA */}
            <AnimatePresence>
              {phase === "cta" && exam && (
                <motion.div
                  className="mt-6"
                  variants={ctaFadeIn}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 shadow-sm sm:p-8">
                    <div className="space-y-5 text-center">
                      {!hasDemo && (
                        <p className="text-sm text-muted-foreground">
                          We&apos;re crafting your {exam} demo question. In the meantime,
                          your personalized assessment is ready.
                        </p>
                      )}
                      {hasDemo && (
                        <p className="text-sm text-muted-foreground">
                          Get the full {exam} assessment — 5 questions personalized to
                          your weak spots. Free, no credit card.
                        </p>
                      )}

                      <div className="pt-1">
                        {showSignIn && !user ? (
                          <div className="space-y-3">
                            <p className="text-center text-sm text-muted-foreground">
                              Sign in to take your assessment and get a personalized
                              study plan.
                            </p>
                            <div className="flex justify-center">
                              <SignInButton buttonText="Sign in with Google" icon={false} />
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="lg"
                            className="w-full"
                            disabled={!exam || isUserLoading}
                            onClick={handleCTA}
                          >
                            {isUserLoading ? (
                              <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Checking...
                              </span>
                            ) : (
                              <>
                                Start Your 5-Question {exam} Assessment
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-center text-xs text-muted-foreground/70">
                    No sign-in required to explore. Your results are private and
                    tailored to your exam.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
