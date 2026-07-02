// Path: components/tutor/setup/Step4Diagnostic.tsx

import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Step4Diagnostic() {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center gap-6 py-14">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Creating your assessment</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Generating 5 personalized questions based on your exam profile
            and active targets. This will only take a moment.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>Saving profile and preparing questions...</span>
        </div>
      </CardContent>
    </Card>
  );
}
