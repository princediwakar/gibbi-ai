// components/QuizQuestionsTab.tsx
"use client";

import { useState, useCallback } from "react";
import { Quiz, Question } from "@/types/quiz";
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
  onAddQuestion: () => number | undefined; // Update the return type
  onSave: () => void;
  isSaving: boolean;
}

// Local type guard for Question
function isQuestion(q: unknown): q is Question {
  if (typeof q !== "object" || q === null) return false;
  const obj = q as { question_text?: unknown; options?: unknown; correct_option?: unknown };
  return (
    typeof obj.question_text === "string" &&
    typeof obj.options === "object" &&
    typeof obj.correct_option === "string"
  );
}

export function QuizQuestionsTab({
  quiz,
  onQuestionChange,
  onRemoveQuestion,
  onAddQuestion,
  onSave,
  isSaving,
}: QuizQuestionsTabProps) {
  const [editingQuestionId, setEditingQuestionId] = useState<number | undefined>(undefined);

  const handleEditQuestion = useCallback((questionId: number | undefined) => {
    setEditingQuestionId(questionId);
  }, []);

  const handleSaveQuestion = useCallback(() => {
    onSave();
    setEditingQuestionId(undefined);
  }, [onSave]);

  const handleCancelEdit = useCallback(() => {
    setEditingQuestionId(undefined);
  }, []);

  const handleAddQuestion = useCallback(() => {
    const newQuestionId = onAddQuestion(); // Add a new question and get its ID
    if (newQuestionId !== undefined) {
      setEditingQuestionId(newQuestionId); // Set it to edit mode
    }
  }, [onAddQuestion]);

  return (
    <div className="space-y-4">
      {quiz.questions.length > 0 ? (
        (quiz.questions.filter(q => q != null).filter(isQuestion) as unknown as Question[]).map((question, index) => (
          <QuestionEditor
            key={question.question_id ?? `new-${question.question_id}`}
            question={question}
            questionIndex={index}
            onChange={onQuestionChange}
            onRemove={onRemoveQuestion}
            isEditing={editingQuestionId === question.question_id}
            onEdit={() => handleEditQuestion(question.question_id)}
            onSave={handleSaveQuestion}
            onCancel={handleCancelEdit}
            isSaving={isSaving}
          />
        ))
      ) : (
        <p className="text-muted-foreground text-center py-4">
          Add a question to get started
        </p>
      )}
      <Button onClick={handleAddQuestion} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Question
      </Button>
    </div>
  );
}