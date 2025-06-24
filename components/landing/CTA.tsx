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
          Stop Cramming, Start Mastering
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Transform your notes into powerful quizzes and take control of your learning today. Your path to better grades starts here.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <SignInButton buttonText="Get Started for Free" />
          <Link
            href="/quizzes"
            className={cn(buttonVariants({ variant: "outline" }), "transition-all")}
          >
            Explore Quizzes
          </Link>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}