"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PromptInput } from "@/components/quiz-creator/PromptInput"; // Adjust path if needed
import { SignInModal } from "@/components/SignInModal"; // Adjust path if needed
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser"; // Assuming this exists to track user state

export default function QuickQuizStart() {
  const [prompt, setPrompt] = useState("");
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser(); // Hook to get current user

  const handleNext = useCallback(() => {
    if (!prompt.trim()) {
      toast.warning("Please enter a topic to start your quiz!");
      return;
    }
    localStorage.setItem("quizPrompt", prompt); // Save prompt to localStorage, as in QuizCreator
    setIsSignInModalOpen(true);
    setIsLoading(false); // End loading
  }, [prompt]);

  // Check user status after modal closes and redirect if signed in
  useEffect(() => {
    if (!isSignInModalOpen && user) {
      router.refresh(); //
    }
  }, [isSignInModalOpen, user, router]);

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-5xl font-bold text-center text-foreground mb-6">
        What’s your quiz about?
      </h2>
      <div className="space-y-6">
        <PromptInput value={prompt} onChange={setPrompt} disabled={isLoading} />
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground transition-all hover:bg-primary/90"
        >
          Next
        </Button>
      </div>
      <SignInModal
        open={isSignInModalOpen}
        onOpenChange={setIsSignInModalOpen}
        isLoading={isLoading}
      />
    </div>
  );
}