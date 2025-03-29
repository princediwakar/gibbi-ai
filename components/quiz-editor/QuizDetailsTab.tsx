"use client";

import { useState, useEffect } from "react";
import { Quiz } from "@/types/quiz";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";

interface QuizDetailsTabProps {
  quiz: Quiz;
  onQuizChange: (field: keyof Quiz, value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function QuizDetailsTab({ quiz, onQuizChange, onSave, isSaving }: QuizDetailsTabProps) {
  const [initialQuiz, setInitialQuiz] = useState<Quiz>(quiz);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if any field has been updated
    const changesDetected =
      quiz.title !== initialQuiz.title ||
      quiz.description !== initialQuiz.description ||
      quiz.subject !== initialQuiz.subject ||
      quiz.topic !== initialQuiz.topic ||
      quiz.difficulty !== initialQuiz.difficulty;

    setHasChanges(changesDetected);
  }, [quiz, initialQuiz]);

  const handleSave = () => {
    onSave();
    setInitialQuiz(quiz); // Reset initial state after saving
    setHasChanges(false); // Reset changes flag
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title" className="text-muted-foreground">Title</Label>
        <Input
          id="title"
          value={quiz.title}
          onChange={(e) => onQuizChange("title", e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-muted-foreground">Description</Label>
        <Input
          id="description"
          value={quiz.description || ""}
          onChange={(e) => onQuizChange("description", e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="subject" className="text-muted-foreground">Subject</Label>
        <Input
          id="subject"
          value={quiz.subject || ""}
          onChange={(e) => onQuizChange("subject", e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="topic" className="text-muted-foreground">Topic</Label>
        <Input
          id="topic"
          value={quiz.topic || ""}
          onChange={(e) => onQuizChange("topic", e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="difficulty" className="text-muted-foreground">Difficulty</Label>
        <Select
          value={quiz.difficulty || "Medium"}
          onValueChange={(value) => onQuizChange("difficulty", value)}
        >
          <SelectTrigger id="difficulty" className="mt-1">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="questionCount" className="text-muted-foreground">Number of Questions</Label>
        <p className="mt-1" id="questionCount">
          {quiz.questions.length}
        </p>
      </div>

      {hasChanges && (
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      )}
    </div>
  );
}