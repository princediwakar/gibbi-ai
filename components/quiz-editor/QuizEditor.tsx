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
  initialEditMode?: boolean;
}

export const QuizEditor = ({ quiz, initialEditMode = false }: QuizEditorProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [editedQuiz, setEditedQuiz] = useState<Quiz>(quiz);
  const [isSaving, setIsSaving] = useState(false);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<(number | undefined)[]>([]); // Track deleted IDs

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
    setEditedQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_id: generateTempId(),
          question_text: "",
          options: { A: "", B: "", C: "", D: "" },
          correct_option: "A",
          isNew: true,
        },
      ],
    }));
  }, []);

  const handleRemoveQuestion = useCallback((questionId: number | undefined) => {
    setEditedQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.question_id !== questionId),
    }));
    // Only add to deletedQuestionIds if it’s an existing question (not a new, unsaved one)
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
        credentials: "include", // Send cookies
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
          deletedQuestionIds, // Send deleted IDs to API
        }),
      });

      if (!response.ok) throw new Error("Failed to update quiz");

      const updatedQuiz = await response.json();
      toast.success("Quiz updated successfully");
      setIsEditing(false);
      setEditedQuiz(updatedQuiz);
      setDeletedQuestionIds([]); // Clear deleted IDs after successful save
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
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            disabled={isSaving}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">{quiz.title}</h2>
        </div>
        <div className="flex gap-4">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Quiz
            </Button>
          )}
          <Button onClick={handleStart} disabled={isSaving}>
            Start Quiz
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="settings" disabled>
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <QuizDetailsTab
            quiz={editedQuiz}
            onQuizChange={handleQuizChange}
            isEditing={isEditing}
          />
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <QuizQuestionsTab
            quiz={editedQuiz}
            onQuestionChange={handleQuestionChange}
            onRemoveQuestion={handleRemoveQuestion}
            onAddQuestion={handleAddQuestion}
            isEditing={isEditing}
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