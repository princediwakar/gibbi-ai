// components/quiz-player/QuizPlayer.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Quiz } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { QuizDetails } from "./QuizDetails";
import { GoBackOrHome } from "../GoBackOrHome";
import { QuizProgress } from "./QuizProgress";
import { QuizQuestion } from "./QuizQuestion";
import { SupportingContentDisplay } from "./SupportingContentDisplay";
import { QuizCompletion } from "./QuizCompletion";
import { parseOptions, flattenQuizQuestions } from "@/lib/quiz-utils";
import { FlattenedQuestion } from "@/types/quiz";
import { toast } from "sonner";

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
  const [resultSaved, setResultSaved] = useState<boolean>(false);
  
  // Timer state
  const startTimeRef = useRef<number | null>(null);
  const [timeTaken, setTimeTaken] = useState<number>(0);

  // Reset state on quiz change
  useEffect(() => {
    setIsLoading(true);
    setCurrentIndex(0);
    setScore(0);
    setUserAnswers({});
    setCompleted(false);
    setHasStarted(false);
    setResultSaved(false);
    startTimeRef.current = null;
    setTimeTaken(0);

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
  
  // Start timer when quiz starts
  useEffect(() => {
    if (hasStarted && !completed && startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }
  }, [hasStarted, completed]);
  
  // Calculate time taken when quiz is completed
  useEffect(() => {
    if (completed && startTimeRef.current !== null) {
      const endTime = Date.now();
      const timeInSeconds = Math.floor((endTime - startTimeRef.current) / 1000);
      setTimeTaken(timeInSeconds);
    }
  }, [completed]);
  
  // Save results when quiz is completed
  useEffect(() => {
    const saveResults = async () => {
      if (completed && !resultSaved && quiz.quiz_id) {
        try {
          // Convert answers to a format that matches our database schema
          // Map from index-based to question_id-based
          const answersMap: Record<string, string> = {};
          Object.entries(userAnswers).forEach(([index, answer]) => {
            const questionId = flattenedQuestions[parseInt(index)]?.question?.question_id;
            if (questionId) {
              answersMap[questionId.toString()] = answer;
            }
          });
          
          const response = await fetch('/api/quiz/results', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              quiz_id: quiz.quiz_id,
              score,
              total_questions: flattenedQuestions.length,
              answers: answersMap,
              time_taken: timeTaken,
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to save quiz results');
          }
          
          setResultSaved(true);
        } catch (error) {
          console.error('Error saving quiz results:', error);
          toast.error('Failed to save your results. Your progress is still visible.');
        }
      }
    };
    
    saveResults();
  }, [completed, resultSaved, quiz.quiz_id, score, userAnswers, flattenedQuestions, timeTaken]);

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

  // After completing quiz
  if (completed) {
    return (
      <QuizCompletion
        quiz={quiz}
        score={score}
        totalQuestions={total}
        timeTaken={timeTaken}
        resultSaved={resultSaved}
      />
    );
  }

  // During quiz
  return (
    <div className="max-w-5xl mx-auto mt-8 px-4">
      <QuizProgress current={currentIndex + 1} total={total} />
      
      <div className="space-y-6 md:space-y-0 md:flex md:space-x-6">
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
    </div>
  );
};
