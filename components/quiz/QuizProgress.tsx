interface QuizProgressProps {
  current: number;
  total: number;
}

export const QuizProgress = ({ current, total }: QuizProgressProps) => (
  <>
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
      <div
        className="bg-primary h-2.5 rounded-full"
        style={{ width: `${((current + 1) / total) * 100}%` }}
      ></div>
    </div>
    <div className="text-sm text-gray-600 mb-6">
      Question {current + 1} of {total}
    </div>
  </>
); 