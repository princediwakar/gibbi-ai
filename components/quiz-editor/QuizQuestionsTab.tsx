// components/QuizQuestionsTab.tsx
"use client";

import { useCallback } from "react";
import { Quiz } from "@/types/quiz";
import { QuestionEditor } from "./QuestionEditor";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface QuizQuestionsTabProps {
  quiz: Quiz;
  onQuestionChange: (
    questionId: number | undefined,
    field: string,
    value: string,
    optionKey?: string
  ) => void;
  onRemoveQuestion: (questionId: number | undefined) => void;
  onAddQuestion: () => void;
  isEditing: boolean;
}

export function QuizQuestionsTab({
  quiz,
  onQuestionChange,
  onRemoveQuestion,
  onAddQuestion,
  isEditing,
}: QuizQuestionsTabProps) {
  const handleAddQuestion = useCallback(() => {
    onAddQuestion();
  }, [onAddQuestion]);

  return (
    <div className="space-y-4">
      {quiz.questions.length > 0 ? (
        quiz.questions.map((question, index) => (
          <QuestionEditor
            key={question.question_id ?? `new-${question.question_id}`}
            question={question}
            questionIndex={index} // Pass the index (0-based)
            onChange={onQuestionChange}
            onRemove={onRemoveQuestion}
            isEditing={isEditing}
          />
        ))
      ) : (
        <p className="text-muted-foreground text-center py-4">
          {isEditing ? "Add a question to get started" : "No questions available"}
        </p>
      )}
      {isEditing && (
        <Button onClick={handleAddQuestion} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      )}
    </div>
  );
}