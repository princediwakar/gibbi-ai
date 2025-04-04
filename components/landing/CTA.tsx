import Link from "next/link";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default function CTA() {
  return (
    <section className="py-20">
      <MaxWidthWrapper className="text-center space-y-6">
        <h2 className="text-3xl font-heading text-foreground md:text-4xl">
          Ready to Ace Your Exams?
        </h2>
        <p className="text-lg text-muted-foreground">
          Take the reins—craft quizzes that match your goals, test your skills, and track your rise. GibbiAI is your study edge, every step of the way.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/create"
            className="inline-block rounded-lg bg-primary px-6 py-3 text-primary-foreground font-semibold transition-all hover:bg-primary/90"
          >
            Get Started Now
          </Link>
          <Link
            href="/quizzes"
            className="inline-block rounded-lg border bg-secondary px-6 py-3 text-secondary-foreground font-semibold transition-all hover:bg-secondary/90"
          >
            Explore Public Quizzes
          </Link>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}