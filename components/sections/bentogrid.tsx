import Image from "next/image";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default function BentoGrid() {
  return (
    <section className="py-32">
      <MaxWidthWrapper>
        <div className="relative z-10 grid grid-cols-6 gap-3">
          {/* First card - AI Generation */}
          <div className="relative col-span-full flex overflow-hidden rounded-2xl border bg-background p-8 lg:col-span-2">
            <div className="relative m-auto size-fit">
              <div className="relative flex h-24 w-56 items-center">
                <svg
                  className="absolute inset-0 size-full text-muted-foreground/30"
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
                <span className="text-gradient_indigo-purple mx-auto block w-fit font-heading text-5xl">
                  AI
                </span>
              </div>
              <h2 className="mt-6 text-center font-heading text-3xl md:text-4xl lg:text-[40px]">
                Powered Generation
              </h2>
            </div>
          </div>

          {/* Second card - Editing */}
          <div className="relative col-span-full overflow-hidden rounded-2xl border bg-background p-8 sm:col-span-3 lg:col-span-2">
            <div>
              <div className="relative mx-auto flex aspect-square size-32 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border before:bg-muted/20 dark:before:border-white/5">
                <svg
                  className="m-auto h-fit w-24"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    className="text-muted-foreground/30"
                    d="M20 80 L80 20"
                    stroke="currentColor"
                    strokeWidth="6"
                  />
                  <path
                    className="text-primary"
                    d="M30 70 L70 30 M50 10 V90 M10 50 H90"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="relative z-10 mt-8 space-y-1.5 text-center">
                <h2 className="text-lg font-medium text-foreground">
                  Real-Time Editing
                </h2>
                <p className="text-muted-foreground">
                  Customize your quizzes instantly with our intuitive editor.
                </p>
              </div>
            </div>
          </div>

          {/* Third card - Downloads */}
          <div className="relative col-span-full overflow-hidden rounded-2xl border bg-background p-8 sm:col-span-3 lg:col-span-2">
            <div>
              <div>
                <svg
                  className="h-32 w-full"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="10"
                    y="10"
                    width="80"
                    height="80"
                    rx="10"
                    className="text-muted-foreground/20"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    className="text-primary"
                    d="M50 20 V60 M40 50 L50 60 L60 50 M30 70 H70"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="relative z-10 mt-8 space-y-1.5 text-center">
                <h2 className="text-lg font-medium text-foreground">
                  PDF & Excel Exports
                </h2>
                <p className="text-muted-foreground">
                  Download your quizzes in PDF or Excel for offline use.
                </p>
              </div>
            </div>
          </div>

          {/* Second row - Sharing */}
          <div className="relative col-span-full overflow-hidden rounded-2xl border bg-background p-8 lg:col-span-3">
            <div className="grid sm:grid-cols-2">
              <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                <div className="relative flex aspect-square size-12 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:bg-white/5 dark:before:border-white/5 dark:before:bg-white/5">
                  <svg
                    className="m-auto size-6"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      d="M18 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2m10-8l-4 4m0 0L6 8m4 4V4"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-medium text-foreground">
                    Easy Sharing
                  </h2>
                  <p className="text-muted-foreground">
                    Share your quizzes with a single link or export.
                  </p>
                </div>
              </div>
              <div className="relative -mb-10 -mr-10 mt-8 h-fit rounded-tl-xl border bg-muted/30 pt-6 sm:ml-6 sm:mt-auto">
                <div className="absolute left-3 top-2 flex gap-1">
                  <span className="block size-2 rounded-full border border-border"></span>
                  <span className="block size-2 rounded-full border border-border"></span>
                  <span className="block size-2 rounded-full border border-border"></span>
                </div>
                <svg
                  className="w-full text-indigo-600/60 sm:w-[150%]"
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

          {/* Fifth card - Community/Stats */}
          <div className="relative col-span-full overflow-hidden rounded-2xl border bg-background p-8 lg:col-span-3">
            <div className="grid h-full sm:grid-cols-2">
              <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                <div className="relative flex aspect-square size-12 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:bg-white/5 dark:before:border-white/5 dark:before:bg-white/5">
                  <svg
                    className="m-auto size-6"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      d="M12 4v16m-8-8h16"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-medium text-foreground">
                    Track & Grow
                  </h2>
                  <p className="text-muted-foreground">
                    Monitor quiz performance with detailed analytics.
                  </p>
                </div>
              </div>
              <div className="relative mt-6 sm:-my-8 sm:-mr-8">
                <div className="relative flex h-full flex-col justify-center space-y-6 py-6">
                  <div className="relative flex w-full items-center justify-end gap-2">
                    <span className="block h-fit rounded-md border bg-muted/50 px-2 py-1 text-xs">
                      85% Score
                    </span>
                    <div className="size-7 ring-4 ring-background">
                      <Image
                        width={100}
                        height={100}
                        className="size-full rounded-full border"
                        src="https://randomuser.me/api/portraits/men/4.jpg"
                        alt="user-avatar"
                      />
                    </div>
                  </div>
                  <div className="relative flex w-full items-center justify-end gap-2">
                    <span className="block h-fit rounded-md border bg-muted/50 px-2 py-1 text-xs">
                      92% Score
                    </span>
                    <div className="size-7 ring-4 ring-background">
                      <Image
                        width={100}
                        height={100}
                        className="size-full rounded-full border"
                        src="https://randomuser.me/api/portraits/men/6.jpg"
                        alt="user-avatar"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}