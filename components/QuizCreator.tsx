// components/QuizCreator.tsx
"use client";

import { useState, useCallback, memo } from "react";
import { useUser } from "@/hooks/useUser";
import { Quiz } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LANGUAGES } from "@/lib/utils";
import { signInWithGoogle } from "@/lib/supabase/auth";

const PromptInput = memo(
  ({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled: boolean }) => (
    <Textarea
      id="prompt"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter a topic, or paste text content"
      disabled={disabled}
      rows={4}
      className="w-full"
    />
  )
);
PromptInput.displayName = "PromptInput";

const MAX_QUESTION_COUNT = Number(process.env.NEXT_PUBLIC_MAX_QUESTION_COUNT) || 50;
const DEFAULT_QUESTION_COUNT = Number(process.env.NEXT_PUBLIC_DEFAULT_QUESTION_COUNT) || 10;
const DEFAULT_DIFFICULTY = process.env.NEXT_PUBLIC_DEFAULT_DIFFICULTY || "Medium";
const STATUS_CHECK_FREQUENCY = Number(process.env.NEXT_PUBLIC_STATUS_CHECK_FREQUENCY) || 5000;

interface QuizCreatorProps {
  onQuizCreated: (quiz: Quiz) => void;
}

export const QuizCreator = memo(({ onQuizCreated }: QuizCreatorProps) => {
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("Auto");
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [storedPrompt, setStoredPrompt] = useState(""); // New state to store the prompt


  const { user } = useUser();

  const checkQuizStatus = useCallback(
    async (quizId: string, toastId: string | number) => {
      try {
        const response = await fetch(`/api/quiz/status?id=${quizId}`);
        const data = await response.json();

        if (data.status === "ready") {
          toast.success("Quiz generated successfully!", { id: toastId });
          onQuizCreated(data.quiz);
        } else if (data.status === "failed") {
          toast.error(data.error || "Quiz generation failed. Please try again.", { id: toastId });
          onQuizCreated({ quiz_id: quizId, status: "failed" } as Quiz);
        } else {
          toast.loading(`Generating quiz for "${prompt.slice(0, 60)}"...`, { id: toastId });
          setTimeout(() => checkQuizStatus(quizId, toastId), STATUS_CHECK_FREQUENCY);
        }
      } catch (error) {
        console.error("Polling error:", error);
        toast.error("Failed to check quiz status", { id: toastId });
      }
    },
    [onQuizCreated, prompt]
  );

  const handleQuestionCount = useCallback((value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
      toast.warning("Please enter a number greater than 0");
      return;
    }
    if (num > MAX_QUESTION_COUNT) {
      toast.warning(`Maximum is ${MAX_QUESTION_COUNT} questions`);
      setQuestionCount(MAX_QUESTION_COUNT);
      return;
    }
    setQuestionCount(num);
  }, []);

  const handleGenerateQuiz = useCallback(async () => {
    if (!prompt.trim()) {
      toast.warning("Please enter a valid prompt");
      return;
    }
    if (!user) {
      setIsSignInModalOpen(true);
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Starting quiz generation...");
    setStep(1);
    setPrompt("");

    try {
      const response = await fetch("/api/quiz/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access_token}`, // Note: This should be session.access_token as per previous fix
        },
        credentials: "include",
        body: JSON.stringify({
          prompt,
          creator_id: user.id,
          question_count: questionCount,
          difficulty,
          language,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create quiz");

      checkQuizStatus(data.quiz_id, toastId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate quiz", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  }, [prompt, user, questionCount, difficulty, language, checkQuizStatus]);

  const handleNext = useCallback(() => {
    if (!prompt.trim()) {
      toast.warning("Please enter a prompt before proceeding");
      return;
    }
    if (!user) {
      setStoredPrompt(prompt)
      setIsSignInModalOpen(true);
      return;
    }
    setStep(2);
  }, [prompt, user]);

  const handleSignIn = useCallback(async () => {
    try {
      await signInWithGoogle();
      setIsSignInModalOpen(false);
      setPrompt(storedPrompt); // Restore the prompt after successful sign-in
    } catch (error: unknown) { // Explicitly type error as unknown
      // Use the error message if available
      toast.error(error instanceof Error ? `Failed to sign in: ${error.message}` : "Failed to sign in with Google. Please try again.");
    }
  }, [storedPrompt]);

  return (
    <div className="max-w-2xl w-full mx-auto p-6">
      <div className="min-h-[275px] flex flex-col space-y-6">
        <h2 className="text-5xl font-bold text-center">
          {step === 1 ? "What’s your quiz about?" : "Customize Your Quiz"}
        </h2>
        <div className="flex-1 space-y-4">
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <PromptInput value={prompt} onChange={setPrompt} disabled={isLoading} />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="questionCount">No. of Questions</Label>
                <Input
                  id="questionCount"
                  type="number"
                  min="1"
                  max={MAX_QUESTION_COUNT}
                  value={questionCount}
                  onChange={(e) => handleQuestionCount(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={difficulty}
                  onValueChange={setDifficulty}
                  disabled={isLoading}
                >
                  <SelectTrigger id="difficulty" className="w-full">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language (Optional)</Label>
                <Select value={language} onValueChange={setLanguage} disabled={isLoading}>
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(({ code, name }) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-4">
          {step === 2 && (
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              disabled={isLoading}
              className="w-full"
            >
              Back
            </Button>
          )}
          <Button
            onClick={step === 1 ? handleNext : handleGenerateQuiz}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : step === 1 ? (
              "Next"
            ) : (
              "Generate Quiz"
            )}
          </Button>
        </div>
      </div>
      <Dialog open={isSignInModalOpen} onOpenChange={setIsSignInModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              You need to sign in to create a quiz. Please sign in with Google to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSignInModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSignIn} disabled={isLoading}>
              Sign In with Google
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

QuizCreator.displayName = "QuizCreator";