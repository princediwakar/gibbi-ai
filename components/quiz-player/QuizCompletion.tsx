"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Quiz } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Trophy, ChevronRight } from "lucide-react";
import { QuizDetails } from "@/components/quiz-player/QuizDetails";
import { useWindowSize } from "@/hooks/useMobile";
import Confetti from "react-confetti";

interface QuizCompletionProps {
  quiz: Quiz;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  resultSaved: boolean;
}

export const QuizCompletion = ({
  quiz,
}: QuizCompletionProps) => {
  const router = useRouter();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  
  
  // Stop confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const viewResults = () => {
    if (quiz.slug) {
      router.push(`/quiz/${quiz.slug}/results`);
    }
  };
  
  return (
    <div className="relative max-w-3xl mx-auto p-4 text-center">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={180}
          />
        </div>
      )}

      {/* Stable content wrapper to prevent layout shift when confetti unmounts */}
      <div className="space-y-8">
        <div className="flex justify-center">
          <div className="bg-primary/10 rounded-full p-4">
            <Trophy className="h-14 w-14 text-primary" />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight">Congratulations, you&apos;ve finished the quiz!</h1>

        <QuizDetails quiz={quiz} />

        <Button
          onClick={viewResults}
          className="w-full text-lg py-6 mt-4"
          size="lg"
        >
          View Detailed Results
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}; 