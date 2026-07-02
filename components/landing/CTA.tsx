// Path: components/landing/CTA.tsx

import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import { SignInButton } from "../SignInButton";

export default function CTA() {
  return (
    <section className="relative py-24">
      <MaxWidthWrapper className="relative z-10 text-center space-y-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-full max-w-2xl rounded-full bg-primary/20 blur-3xl animate-pulse"
        />
        <h2 className="text-4xl font-heading text-foreground md:text-5xl text-balance">
          Your diagnostic takes 5 minutes. Better retention lasts a lifetime.
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          No credit card required. Zero spam. Just focused practice.
        </p>
        <div className="flex justify-center">
          <SignInButton buttonText="Start My Free Diagnostic" />
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
