// Path: components/practice/PracticeQuestion.tsx

"use client";

import { useState, useCallback } from "react";
import { renderMathContent } from "@/lib/quiz-utils";
import { Badge } from "@/components/ui/badge";

interface QuestionData {
  question_text: string;
  options: Record<string, string>;
  correct_option: string;
  explanation: string;
  distractor_analysis?: Record<string, string>;
  difficulty_tier?: string;
  misconception?: string;
  topics?: string[];
}

interface PracticeQuestionProps {
  question: QuestionData;
  index: number;
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  foundation: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  application: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  advanced: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  expert: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function PracticeQuestion({ question, index }: PracticeQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = useCallback(
    (label: string) => {
      if (revealed) return;
      setSelectedOption(label);
      setRevealed(true);
    },
    [revealed],
  );

  const isCorrect = selectedOption === question.correct_option;
  const difficultyKey = question.difficulty_tier ?? "foundation";
  const difficultyColor = DIFFICULTY_COLORS[difficultyKey] ?? DIFFICULTY_COLORS.foundation;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
      {/* Header: question number, difficulty, topics */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          Q{index + 1}
        </span>
        <Badge variant="secondary" className={`text-xs font-medium ${difficultyColor}`}>
          {question.difficulty_tier}
        </Badge>
        {question.topics?.map((topic) => (
          <Badge key={topic} variant="outline" className="text-xs">
            {topic}
          </Badge>
        ))}
      </div>

      {/* Question text */}
      <div className="mb-5 text-base leading-relaxed text-slate-900 dark:text-slate-100">
        {renderMathContent(question.question_text)}
      </div>

      {/* Options */}
      <div className="grid gap-2.5">
        {OPTION_LABELS.map((label) => {
          const optionText = question.options[label];
          if (!optionText) return null;

          let borderClass = "border-slate-200 dark:border-slate-700";
          let bgClass = "bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900";
          let ringClass = "";

          if (revealed) {
            if (label === question.correct_option) {
              borderClass = "border-emerald-500 dark:border-emerald-400";
              bgClass = "bg-emerald-50 dark:bg-emerald-950/20";
              ringClass = "ring-2 ring-emerald-500/20";
            } else if (label === selectedOption && !isCorrect) {
              borderClass = "border-red-500 dark:border-red-400";
              bgClass = "bg-red-50 dark:bg-red-950/20";
              ringClass = "ring-2 ring-red-500/20";
            }
          }

          return (
            <button
              key={label}
              type="button"
              disabled={revealed}
              onClick={() => handleSelect(label)}
              className={`flex items-start gap-3 rounded-lg border p-3.5 text-left transition-all duration-200 ${borderClass} ${bgClass} ${ringClass} ${
                !revealed ? "cursor-pointer active:scale-[0.98]" : "cursor-default"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  revealed && label === question.correct_option
                    ? "bg-emerald-500 text-white"
                    : revealed && label === selectedOption && !isCorrect
                      ? "bg-red-500 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {label}
              </span>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {renderMathContent(optionText)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation (blurred until revealed) */}
      {question.misconception && (
        <div
          className={`mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800 dark:bg-amber-950/10 transition-all duration-500 ${
            revealed ? "opacity-100 blur-0" : "opacity-50 select-none"
          }`}
          style={revealed ? { filter: "blur(0px)" } : { filter: "blur(6px)" }}
        >
          <p className="text-xs italic text-amber-600 dark:text-amber-400">
            Common trap: {question.misconception}
          </p>
        </div>
      )}

      {/* Distractor analysis (visible only after reveal) */}
      {revealed && question.distractor_analysis && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Why each option is wrong
          </p>
          {OPTION_LABELS.map((label) => {
            const da = question.distractor_analysis!;
            const analysis = da[label];
            if (!analysis) return null;
            if (label === question.correct_option) {
              return (
                <div key={label} className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50/50 p-2 dark:border-emerald-800 dark:bg-emerald-950/10">
                  <span className="mt-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {label}:
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-300">
                    CORRECT — {analysis}
                  </span>
                </div>
              );
            }
            return (
              <div key={label} className="flex items-start gap-2 rounded-md border border-red-100 bg-red-50/30 p-2 dark:border-red-900/30 dark:bg-red-950/10">
                <span className="mt-0.5 text-xs font-bold text-red-500 dark:text-red-400">
                  {label}:
                </span>
                <span className="text-xs text-red-600 dark:text-red-300">
                  {analysis}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback after selection */}
      {revealed && (
        <div
          className={`mt-4 rounded-lg px-4 py-2.5 text-sm font-medium ${
            isCorrect
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {isCorrect ? "Correct! Well done." : `Incorrect. The correct answer is ${question.correct_option}.`}
        </div>
      )}
    </div>
  );
}
