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
import { Pencil } from "lucide-react";

interface QuizEditorProps {
  quiz: Quiz;
  initialEditMode?: boolean; // Optional: Start in edit mode via URL param
}

export const QuizEditor = ({ quiz, initialEditMode = false }: QuizEditorProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [editedQuiz, setEditedQuiz] = useState<Quiz>(quiz);
  const [isSaving, setIsSaving] = useState(false);

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
          question_id: generateTempId(), // Temporary for UI only
          question_text: "",
          options: { A: "", B: "", C: "", D: "" },
          correct_option: "A",
          isNew: true, // Mark as new
        },
      ],
    }));
  }, []);
  const handleRemoveQuestion = useCallback((questionId: number | undefined) => {
    setEditedQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.question_id !== questionId),
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/quiz/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            // Exclude question_id for new questions, let server assign it
            ...(q.isNew ? {} : { question_id: q.question_id }),
            question_text: q.question_text,
            options: q.options,
            correct_option: q.correct_option,
          })),
        }),
      });
  
      if (!response.ok) throw new Error("Failed to update quiz");
  
      const updatedQuiz = await response.json(); // Expect server to return updated quiz with proper IDs
      toast.success("Quiz updated successfully");
      setIsEditing(false);
      setEditedQuiz(updatedQuiz); // Update local state with server response
    } catch (error) {
      toast.error("Failed to update quiz");
      console.error("Error updating quiz:", error);
    } finally {
      setIsSaving(false);
    }
  }, [editedQuiz]);


  
  const handleStart = useCallback(() => {
    router.push(`/quiz/${quiz.slug}`);
  }, [quiz.slug, router]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{quiz.title}</h2>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleStart} disabled={isSaving}>
            Start Quiz
          </Button>
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
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Quiz
            </Button>
          )}
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