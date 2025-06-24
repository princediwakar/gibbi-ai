import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default function BentoGrid() {
  return (
    <section className="py-24">
      <MaxWidthWrapper>
        <h2 className="mb-12 text-center font-heading text-3xl text-foreground md:text-4xl lg:text-5xl">
          Get Exam-Ready in 3 Simple Steps
        </h2>
        <div className="relative z-10 grid grid-cols-6 gap-6">
          <div className="absolute -z-10 h-full w-full rounded-2xl border border-dashed border-border bg-card" />

          {/* Step 1: Build Your Quiz */}
          <div className="group relative col-span-full flex flex-col items-center justify-center overflow-hidden rounded-2xl border bg-transparent p-8 shadow-sm transition-all hover:shadow-lg lg:col-span-2">
            <div className="flex size-24 items-center justify-center rounded-full border border-dashed border-primary/50 bg-primary/10">
              <Icons.edit className="size-12 text-primary" />
            </div>
            <h3 className="mt-6 text-center text-xl font-semibold text-foreground">1. Create Your Quiz</h3>
            <p className="mt-2 text-center text-muted-foreground">
              Provide a topic, paste text, or upload a file.
            </p>
          </div>

          {/* Step 2: Practice Smart */}
          <div className="group relative col-span-full flex flex-col items-center justify-center overflow-hidden rounded-2xl border bg-transparent p-8 shadow-sm transition-all hover:shadow-lg sm:col-span-3 lg:col-span-2">
            <div className="flex size-24 items-center justify-center rounded-full border border-dashed border-primary/50 bg-primary/10">
              <Icons.clock className="size-12 text-primary" />
            </div>
            <h3 className="mt-6 text-center text-xl font-semibold text-foreground">2. Practice with Purpose</h3>
            <p className="mt-2 text-center text-muted-foreground">
              Use timed tests to simulate real exam pressure.
            </p>
          </div>

          {/* Step 3: Grow Confidently */}
          <div className="group relative col-span-full flex flex-col items-center justify-center overflow-hidden rounded-2xl border bg-transparent p-8 shadow-sm transition-all hover:shadow-lg sm:col-span-3 lg:col-span-2">
            <div className="flex size-24 items-center justify-center rounded-full border border-dashed border-primary/50 bg-primary/10">
              <Icons.award className="size-12 text-primary" />
            </div>
            <h3 className="mt-6 text-center text-xl font-semibold text-foreground">3. Achieve Mastery</h3>
            <p className="mt-2 text-center text-muted-foreground">
              Review your results and track your improvement.
            </p>
          </div>

          {/* Collaboration & Flexibility */}
          <div className="group relative col-span-full flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border bg-transparent p-8 shadow-sm transition-all hover:shadow-lg md:flex-row lg:col-span-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-semibold text-foreground">Study, Share, and Succeed</h3>
              <p className="max-w-lg text-muted-foreground">
                Collaborate with friends by sharing quizzes, or export them for offline study sessions.
                </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full border border-dashed border-primary/50 bg-primary/10">
                <Icons.share className="size-8 text-primary" />
              </div>
              <div className="flex size-16 items-center justify-center rounded-full border border-dashed border-primary/50 bg-primary/10">
                <Icons.download className="size-8 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}