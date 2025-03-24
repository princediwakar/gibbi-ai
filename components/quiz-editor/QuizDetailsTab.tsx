// components/QuizDetailsTab.tsx
"use client";

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

interface QuizDetailsTabProps {
  quiz: Quiz;
  onQuizChange: (field: keyof Quiz, value: string) => void;
  isEditing: boolean;
}

export function QuizDetailsTab({ quiz, onQuizChange, isEditing }: QuizDetailsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Title</Label>
        {isEditing ? (
          <Input
            id="title"
            value={quiz.title}
            onChange={(e) => onQuizChange("title", e.target.value)}
            className="mt-1"
          />
        ) : (
          <p className="text-gray-900 mt-1">{quiz.title}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        {isEditing ? (
          <Input
            id="description"
            value={quiz.description || ""}
            onChange={(e) => onQuizChange("description", e.target.value)}
            className="mt-1"
          />
        ) : (
          <p className="text-gray-900 mt-1">{quiz.description || "No description provided"}</p>
        )}
      </div>

      <div>
        <Label htmlFor="subject">Subject</Label>
        {isEditing ? (
          <Input
            id="subject"
            value={quiz.subject || ""}
            onChange={(e) => onQuizChange("subject", e.target.value)}
            className="mt-1"
          />
        ) : (
          <p className="text-gray-900 mt-1">{quiz.subject || "Not specified"}</p>
        )}
      </div>

      <div>
        <Label htmlFor="topic">Topic</Label>
        {isEditing ? (
          <Input
            id="topic"
            value={quiz.topic || ""}
            onChange={(e) => onQuizChange("topic", e.target.value)}
            className="mt-1"
          />
        ) : (
          <p className="text-gray-900 mt-1">{quiz.topic || "Not specified"}</p>
        )}
      </div>

      <div>
        <Label htmlFor="difficulty">Difficulty</Label>
        {isEditing ? (
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
        ) : (
          <p className="text-gray-900 mt-1">{quiz.difficulty || "Medium"}</p>
        )}
      </div>
    </div>
  );
}