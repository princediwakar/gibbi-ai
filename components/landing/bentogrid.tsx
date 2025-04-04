import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default function BentoGrid() {
  return (
    <section className="py-32">
      <MaxWidthWrapper>
        <h2 className="text-center font-heading text-2xl text-foreground md:text-4xl lg:text-[40px] mb-12">
          Quiz Success in 3 Easy Steps + Flexibility
        </h2>
        <div className="relative z-10 grid grid-cols-6 gap-6">
          {/* Step 1: Build Your Quiz */}
          <div className="group relative col-span-full overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/70 lg:col-span-2">
            <div className="relative m-auto size-fit">
              <div className="relative flex h-24 w-56 items-center">
                <svg
                  className="absolute inset-0 size-full text-muted-foreground/30 transition-colors group-hover:text-primary/50"
                  viewBox="0 0 254 104"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 52 C10 20 50 10 127 52 C204 94 244 84 244 52"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="mx-auto block w-fit font-heading text-5xl text-foreground transition-colors group-hover:text-primary">
                  1
                </span>
              </div>
              <h3 className="mt-6 text-center font-semibold text-xl text-foreground">Build Your Quiz</h3>
              <p className="mt-2 text-center text-muted-foreground">
                Type a topic, upload a PDF, or paste text—customize with MCQs or True/False in moments.
              </p>
            </div>
          </div>

          {/* Step 2: Practice Smart */}
          <div className="group relative col-span-full overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/70 sm:col-span-3 lg:col-span-2">
            <div>
              <div className="relative mx-auto flex aspect-square size-32 rounded-full border border-border before:absolute before:-inset-2 before:rounded-full before:border before:bg-muted/20 dark:before:bg-muted/10">
                <svg
                  className="m-auto h-fit w-24 text-muted-foreground/30 transition-colors group-hover:text-secondary/50"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" />
                  <path d="M50 20 V50 L70 60" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </div>
              <div className="relative z-10 mt-8 space-y-2 text-center">
                <h3 className="text-xl font-semibold text-foreground">Practice Smart</h3>
                <p className="text-muted-foreground">
                  Test yourself with a timer—focus on what you need, feel the exam vibe.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Grow Confidently */}
          <div className="group relative col-span-full overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/70 sm:col-span-3 lg:col-span-2">
            <div>
              <svg
                className="h-32 w-full text-muted-foreground/20 transition-colors group-hover:text-secondary/40"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 80 L40 40 L60 60 L80 20"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
              <div className="relative z-10 mt-8 space-y-2 text-center">
                <h3 className="text-xl font-semibold text-foreground">Grow Confidently</h3>
                <p className="text-muted-foreground">
                  See results, read explanations, and watch your progress soar—simple and effective.
                </p>
              </div>
            </div>
          </div>

          {/* Collaboration & Flexibility */}
          <div className="group relative col-span-full overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/70 lg:col-span-6 max-h-[400px]">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col justify-center space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Study Your Way — Solo or Together!</h3>
                <p className="text-sm text-muted-foreground">
                  Share quizzes with friends or groups via a single click—perfect for collaborative prep.
                </p>
                <p className="text-sm text-muted-foreground">
                  Go offline with ease—export to PDF, Excel, or Google Sheets for study anywhere.
                </p>
              </div>
              <div className="relative flex items-center justify-center sm:ml-4">
                <div className="absolute left-3 top-2 flex gap-1 sm:left-0 sm:top-0">
                  <span className="block size-2 rounded-full border border-border"></span>
                  <span className="block size-2 rounded-full border border-border"></span>
                  <span className="block size-2 rounded-full border border-border"></span>
                </div>
                <svg
                  className="w-full h-32 max-h-40 text-primary/60 transition-colors group-hover:text-primary/80"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 80 Q50 50 80 20"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="20" cy="80" r="5" fill="currentColor" />
                  <circle cx="80" cy="20" r="5" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}