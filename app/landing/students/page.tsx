// Path: app/landing/students/page.tsx

import dynamic from "next/dynamic";
import InteractiveDemoHero from "@/components/landing/InteractiveDemoHero";
import CognitiveFlowSection from "@/components/landing/CognitiveFlowSection";
import ReliefComparisonSection from "@/components/landing/ReliefComparisonSection";
import CTA from "@/components/landing/CTA";
import SiteFooter from "@/components/landing/SiteFooter";

const SocialProofSection = dynamic(
  () => import("@/components/landing/SocialProofSection"),
);
const PeerInsightsSection = dynamic(
  () => import("@/components/landing/PeerInsightsSection"),
);

const StudentsLanding = async () => {
  return (
    <div>
      <InteractiveDemoHero />
      <SocialProofSection />
      <CognitiveFlowSection />
      <ReliefComparisonSection />
      <PeerInsightsSection />
      <CTA />
      <SiteFooter />
    </div>
  );
};

export default StudentsLanding;
