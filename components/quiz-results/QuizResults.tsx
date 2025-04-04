"use client";

import { Quiz } from "@/types/quiz";
import { Check, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ShareableResultsCard } from "./ShareableResultsCard";
import { GoBackOrHome } from "../GoBackOrHome";
import { renderMathContent } from "@/lib/quiz-utils";

interface QuizResultsProps {
  quiz: Quiz;
  userAnswers: { [key: number]: string };
  score: number;
}

export const QuizResults = ({
  quiz,
  userAnswers,
  score,
}: QuizResultsProps) => {
  const percentage = ((score / quiz.question_count) * 100).toFixed(1);

  if (!quiz.questions) {
    return (
      <div className="text-center text-muted-foreground py-6">
        No questions available for review.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Shareable Results Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-pink-500 rounded-xl p-6 text-white">
        <ShareableResultsCard
          quiz={quiz}
          score={score}
          percentage={percentage}
        />
      </div>

      {/* Performance Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Performance Breakdown</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-600 font-bold text-2xl">{score}</div>
            <div className="text-sm text-green-600">Correct Answers</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-red-600 font-bold text-2xl">
              {quiz.question_count - score}
            </div>
            <div className="text-sm text-red-600">Incorrect Answers</div>
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Question Review</h3>
        <Accordion type="single" collapsible className="w-full">
          {quiz.questions.map((question, index) => {
            const userAnswer = userAnswers[index];
            const correctAnswer = question.correct_option;
            const isCorrect = userAnswer === correctAnswer;
            const optionsMap =
              typeof question.options === "string"
                ? JSON.parse(question.options)
                : question.options;
            const options = Object.entries(optionsMap).map(([key, value]) => ({
              key,
              value: value as string,
            }));

            return (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="hover:no-underline w-full px-4 py-3 rounded-lg">
                  <div className="flex items-start space-x-3 w-full">
                    {isCorrect ? (
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-1" />
                    ) : (
                      <X className="w-5 h-5 text-red-600 shrink-0 mt-1" />
                    )}
                    <div className="text-left flex-1 min-w-0">
                      <span className="font-medium">Q{index + 1}: </span>
                      <span className="whitespace-normal break-words">
                        {renderMathContent(question.question_text)}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="space-y-3 p-4 rounded-lg">
                    {options.map(({ key, value }) => {
                      const isUserAnswer = key === userAnswer;
                      const isCorrectOption = key === correctAnswer;
                      let variant: "default" | "outline" = "outline";
                      let className = "w-full h-auto min-h-[3rem] py-2 px-4 whitespace-normal text-left";

                      if (isCorrectOption) {
                        variant = "default";
                        className += " bg-green-700 text-white";
                      } else if (isUserAnswer && !isCorrect) {
                        variant = "default";
                        className += " bg-red-700 text-white";
                      } else {
                        // Unselected options: black in light mode, white in dark mode
                        className += " text-foreground disabled:opacity-100";
                      }

                      return (
                        <Button
                          key={key}
                          variant={variant}
                          className={className}
                          disabled
                        >
                          <span className="w-full break-words">
                            {renderMathContent(value)}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Navigation */}
      <div className="space-y-8">
        <GoBackOrHome />
      </div>
    </div>
  );
};