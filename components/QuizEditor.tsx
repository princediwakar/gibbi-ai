"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { updateQuizDetails, updateQuizQuestions } from "@/lib/queries";

interface QuizEditorProps {
  quiz: Quiz;
}

export const QuizEditor = ({ quiz }: QuizEditorProps) => {
  const router = useRouter();
  const [editedQuiz, setEditedQuiz] = useState(quiz);
  const [isSaving, setIsSaving] = useState(false);

  const handleQuizChange = (field: keyof Quiz, value: string) => {
    setEditedQuiz((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setEditedQuiz((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      return { ...prev, questions: newQuestions };
    });
  };

  const handleOptionChange = (
    questionIndex: number,
    optionKey: string,
    value: string
  ) => {
    setEditedQuiz((prev) => {
      const newQuestions = [...prev.questions];
      const options = {
        ...newQuestions[questionIndex].options,
        [optionKey]: value,
      };
      newQuestions[questionIndex] = { ...newQuestions[questionIndex], options };
      return { ...prev, questions: newQuestions };
    });
  };

  const addQuestion = () => {
    setEditedQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: "",
          options: { A: "", B: "", C: "", D: "" },
          correct_option: "A",
        },
      ],
    }));
  };

  const removeQuestion = (index: number) => {
    setEditedQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update quiz details
      await updateQuizDetails(editedQuiz.quiz_id, {
        title: editedQuiz.title,
        description: editedQuiz.description,
        subject: editedQuiz.subject,
        topic: editedQuiz.topic,
        difficulty: editedQuiz.difficulty
      });
  
      // Update questions
      await updateQuizQuestions(editedQuiz.quiz_id, editedQuiz.questions);
  
      toast.success("Quiz updated successfully");
      router.push(`/quiz/${editedQuiz.slug}`);
    } catch (error) {
      toast.error("Failed to update quiz");
      console.error("Error updating quiz:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/quiz/${quiz.slug}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Edit Quiz</h2>
        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
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

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editedQuiz.title}
                onChange={(e) => handleQuizChange("title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editedQuiz.description}
                onChange={(e) =>
                  handleQuizChange("description", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={editedQuiz.subject}
                  onChange={(e) => handleQuizChange("subject", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Topic</Label>
                <Input
                  value={editedQuiz.topic}
                  onChange={(e) => handleQuizChange("topic", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={editedQuiz.difficulty}
                onValueChange={(value) => handleQuizChange("difficulty", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6">
          <div className="space-y-4">
            {editedQuiz.questions.map((question, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea
                    value={question.question_text}
                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        "question_text",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(question.options).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label>Option {key}</Label>
                      <Input
                        value={value}
                        onChange={(e) =>
                          handleOptionChange(index, key, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <Select
                    value={question.correct_option}
                    onValueChange={(value) =>
                      handleQuestionChange(index, "correct_option", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(question.options).map((key) => (
                        <SelectItem key={key} value={key}>
                          Option {key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}

            <Button onClick={addQuestion} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="text-center text-gray-500 py-6">
            Settings are currently unavailable
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
