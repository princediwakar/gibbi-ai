// components/QuizEditor.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Quiz, generateTempId } from "@/types/quiz";
import { QuizDetailsTab } from "./QuizDetailsTab";
import { QuizQuestionsTab } from "./QuizQuestionsTab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface QuizEditorProps {
  quiz: Quiz;
}


export const QuizEditor = ({ quiz }: QuizEditorProps) => {
  const router = useRouter();
  const [editedQuiz, setEditedQuiz] = useState<Quiz>(quiz);
  const [isSaving, setIsSaving] = useState(false);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<(number | undefined)[]>([]);

  const handleQuizChange = useCallback((field: keyof Quiz, value: string) => {
    setEditedQuiz((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleQuestionChange = useCallback(
    (questionId: number | undefined, field: string, value: string, optionKey?: string) => {
      setEditedQuiz((prev) => {
        const newQuestions = prev.questions.map((q) =>
          q.question_id === questionId
            ? field === "options" && optionKey
              ? { ...q, options: { ...q.options, [optionKey]: value } }
              : { ...q, [field]: value }
            : q
        );
        return { ...prev, questions: newQuestions };
      });
    },
    []
  );

  const handleAddQuestion = useCallback(() => {
    const newQuestion = {
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
    return newQuestion.question_id; // Return the ID of the newly added question
  }, []);

  const handleRemoveQuestion = useCallback((questionId: number | undefined) => {
    setEditedQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.question_id !== questionId),
    }));
    if (questionId && !quiz.questions.find((q) => q.question_id === questionId)?.isNew) {
      setDeletedQuestionIds((prev) => [...prev, questionId]);
    }
  }, [quiz.questions]);

  const handleSave = useCallback(async () => {
    const invalidQuestions = editedQuiz.questions.filter(
      (q) =>
        !q.question_text.trim() ||
        Object.values(q.options).every((opt) => !opt.trim()) ||
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
          questions: editedQuiz.questions.map((q) => ({
            ...(q.isNew ? {} : { question_id: q.question_id }),
            question_text: q.question_text,
            options: q.options,
            correct_option: q.correct_option,
          })),
          deletedQuestionIds,
        }),
      });

      if (!response.ok) throw new Error("Failed to update quiz");

      const updatedQuiz = await response.json();
      toast.success("Quiz updated successfully");
      setEditedQuiz(updatedQuiz);
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
            quiz={editedQuiz}
            onQuizChange={handleQuizChange}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <QuizQuestionsTab
            quiz={editedQuiz}
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