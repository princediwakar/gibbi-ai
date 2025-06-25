"use client";

import { Quiz } from "@/types/quiz";
import { Check, X, History } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ShareableResultsCard } from "./ShareableResultsCard";
import { GoBackOrHome } from "../GoBackOrHome";
import { flattenQuizQuestions, renderMathContent } from "@/lib/quiz-utils";
import { SupportingContentDisplay } from "../quiz-player/SupportingContentDisplay";
import { useRouter } from "next/navigation";
import { ContentType } from "@/types/quiz";

interface QuizResultsProps {
  quiz: Quiz;
  userAnswers: { [key: number]: string };
  score: number;
  showBackToHistoryLink?: boolean;
}

export const QuizResults = ({
  quiz,
  userAnswers,
  score,
  showBackToHistoryLink = false,
}: QuizResultsProps) => {
  const router = useRouter();
  
  // Get the actual number of questions by flattening them
  const flattenedQuestions = flattenQuizQuestions(quiz);
  const actualQuestionCount = flattenedQuestions.length;
  
  const percentage = ((score / actualQuestionCount) * 100).toFixed(1);

  if (flattenedQuestions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-6">
        No questions available for review.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto bg-background">
      {/* Shareable Results Section */}
      <div className="rounded-xl p-6 bg-card shadow-sm border border-border">
        <ShareableResultsCard
          quiz={quiz}
          score={score}
          percentage={percentage}
        />
        
      </div>

      {/* Performance Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">Performance Breakdown</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
            <div className="text-primary font-bold text-2xl">{score}</div>
            <div className="text-sm text-primary">Correct Answers</div>
          </div>
          <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
            <div className="text-destructive font-bold text-2xl">
              {actualQuestionCount - score}
            </div>
            <div className="text-sm text-destructive">Incorrect Answers</div>
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">Question Review</h3>
        <Accordion type="single" collapsible className="w-full">
          {flattenedQuestions.map((flattened, index) => {
            const { question, supportingContent } = flattened;
            const userAnswer = userAnswers[index];
            const correctAnswer = question.correct_option;
            const isCorrect = userAnswer === correctAnswer;
            const optionsMap = typeof question.options === "string"
              ? JSON.parse(question.options)
              : question.options;
            const options = Object.entries(optionsMap).map(([key, value]) => ({
              key,
              value: value as string,
            }));

            return (
              <AccordionItem key={index} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="hover:no-underline w-full px-4 py-3 rounded-lg bg-card hover:bg-muted/20">
                  <div className="flex items-start space-x-3 w-full">
                    {isCorrect ? (
                      <Check className="w-5 h-5 text-primary shrink-0 mt-1" />
                    ) : (
                      <X className="w-5 h-5 text-destructive shrink-0 mt-1" />
                    )}
                    <div className="text-left flex-1 min-w-0">
                      <span className="font-medium text-foreground">Q{index + 1}: </span>
                      <span className="whitespace-normal break-words text-foreground">
                        {renderMathContent(question.question_text)}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-4 bg-card">
                  {/* Render any supporting or inline content (graph, table, image, etc.) */}
                  {supportingContent ? (
                    <div className="p-4">
                      <SupportingContentDisplay
                        content={supportingContent.content}
                        type={supportingContent.type}
                        caption={supportingContent.caption}
                      />
                    </div>
                  ) : question.content ? (
                    <div className="mb-6">
                      <SupportingContentDisplay
                        content={typeof question.content === 'string' ? question.content : question.content.data}
                        type={typeof question.content === 'string' ? (question.type as ContentType) || 'text' : question.content.type}
                      />
                    </div>
                  ) : null}
                  
                  {/* Question options */}
                  <div className="space-y-3 p-4 rounded-lg bg-card">
                    {options.map(({ key, value }) => {
                      const isUserAnswer = key === userAnswer;
                      const isCorrectOption = key === correctAnswer;
                      let variant: "default" | "outline" = "outline";
                      let className = "w-full h-auto min-h-[3rem] py-2 px-4 whitespace-normal text-left pointer-events-none";

                      if (isCorrectOption) {
                        variant = "default";
                        className += " bg-primary dark:primary-foreground";
                      } else if (isUserAnswer && !isCorrect) {
                        variant = "default";
                        className += " bg-destructive text-destructive-foreground";
                      } else {
                        className += " text-foreground border-border hover:bg-muted/20";
                      }

                      return (
                        <Button
                          key={key}
                          variant={variant}
                          className={className}
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
      <div className="flex justify-center pt-6 gap-4">
        {showBackToHistoryLink && (
          <Button 
            variant="outline"
            onClick={() => router.push("/history")}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Back to History
          </Button>
        )}
        <GoBackOrHome />
      </div>
    </div>
  );
};