// components/QuestionEditor.tsx
"use client";

import { memo } from "react";
import { Question } from "@/types/quiz";
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
import { X } from "lucide-react";

interface QuestionEditorProps {
  question: Question;
  questionIndex: number; // Added to display question number
  onChange: (
    questionId: number | undefined,
    field: string,
    value: string,
    optionKey?: string
  ) => void;
  onRemove: (questionId: number | undefined) => void;
  isEditing: boolean;
}

export const QuestionEditor = memo(
  ({ question, questionIndex, onChange, onRemove, isEditing }: QuestionEditorProps) => {
    return (
      <div className="border p-4 rounded-lg space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Question {questionIndex + 1}</h4>
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(question.question_id)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label>Question Text</Label>
          {isEditing ? (
            <Textarea
              value={question.question_text}
              onChange={(e) => onChange(question.question_id, "question_text", e.target.value)}
              placeholder="Enter question text"
            />
          ) : (
            <p className="text-gray-900">{question.question_text || "No question text"}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(question.options).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label>Option {key.toUpperCase()}</Label>
              {isEditing ? (
                <Input
                  value={value}
                  onChange={(e) => onChange(question.question_id, "options", e.target.value, key)}
                  placeholder={`Option ${key.toUpperCase()}`}
                />
              ) : (
                <p className="text-gray-900">{value || "Not specified"}</p>
              )}
            </div>
          ))}
        </div>
        {isEditing && (
        <div className="space-y-2">
          <Label>Correct Answer</Label>
          
            <Select
              value={question.correct_option}
              onValueChange={(value) => onChange(question.question_id, "correct_option", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(question.options).map((key) => (
                  <SelectItem key={key} value={key}>
                    Option {key.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
          )}
      </div>
    );
  }
);

QuestionEditor.displayName = "QuestionEditor";