// Path: components/quiz-creator/QuizCreator.tsx
"use client";

import { useState, useCallback, memo, useEffect, useRef } from "react";
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
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useRouter } from "next/navigation";

const { MAX_QUESTION_COUNT, DEFAULT_QUESTION_COUNT, DEFAULT_DIFFICULTY } = QUIZ_CONFIG;

interface QuizCreatorProps {
  onQuizCreated: (quiz: Quiz) => void;
}

export const QuizCreator = memo(({ onQuizCreated }: QuizCreatorProps) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("Auto");
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [pdfText, setPdfText] = useState<string>("");
  const { user, accessToken, isUserLoading } = useUser();
  const abortRef = useRef<AbortController | null>(null);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
    toast.info("Generation cancelled.");
  }, []);

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
    if (isUserLoading) return;
    if (!user || !accessToken) return setIsSignInModalOpen(true);

    setIsLoading(true);
    setStep(1);
    setPrompt("");

    const controller = new AbortController();
    abortRef.current = controller;

    const content = pdfText ? (prompt.trim() ? `${prompt}\n\n${pdfText}` : pdfText) : prompt;

    const toastId = toast.loading("Starting quiz generation...");

    try {
      await fetchEventSource("/api/quiz/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.slice(0, QUIZ_CONFIG.MAX_PROMPT_LENGTH),
          question_count: questionCount,
          difficulty,
          language,
        }),
        signal: controller.signal,
        onmessage(event) {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case "connected":
              toast.loading("Starting quiz generation...", { id: toastId });
              break;
            case "progress":
              toast.loading(`Generating question ${data.done} of ${data.total}...`, { id: toastId });
              break;
            case "complete":
              toast.success("Quiz generated!", { id: toastId });
              setIsLoading(false);
              router.push(`/quiz/${data.quiz?.slug || data.quiz_id}`);
              break;
            case "partial":
              toast.warning(`Generated ${data.generated} of ${data.requested}.`, { id: toastId });
              setIsLoading(false);
              router.push(`/quiz/${data.quiz_id}`);
              break;
            case "error":
              toast.error(data.message, { id: toastId });
              setIsLoading(false);
              break;
          }
        },
        onerror(err) {
          throw err;
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate quiz";
      if (message !== "Aborted") {
        toast.error(message, { id: toastId });
      }
    } finally {
      setIsLoading(false);
      setPdfText("");
      abortRef.current = null;
    }
  }, [prompt, pdfText, user, accessToken, isUserLoading, questionCount, difficulty, language, router]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    const savedPrompt = localStorage.getItem("quizPrompt");
    const prefillTopic = localStorage.getItem("prefillTopic");

    if (prefillTopic) {
      setPrompt(prefillTopic);
      localStorage.removeItem("prefillTopic");
    } else if (savedPrompt) {
      setPrompt(savedPrompt);
      localStorage.removeItem("quizPrompt");
    }
  }, []);

  const handleNext = useCallback(() => {
    if (!prompt.trim() && !pdfText) {
      toast.warning("Please enter a prompt or upload a PDF file");
      return;
    }

    if (isUserLoading) return;
    if (!user || !accessToken) {
      localStorage.setItem("quizPrompt", prompt);
      setIsSignInModalOpen(true);
      return;
    }

    setStep(2);
  }, [prompt, pdfText, user, accessToken, isUserLoading]);

  useEffect(() => {
    if (isLoading && step === 1) {
      setIsLoading(false);
    }
  }, [step, isLoading]);

  return (
    <div className="max-w-2xl w-full mx-auto">
      <div className="min-h-[275px] flex flex-col space-y-6">
        <h2 className="text-3xl sm:text-5xl font-bold text-center">{step === 1 ? "What are you studying?" : "Customize Your Practice Test"}</h2>
        <div className="flex-1 space-y-4">
          {step === 1 ? (
            <div className="space-y-2">
              <PromptInput value={prompt} onChange={setPrompt} disabled={isLoading} />
              <PDFUploader onUpload={setPdfText} onClear={() => setPdfText("")} disabled={isLoading} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          {isLoading ? (
            <Button variant="outline" onClick={handleCancel} className="w-full">
              Cancel
            </Button>
          ) : (
            <Button onClick={step === 1 ? handleNext : handleGenerateQuiz} className="w-full">
              {step === 1 ? "Next" : "Generate Quiz"}
            </Button>
          )}
        </div>
      </div>
      <SignInModal open={isSignInModalOpen} onOpenChange={setIsSignInModalOpen} isLoading={isLoading} />
    </div>
  );
});
QuizCreator.displayName = "QuizCreator";
