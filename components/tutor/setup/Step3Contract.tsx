// Path: components/tutor/setup/Step3Contract.tsx

import { Brain, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Step3ContractProps {
  isSubmitting: boolean;
  isExisting: boolean;
  onStartDiagnostic: () => void;
  onSaveOnly: () => void;
}

export function Step3Contract({
  isSubmitting,
  isExisting,
  onStartDiagnostic,
  onSaveOnly,
}: Step3ContractProps) {
  return (
    <Card className="w-full">
      <CardContent className="space-y-6 pt-6">
        {/* Brain icon and heading */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">The Forgetting Curve</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Without review, you will forget approximately 70% of what you learn
              within 6 days.
            </p>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid gap-3">
          <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
            <p className="text-sm font-medium">Why an initial assessment?</p>
            <p className="text-sm text-muted-foreground mt-1">
              We measure what you know right now across every topic. No studying
              required — just 5 quick questions to map your strengths and gaps.
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
            <p className="text-sm font-medium">What happens next?</p>
            <p className="text-sm text-muted-foreground mt-1">
              After the assessment, you will get a personalized dashboard with your
              readiness index, weak spots, and a daily review plan tuned to your
              exam date.
            </p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="space-y-3 pt-2">
          <Button
            size="lg"
            className="w-full"
            disabled={isSubmitting}
            onClick={onStartDiagnostic}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating assessment...
              </>
            ) : (
              "Start My Assessment"
            )}
          </Button>

          {isExisting && (
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
              onClick={onSaveOnly}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
