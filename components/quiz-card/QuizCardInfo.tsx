
// components/quiz/QuizCardInfo.tsx
import { FC } from "react";
import { Badge } from "@/components/ui/badge";

interface QuizCardInfoProps {
  title: string;
  questionCount?: number;
  topic?: string;
  creatorName?: string;
  description?: string;
}

export const QuizCardInfo: FC<QuizCardInfoProps> = ({
  title,
  questionCount,
  topic,
  creatorName,
  description,
}) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold line-clamp-2">{title}</h2>
    <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
      {questionCount && (
        <Badge variant="secondary">
          {questionCount} {questionCount === 1 ? "question" : "questions"}
        </Badge>
      )}
      {topic && <span>{topic}</span>}
    </div>
    {creatorName && (
      <p className="text-xs text-muted-foreground">
        Created by: <span className="font-medium">{creatorName}</span>
      </p>
    )}
    <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
      {description || "No description available"}
    </p>
  </div>
);
