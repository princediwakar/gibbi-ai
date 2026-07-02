// Path: components/landing/CognitiveFlowSection.tsx

import { HeaderSection } from "@/components/shared/HeaderSection";
import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import { Search, Target, BrainCircuit } from "lucide-react";

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

interface FlowStep {
  icon: typeof Search;
  title: string;
  description: string;
}

const FLOW_STEPS: FlowStep[] = [
  {
    icon: Search,
    title: "Spot the Gaps",
    description:
      "Take a 5-minute diagnostic. We find exactly what you don't know, so you don't waste time on what you do.",
  },
  {
    icon: Target,
    title: "Targeted Practice",
    description:
      "Practice specific topics aligning with your daily classes, guided by AI that explains every trap.",
  },
  {
    icon: BrainCircuit,
    title: "Perfect Timing",
    description:
      "Our algorithm tracks your memory decay and schedules reviews on the exact day you are about to forget. Retain it forever.",
  },
];

// ---------------------------------------------------------------------------
// Component (Server)
// ---------------------------------------------------------------------------

export default function CognitiveFlowSection() {
  return (
    <section className="relative py-24">
      <MaxWidthWrapper>
        <HeaderSection
          label="How It Works"
          title="Three steps. No all-nighters. No wasted effort."
          subtitle="Traditional prep means solving 50 questions on a topic you already know. GibbiAI finds the gaps you don't see and fixes them permanently."
        />

        <div className="relative mt-16">
          {/* ---- Connecting line (desktop only) ---- */}
          <div
            aria-hidden="true"
            className="absolute left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] top-12 -z-10 hidden h-0.5 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 md:block"
          />

          {/* ---- Step cards ---- */}
          <div className="grid gap-8 md:grid-cols-3">
            {FLOW_STEPS.map((step, i) => (
              <FlowCard
                key={step.title}
                step={step}
                index={i}
              />
            ))}
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FlowCard (internal, no "use client" — hover effects handled via CSS group)
// ---------------------------------------------------------------------------

function FlowCard({ step, index }: { step: FlowStep; index: number }) {
  const Icon = step.icon;

  return (
    <div className="group relative rounded-2xl border bg-card p-8 transition-shadow hover:shadow-lg">
      {/* Step number dot (mobile) */}
      <span className="mb-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground md:hidden">
        {index + 1}
      </span>

      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
        <Icon className="h-6 w-6 text-primary" />
      </div>

      {/* Title */}
      <h3 className="mt-5 text-lg font-semibold text-foreground">
        {step.title}
      </h3>

      {/* Description */}
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {step.description}
      </p>
    </div>
  );
}
