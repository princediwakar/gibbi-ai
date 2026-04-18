import Link from "next/link";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { SignInButton } from "../SignInButton";

export default function CTA() {
  return (
    <section className="relative py-24">
      <MaxWidthWrapper className="relative z-10 text-center space-y-6">
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-full max-w-2xl rounded-full bg-primary/20 blur-3xl" />
        <h2 className="text-4xl font-heading text-foreground md:text-5xl">
          Your Last "I'll Just Cram" Session Ends Tomorrow
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Your exam doesn't. Three practice tests free. 30 seconds to your first one. No credit card.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <SignInButton buttonText="Start Practicing for Free" />
          <Link
            href="/quizzes"
            className={cn(buttonVariants({ variant: "outline" }), "transition-all")}
          >
            Browse Practice Tests
          </Link>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}