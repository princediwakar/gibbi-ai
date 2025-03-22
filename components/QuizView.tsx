"use client";

import { Quiz } from "@/types/quiz";
import { QuizPlayer } from "./QuizPlayer";
import { QuizEditor } from "./QuizEditor";
import { useState } from "react";

interface QuizViewProps {
  quiz: Quiz;
  isCreator: boolean;
}

export function QuizView({ quiz, isCreator }: QuizViewProps) {
  const [mode, setMode] = useState<"play" | "edit">(isCreator ? "edit" : "play");

  if (mode === "edit") {
    return (
      <QuizEditor
        quiz={quiz}
        onStartQuiz={() => setMode("play")}
        onBack={() => setMode("play")}
      />
    );
  }

  return <QuizPlayer quiz={quiz} isCreator={isCreator} />;
} 