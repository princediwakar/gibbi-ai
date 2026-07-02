// Path: components/landing/SocialProofSection.tsx

import { HeaderSection } from "@/components/shared/HeaderSection";
import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import { studentTestimonials } from "@/config/landing";
import { SocialProofClient } from "./SocialProofSection.client";

export default function SocialProofSection() {
  const testimonials = studentTestimonials.slice(0, 6);

  return (
    <section className="relative py-24">
      <MaxWidthWrapper>
        <HeaderSection
          label="Trusted By Students"
          title="50,000+ Students Already Fixed Their Retention. They're Not Going Back."
          subtitle="Don't take our word for it. Here's what real students say after switching to GibbiAI."
        />
        <div className="mt-16 space-y-16">
          <SocialProofClient testimonials={testimonials} />
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
