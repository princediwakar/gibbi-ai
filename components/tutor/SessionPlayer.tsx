// Path: components/tutor/SessionPlayer.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { renderMathContent } from "@/lib/quiz-utils";
import { TUTOR_CONFIG, TUTOR_ROUTES } from "@/lib/constants/tutor";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Trophy, CheckCircle, XCircle, Eye, ChevronRight, ArrowLeft } from "lucide-react";
import type { SessionQuestion, SelectedOption } from "@/types/tutor";

interface SessionPlayerProps {
  sessionId: string;
  questions: SessionQuestion[];
  examProfileId: string;
}

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

const optionBadgeStyles: Record<string, string> = {
  A: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  B: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  C: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  D: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
};

export function SessionPlayer({ sessionId, questions, examProfileId }: SessionPlayerProps) {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<SelectedOption | null>(null);
  const [answerState, setAnswerState] = useState<"pending" | "answered">("pending");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [nextEnabled, setNextEnabled] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeResult, setCompleteResult] = useState<{
    readiness_index?: number;
    mastery_updates?: { skill_domain: string; mastery_score: number }[];
    share_token?: string;
  } | null>(null);

  const timerStartRef = useRef<number>(Date.now());
  const questionStartRef = useRef<number>(Date.now());
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [questionTimeMs, setQuestionTimeMs] = useState(0);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittingRef = useRef(false);

  const total = questions.length;
  const current = questions[currentIndex];

  useEffect(() => {
    if (sessionComplete) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTotalTimeElapsed(Math.floor((Date.now() - timerStartRef.current) / 1000));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionComplete]);

  useEffect(() => {
    return () => {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    };
  }, []);

  const recordAnswer = useCallback(
    async (option: SelectedOption | null, correct: boolean, revealed: boolean, timeMs: number) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      try {
        await fetch(TUTOR_ROUTES.API_SESSION_ANSWER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            question_id: current.question_id,
            selected_option: option,
            time_to_answer_ms: timeMs,
            was_revealed: revealed,
          }),
        });
      } catch {
        // Non-blocking: telemetry failure does not interrupt the UX
      } finally {
        submittingRef.current = false;
      }
    },
    [sessionId, current?.question_id]
  );

  const lockInAnswer = useCallback(
    (option: SelectedOption | null, correct: boolean, revealed: boolean) => {
      setAnswerState("answered");
      setIsCorrect(correct);
      setIsRevealed(revealed);
      const timeMs = Date.now() - questionStartRef.current;
      setQuestionTimeMs(timeMs);
      if (correct) setScore((prev) => prev + 1);
      recordAnswer(option, correct, revealed, timeMs);
      const delay = revealed
        ? TUTOR_CONFIG.REVEAL_ANSWER_COOLDOWN_MS
        : TUTOR_CONFIG.NEXT_QUESTION_DELAY_MS;
      nextTimerRef.current = setTimeout(() => setNextEnabled(true), delay);
    },
    [recordAnswer]
  );

  const handleOptionClick = useCallback(
    (option: SelectedOption) => {
      if (answerState === "answered") return;
      const correct = option === current.correct_option;
      setSelectedOption(option);
      lockInAnswer(option, correct, false);
    },
    [answerState, current, lockInAnswer]
  );

  const handleReveal = useCallback(() => {
    if (answerState === "answered") return;
    setSelectedOption(null);
    lockInAnswer(null, false, true);
  }, [answerState, lockInAnswer]);

  const handleNext = useCallback(() => {
    if (!nextEnabled) return;
    const next = currentIndex + 1;
    if (next < total) {
      setCurrentIndex(next);
      setSelectedOption(null);
      setAnswerState("pending");
      setIsCorrect(null);
      setIsRevealed(false);
      setNextEnabled(false);
      setQuestionTimeMs(0);
      questionStartRef.current = Date.now();
    } else {
      setSessionComplete(true);
    }
  }, [nextEnabled, currentIndex, total]);

  const handleComplete = useCallback(async () => {
    setCompleting(true);
    try {
      const res = await fetch(TUTOR_ROUTES.API_SESSION_COMPLETE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, exam_profile_id: examProfileId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || "Failed to complete session");
      }
      const data = await res.json();
      setCompleteResult(data);
      toast.success("Session completed! Check your dashboard for updated stats.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to complete session. Try again.");
    } finally {
      setCompleting(false);
    }
  }, [sessionId, examProfileId]);

  const handleBackToDashboard = useCallback(() => {
    router.push(TUTOR_ROUTES.DASHBOARD);
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (answerState === "answered") {
        if (e.key === "Enter" && nextEnabled) {
          e.preventDefault();
          handleNext();
        }
        return;
      }
      const key = e.key.toUpperCase();
      if (OPTION_LETTERS.includes(key as SelectedOption)) {
        e.preventDefault();
        handleOptionClick(key as SelectedOption);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [answerState, nextEnabled, handleNext, handleOptionClick]);

  if (!questions.length) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">No Questions Available</h2>
        <p className="text-muted-foreground mb-4">
          This session has no questions. It may not have been generated correctly.
        </p>
        <Button onClick={handleBackToDashboard}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (sessionComplete) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 rounded-full p-4">
              <Trophy className="h-14 w-14 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Session Complete</h1>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="text-2xl font-bold">{score}/{total}</div>
            <div className="text-xs text-muted-foreground mt-1">Score</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="text-2xl font-bold">{pct}%</div>
            <div className="text-xs text-muted-foreground mt-1">Accuracy</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="text-2xl font-bold">
              {totalTimeElapsed < 60
                ? `${totalTimeElapsed}s`
                : `${Math.floor(totalTimeElapsed / 60)}m ${totalTimeElapsed % 60}s`}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Time</div>
          </div>
        </div>

        {completeResult && (
          <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
            {typeof completeResult.readiness_index === "number" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Readiness Index</span>
                <span className="font-semibold">{completeResult.readiness_index}%</span>
              </div>
            )}
            {completeResult.mastery_updates && completeResult.mastery_updates.length > 0 && (
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Mastery Updates</span>
                {completeResult.mastery_updates.map((m) => (
                  <div key={m.skill_domain} className="flex justify-between text-sm">
                    <span>{m.skill_domain}</span>
                    <span className="font-semibold">{Math.round(m.mastery_score * 100)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!completeResult ? (
          <Button
            className="w-full text-lg py-6"
            size="lg"
            onClick={handleComplete}
            disabled={completing}
          >
            {completing ? "Completing..." : "Complete Session"}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Button
            className="w-full text-lg py-6"
            size="lg"
            onClick={handleBackToDashboard}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
        )}
      </div>
    );
  }

  const optionEntries = OPTION_LETTERS.filter((key) => key in current.options).map((key) => ({
    key,
    value: current.options[key],
  }));

  const correctLetter = current.correct_option;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Question {currentIndex + 1} of {total}
          </span>
          <span>Score: {score}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="text-lg font-medium leading-relaxed text-foreground">
        {renderMathContent(current.question_text)}
      </div>

      <div className="space-y-3">
        {optionEntries.map(({ key, value }) => {
          const isSelected = selectedOption === key;
          const isCorrectOption = key === correctLetter;

          let borderClass = "border-border";
          let bgClass = "";

          if (answerState === "answered") {
            if (isCorrectOption) {
              borderClass = "border-green-500";
              bgClass = "bg-green-500/10";
            } else if (isSelected && !isCorrectOption) {
              borderClass = "border-red-500";
              bgClass = "bg-red-500/10";
            } else {
              bgClass = "opacity-50";
            }
          }

          return (
            <button
              key={key}
              onClick={() => handleOptionClick(key)}
              disabled={answerState === "answered"}
              className={cn(
                "w-full flex items-start gap-3 rounded-lg border p-4 text-left transition-all duration-150 text-foreground",
                borderClass,
                bgClass,
                answerState === "pending" &&
                  "hover:border-primary/50 hover:bg-accent/50 active:scale-[0.99]",
                answerState === "answered" && "cursor-default"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-sm font-semibold",
                  optionBadgeStyles[key],
                  answerState === "answered" && isCorrectOption && "bg-green-500 text-white border-green-500",
                  answerState === "answered" && isSelected && !isCorrectOption && "bg-red-500 text-white border-red-500"
                )}
              >
                {key}
              </span>
              <span className="break-words pt-0.5">{renderMathContent(value)}</span>
              {answerState === "answered" && isCorrectOption && (
                <CheckCircle className="flex-shrink-0 ml-auto h-5 w-5 text-green-600 dark:text-green-400" />
              )}
              {answerState === "answered" && isSelected && !isCorrectOption && (
                <XCircle className="flex-shrink-0 ml-auto h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </button>
          );
        })}
      </div>

      {answerState === "pending" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReveal}
          className="text-muted-foreground"
        >
          <Eye className="mr-1.5 h-4 w-4" />
          Reveal Answer
        </Button>
      )}

      {answerState === "answered" && (
        <div className="space-y-4 border rounded-lg p-5 bg-muted/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            {isRevealed ? (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                <Eye className="h-4 w-4" />
                Answer Revealed
              </div>
            ) : isCorrect ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-sm">
                <CheckCircle className="h-4 w-4" />
                Correct
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-sm">
                <XCircle className="h-4 w-4" />
                Incorrect
              </div>
            )}
          </div>

          {!isRevealed && selectedOption && current.distractor_analysis?.[selectedOption] && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Why This Answer
              </h4>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {renderMathContent(current.distractor_analysis[selectedOption])}
              </div>
            </div>
          )}

          {current.explanation && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Explanation
              </h4>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {renderMathContent(current.explanation)}
              </div>
            </div>
          )}

          {isCorrect && !isRevealed && current.misconception && (
            <div className="border-t pt-3 mt-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1">
                Common Trap
              </h4>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {current.misconception}
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              className="w-full"
              disabled={!nextEnabled}
              onClick={handleNext}
              size="lg"
            >
              {nextEnabled
                ? currentIndex + 1 < total
                  ? "Next Question"
                  : "View Results"
                : currentIndex + 1 < total
                  ? `Next question in a moment...`
                  : `Results in a moment...`}
              {nextEnabled && <ChevronRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center">
        Time elapsed:{" "}
        {totalTimeElapsed < 60
          ? `${totalTimeElapsed}s`
          : `${Math.floor(totalTimeElapsed / 60)}m ${totalTimeElapsed % 60}s`}
      </div>
    </div>
  );
}
