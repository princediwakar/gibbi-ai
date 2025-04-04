import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function HeroLanding() {
  const heroImages = [
    "/_static/illustrations/hero-image-1.png",
    "/_static/illustrations/hero-image-2.png"
  ];
  const randomHeroImage = heroImages[Math.floor(Math.random() * heroImages.length)];
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container flex max-w-5xl flex-col items-center gap-6 lg:flex-row lg:gap-8 lg:items-center">
        <div className="space-y-4 lg:w-1/2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Overwhelmed by Exams? Take Charge with{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              GibbiAI
            </span>
          </h1>
          <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
            Create custom quizzes from topics, PDFs, or text—assess your knowledge and track progress effortlessly.
          </p>
          <p className="max-w-lg text-sm text-foreground sm:text-base">
            Say goodbye to endless notes & flashcards. GibbiAI crafts tailored quizzes fast, preps you for the real thing, and shows your strengths.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/create"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-primary px-5 text-primary-foreground transition-all hover:bg-primary/90"
              )}
            >
              Create Your First Quiz
            </Link>
            <Link
              href="/quizzes"
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                " transition-all"
              )}
            >
              Try a Sample Quiz
            </Link>
          </div>
        </div>
        <div className="w-full max-w-md lg:w-1/2 lg:max-w-none">
          <Image
            src={randomHeroImage}
            alt="Student transitioning from exam stress to confidence with GibbiAI quiz results"
            width={600}
            height={450}
            className="rounded-xl shadow-lg"
            priority
          />
        </div>
      </div>
    </section>
  );
}