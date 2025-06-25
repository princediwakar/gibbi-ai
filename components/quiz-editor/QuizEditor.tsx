// components/QuizEditor.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Quiz, Question, generateTempId } from "@/types/quiz";
import { Json } from "@/types/supabase";
import { QuizDetailsTab } from "./QuizDetailsTab";
import { QuizQuestionsTab } from "./QuizQuestionsTab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface QuizEditorProps {
  quiz: Quiz;
}

type QuizEditorState = Omit<Quiz, "questions"> & { questions: Question[] };

// Type guard for Question
const isQuestion = (q: unknown): q is Question => {
  if (typeof q !== "object" || q === null) return false;
  const obj = q as { question_text?: unknown; options?: unknown; correct_option?: unknown };
  return (
    typeof obj.question_text === "string" &&
    typeof obj.options === "object" &&
    typeof obj.correct_option === "string"
  );
};

function sanitizeQuestions(qs: unknown): Question[] {
  return Array.isArray(qs) ? qs.filter(isQuestion) : [];
}

// Utility to strip isNew property from a question
function stripIsNew(q: Question | (Question & { isNew?: boolean })): Question {
  if ('isNew' in q) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isNew, ...rest } = q;
    return rest as Question;
  }
  return q;
}

export const QuizEditor = ({ quiz }: QuizEditorProps) => {
  const router = useRouter();
  // Always sanitize questions for editor state
  const [editedQuiz, setEditedQuiz] = useState<QuizEditorState>({
    ...quiz,
    questions: sanitizeQuestions(quiz.questions),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<(number | undefined)[]>([]);

  const handleQuizChange = useCallback((field: keyof Quiz, value: string) => {
    setEditedQuiz((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleQuestionChange = useCallback(
    (questionId: number | undefined, field: string, value: string, optionKey?: string) => {
      setEditedQuiz((prev) => {
        const newQuestions = prev.questions.map((q) => {
          if (q && q.question_id === questionId) {
            if (field === "options" && optionKey) {
              const currentOptions = typeof q.options === 'string'
                ? JSON.parse(q.options)
                : q.options;
              return { ...q, options: { ...currentOptions, [optionKey]: value } };
            } else {
              return { ...q, [field]: value };
            }
          }
          return q;
        });
        return { ...prev, questions: newQuestions };
      });
    },
    []
  );

  // Local type for new questions (with isNew flag)
  type NewQuestion = Question & { isNew?: boolean };

  const handleAddQuestion = useCallback(() => {
    const newQuestion: NewQuestion = {
      question_id: generateTempId(),
      question_text: "",
      options: { A: "", B: "", C: "", D: "" },
      correct_option: "A",
      isNew: true,
    };
    setEditedQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    return newQuestion.question_id;
  }, []);

  const handleRemoveQuestion = useCallback((questionId: number | undefined) => {
    setEditedQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q && q.question_id !== questionId),
    }));
    // Only mark for deletion if not a new question
    const origQuestions = sanitizeQuestions(quiz.questions);
    if (questionId && !origQuestions.find((q) => q && q.question_id === questionId)) {
      setDeletedQuestionIds((prev) => [...prev, questionId]);
    }
  }, [quiz.questions]);

  const handleSave = useCallback(async () => {
    const invalidQuestions = editedQuiz.questions.filter(
      (q) =>
        !q.question_text.trim() ||
        Object.values(q.options).every((opt) => typeof opt === 'string' ? !opt.trim() : true) ||
        !q.correct_option
    );
    if (invalidQuestions.length > 0) {
      toast.error("Please fill in all question text, options, and correct answers.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/quiz/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          quizId: editedQuiz.quiz_id,
          details: {
            title: editedQuiz.title,
            description: editedQuiz.description,
            subject: editedQuiz.subject,
            topic: editedQuiz.topic,
            difficulty: editedQuiz.difficulty,
          },
          questions: editedQuiz.questions.map(stripIsNew) as unknown as Json[],
          deletedQuestionIds,
        }),
      });

      if (!response.ok) throw new Error("Failed to update quiz");

      const updatedQuiz = await response.json();
      toast.success("Quiz updated successfully");
      setEditedQuiz({
        ...updatedQuiz,
        questions: sanitizeQuestions(updatedQuiz.questions),
      });
      setDeletedQuestionIds([]);
    } catch (error) {
      toast.error("Failed to update quiz");
      console.error("Error updating quiz:", error);
    } finally {
      setIsSaving(false);
    }
  }, [editedQuiz, deletedQuestionIds]);

  const handleStart = useCallback(() => {
    router.push(`/quiz/${quiz.slug}`);
  }, [quiz.slug, router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="space-y-4 lg:space-y-0 lg:flex justify-between">
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            disabled={isSaving}
            aria-label="Go back"
          >
            <ArrowLeft />
          </Button>
          <h2 className="text-2xl font-bold">{quiz.title.length > 40 ? `${quiz.title.slice(0, 40)}...` : quiz.title}</h2>
        </div>
        <Button onClick={handleStart} disabled={isSaving}>
          Start Quiz
        </Button>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          {/* <TabsTrigger value="settings" disabled>
            Settings
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <QuizDetailsTab
            quiz={{ ...editedQuiz, questions: sanitizeQuestions(editedQuiz.questions) } as unknown as Quiz}
            onQuizChange={handleQuizChange}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <QuizQuestionsTab
            quiz={{ ...editedQuiz, questions: sanitizeQuestions(editedQuiz.questions) } as unknown as Quiz}
            onQuestionChange={handleQuestionChange}
            onRemoveQuestion={handleRemoveQuestion}
            onAddQuestion={handleAddQuestion}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="settings">
          <div className="text-center text-muted-foreground py-6">
            Settings are currently unavailable
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};