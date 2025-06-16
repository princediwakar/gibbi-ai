interface QuizProgressProps {
  current: number; // Now expects 1-based index
  total: number;
}

export const QuizProgress = ({ current, total }: QuizProgressProps) => (
  <>
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
      <div
        className="bg-primary h-2.5 rounded-full"
        style={{ width: `${(current / total) * 100}%` }} // Removed +1 here
      ></div>
    </div>
    <div className="text-sm text-muted-foreground mb-6">
      Question {current} of {total} {/* Removed +1 here */}
    </div>
  </>
);