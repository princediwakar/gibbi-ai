"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Quiz } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { QuizDetails } from "./QuizDetails";
import { QuizResults } from "../quiz-results/QuizResults";
import { GoBackOrHome } from "../GoBackOrHome";
import { QuizProgress } from "./QuizProgress";
import { QuizQuestion } from "./QuizQuestion";
import { parseOptions } from "@/lib/quiz-utils";

interface QuizPlayerProps {
  quiz: Quiz;
  isCreator: boolean;
}

export const QuizPlayer = ({ quiz, isCreator }: QuizPlayerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});

  const router = useRouter();

  const handleEdit = () => {
    router.push(`/edit/${quiz.slug}`);
    // router.refresh(); // Ensure the page updates
  };

  if (!quiz) {
    return (
      <div className="text-center">
        <p>Quiz not found</p>
        <GoBackOrHome />
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <QuizDetails quiz={quiz} />
        <div className="flex justify-between gap-4">
          {isCreator && (
            <Button variant="outline" className="w-full" onClick={handleEdit}>
              Edit Quiz
            </Button>
          )}
          <Button className="w-full" onClick={() => setHasStarted(true)}>
            Start Quiz
          </Button>
        </div>
      </div>
    );
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center">
        <p>No questions available for this quiz.</p>
        <GoBackOrHome />
      </div>
    );
  }

  const handleAnswer = (option: string) => {
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: option }));

    if (option === quiz.questions[currentIndex].correct_option) {
      setScore(score + 1);
    }

    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  const currentQuestion = quiz.questions[currentIndex];
  const options = parseOptions(currentQuestion.options);

  return (
    <div className="max-w-xl mt-10 mx-auto">
      {!completed && <QuizProgress current={currentIndex} total={quiz.questions.length} />}

      {completed ? (
        <QuizResults
          quiz={quiz}
          userAnswers={userAnswers}
          score={score}
        />
      ) : (
        <QuizQuestion
          question={currentQuestion.question_text}
          options={options}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
};