"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { Quiz } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LANGUAGES } from "@/lib/constants/languages";
import { QUIZ_CONFIG } from "@/lib/constants/quiz";
import { PromptInput } from "./PromptInput";
import { PDFUploader } from "./PDFUploader";
import { SignInModal } from "../SignInModal";

// Use constants from config
const { MAX_QUESTION_COUNT, DEFAULT_QUESTION_COUNT, DEFAULT_DIFFICULTY, STATUS_CHECK_FREQUENCY } = QUIZ_CONFIG;

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
  const [pdfText, setPdfText] = useState<string>("");
  const { user } = useUser();

  const checkQuizStatus = useCallback(async (quizId: string, toastId: string | number, attempt = 0, maxAttempts = 20) => {
    try {
      const response = await fetch(`/api/quiz/status?id=${quizId}`);
      const data = await response.json();
      
      if (data.status === "ready" && data.quiz) {
        toast.success("Quiz generated successfully!", { id: toastId });
        onQuizCreated(data.quiz);
        window.location.href = `/quiz/${data.quiz.slug}`;
      } else if (data.status === "failed") {
        toast.error(data.error || "Quiz generation failed", { id: toastId });
        onQuizCreated({ quiz_id: quizId, status: "failed" } as Quiz);
      } else if (attempt >= maxAttempts) {
        toast.error("Quiz generation is taking too long. Please check your quizzes later.", { id: toastId });
        onQuizCreated({ quiz_id: quizId, status: "timeout" } as Quiz);
      } else {
        const nextAttempt = attempt + 1;
        const progress = Math.round((nextAttempt / maxAttempts) * 100);
        toast.loading(`Generating quiz... ${progress}%`, { id: toastId });
        setTimeout(() => checkQuizStatus(quizId, toastId, nextAttempt, maxAttempts), STATUS_CHECK_FREQUENCY);
      }
    } catch (error) {
      console.error("Polling error:", error);
      toast.error("Failed to check quiz status", { id: toastId });
    }
  }, [onQuizCreated, STATUS_CHECK_FREQUENCY]);

  const handleQuestionCount = useCallback((value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) return toast.warning("Please enter a number greater than 0");
    if (num > MAX_QUESTION_COUNT) {
      toast.warning(`Maximum is ${MAX_QUESTION_COUNT} questions`);
      setQuestionCount(MAX_QUESTION_COUNT);
    } else {
      setQuestionCount(num);
    }
  }, []);

  const handleGenerateQuiz = useCallback(async () => {
    if (!prompt.trim() && !pdfText) return toast.warning("Please enter a prompt or upload a PDF file");
    if (!user) return setIsSignInModalOpen(true);

    setIsLoading(true);
    const toastId = toast.loading("Starting quiz generation...");
    setStep(1);
    setPrompt("");

    try {
      const formData = new FormData();
      const content = pdfText ? (prompt.trim() ? `${prompt}\n\n${pdfText}` : pdfText) : prompt;
      formData.append("content", content.slice(0, 45000 / 0.75));
      formData.append("creator_id", user.id);
      formData.append("question_count", questionCount.toString());
      formData.append("difficulty", difficulty);
      formData.append("language", language);

      const response = await fetch("/api/quiz/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.access_token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create quiz");

      checkQuizStatus(data.quiz_id, toastId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate quiz", { id: toastId });
    } finally {
      setIsLoading(false);
      setPdfText("");
    }
  }, [prompt, pdfText, user, questionCount, difficulty, language, checkQuizStatus]);


  // Retrieve the prompt from localStorage on component mount
  useEffect(() => {
    const savedPrompt = localStorage.getItem("quizPrompt");
    if (savedPrompt) {
      setPrompt(savedPrompt);
      localStorage.removeItem("quizPrompt"); // Clear the saved prompt
    }
  }, []);

  const handleNext = useCallback(() => {
    if (!prompt.trim() && !pdfText) {
      toast.warning("Please enter a prompt or upload a PDF file");
      return;
    }
    
    if (!user) {
      localStorage.setItem("quizPrompt", prompt); // Save the prompt to localStorage
      setIsSignInModalOpen(true);
      return;
    }
    
    try {
      setStep(2);
      // Log successful transition
      console.log("Moved to step 2: Quiz customization");
    } catch (error) {
      console.error("Error transitioning to step 2:", error);
      toast.error("Failed to proceed to next step. Please try again.");
    }
  }, [prompt, pdfText, user]);

  // Add step change effect for debugging
  useEffect(() => {
    console.log("Current step:", step);
  }, [step]);

  // Reset loading state if error occurs
  useEffect(() => {
    if (isLoading && step === 1) {
      setIsLoading(false);
    }
  }, [step, isLoading]);

  return (
    <div className="max-w-2xl w-full mx-auto">
      <div className="min-h-[275px] flex flex-col space-y-6">
        <h2 className="text-5xl font-bold text-center">{step === 1 ? "What are you studying?" : "Customize Your Practice Test"}</h2>
        <div className="flex-1 space-y-4">
          {step === 1 ? (
            <div className="space-y-2">
              <PromptInput value={prompt} onChange={setPrompt} disabled={isLoading} />
              <PDFUploader onUpload={setPdfText} onClear={() => setPdfText("")} disabled={isLoading} />
            </div>
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
                <Select value={difficulty} onValueChange={setDifficulty} disabled={isLoading}>
                  <SelectTrigger id="difficulty" className="w-full">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUIZ_CONFIG.DIFFICULTY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
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
                      <SelectItem key={code} value={code}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-4">
          {step === 2 && <Button variant="outline" onClick={() => setStep(1)} disabled={isLoading} className="w-full">Back</Button>}
          <Button onClick={step === 1 ? handleNext : handleGenerateQuiz} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : step === 1 ? "Next" : "Generate Quiz"}
          </Button>
        </div>
      </div>
      <SignInModal open={isSignInModalOpen} onOpenChange={setIsSignInModalOpen} isLoading={isLoading} />
    </div>
  );
});
QuizCreator.displayName = "QuizCreator";