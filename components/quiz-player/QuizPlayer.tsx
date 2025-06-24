// components/quiz-player/QuizPlayer.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Quiz } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { QuizDetails } from "./QuizDetails";
import { QuizResults } from "../quiz-results/QuizResults";
import { GoBackOrHome } from "../GoBackOrHome";
import { QuizProgress } from "./QuizProgress";
import { QuizQuestion } from "./QuizQuestion";
import { SupportingContentDisplay } from "./SupportingContentDisplay";
import { parseOptions, flattenQuizQuestions } from "@/lib/quiz-utils";
import { FlattenedQuestion } from "@/types/quiz";

interface QuizPlayerProps {
  quiz: Quiz;
  isCreator: boolean;
}

export const QuizPlayer = ({ quiz, isCreator }: QuizPlayerProps) => {
  const router = useRouter();

  // Flattened questions state
  const [flattenedQuestions, setFlattenedQuestions] = useState<FlattenedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quiz progress state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [completed, setCompleted] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Reset state on quiz change
  useEffect(() => {
    setIsLoading(true);
    setCurrentIndex(0);
    setScore(0);
    setUserAnswers({});
    setCompleted(false);
    setHasStarted(false);

    try {
      const flat = flattenQuizQuestions(quiz);
      setFlattenedQuestions(flat);
    } catch (err) {
      console.error("Failed to flatten quiz:", err);
      setFlattenedQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [quiz]);

  const total = flattenedQuestions.length;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!quiz || total === 0) {
    return (
      <div className="text-center p-8">
        <p>{!quiz ? "Quiz not found" : "No questions available."}</p>
        <GoBackOrHome />
      </div>
    );
  }

  const current = flattenedQuestions[currentIndex];
  const { question, supportingContent, source } = current;
  const isGroup = source.startsWith("group-");

  const handleAnswer = (optionKey: string) => {
    if (!question) return;
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: optionKey }));

    if (question.correct_option === optionKey) {
      setScore((prev) => prev + 1);
    }

    const next = currentIndex + 1;
    if (next < total) {
      setCurrentIndex(next);
    } else {
      setCompleted(true);
    }
  };

  // Before starting quiz
  if (!hasStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <QuizDetails quiz={quiz} />
        <div className="flex gap-4">
          {isCreator && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/edit/${quiz.slug}`)}
            >
              Edit Quiz
            </Button>
          )}
          <Button className="flex-1" onClick={() => setHasStarted(true)}>
            Start Quiz
          </Button>
        </div>
      </div>
    );
  }

  // After starting quiz
  return (
    <div className="max-w-5xl mx-auto mt-8 px-4">
      {!completed && (
        <QuizProgress current={currentIndex + 1} total={total} />
      )}

      {completed ? (
        <QuizResults quiz={quiz} userAnswers={userAnswers} score={score} />
      ) : (
        <div className="space-y-6 md:flex md:space-x-6">
          {isGroup && supportingContent && (
            <div className="md:w-1/2 md:max-h-[70vh] md:overflow-y-auto">
              <SupportingContentDisplay
                content={supportingContent.content}
                type={supportingContent.type}
                caption={supportingContent.caption}
              />
            </div>
          )}
          <div className={isGroup ? "md:w-1/2" : "w-full"}>
            {question ? (
              <QuizQuestion
                question={question.question_text}
                options={parseOptions(question.options)}
                onAnswer={handleAnswer}
              />
            ) : (
              <p className="text-center text-muted-foreground">
                Error loading question {currentIndex + 1} of {total}.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
