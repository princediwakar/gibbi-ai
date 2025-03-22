import { Button } from "@/components/ui/button";
import { renderMathContent } from "@/lib/quiz-utils";

interface QuizQuestionProps {
  question: string;
  options: { key: string; value: string }[];
  onAnswer: (key: string) => void;
}

export const QuizQuestion = ({ question, options, onAnswer }: QuizQuestionProps) => (
  <div className="space-y-6">
    <div className="text-lg font-medium">
      {renderMathContent(question)}
    </div>
    <div className="space-y-3">
      {options.map(({ key, value }) => (
        <Button
          key={key}
          variant="outline"
          className="w-full h-auto min-h-[3rem] py-2 px-4 whitespace-normal text-left"
          onClick={() => onAnswer(key)}
        >
          <span className="w-full break-words">
            {renderMathContent(value)}
          </span>
        </Button>
      ))}
    </div>
  </div>
); 