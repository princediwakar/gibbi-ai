// Path: components/landing/SocialProofSection.client.tsx
"use client";

import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import Image from "next/image";
import type { TestimonialType } from "@/types";
import { CountUp } from "@/components/shared/CountUp";

// ---------------------------------------------------------------------------
// Stats definitions
// ---------------------------------------------------------------------------

const STATS = [
  { to: 50000, suffix: "+", label: "Students Guided" },
  { to: 2, suffix: "M+", label: "Questions Mastered" },
  { to: 10, suffix: "+", label: "Exam Tracks" },
  { to: 94, suffix: "%", label: "Report Higher Confidence" },
] as const;

// ---------------------------------------------------------------------------
// StatsBar
// ---------------------------------------------------------------------------

function StatsBar() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-6 md:grid-cols-4"
    >
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center rounded-2xl border bg-card p-6 text-center"
        >
          <span className="text-3xl font-bold text-foreground md:text-4xl">
            <CountUp to={stat.to} suffix={stat.suffix} start={inView} />
          </span>
          <span className="mt-2 text-sm text-muted-foreground">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TestimonialGrid
// ---------------------------------------------------------------------------

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: TestimonialType;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="rounded-2xl border bg-card p-6"
    >
      <div className="flex items-center gap-3">
        <Image
          src={testimonial.image}
          alt={testimonial.name}
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {testimonial.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {testimonial.job}
          </p>
          <p className="truncate text-xs text-muted-foreground/70">
            {testimonial.location}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{testimonial.review}&rdquo;
      </p>
    </motion.div>
  );
}

function TestimonialGrid({
  testimonials,
}: {
  testimonials: TestimonialType[];
}) {
  return (
    <div className="columns-1 gap-6 space-y-6 md:columns-3">
      {testimonials.map((t, i) => (
        <TestimonialCard key={t.name + i} testimonial={t} index={i} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exported client wrapper
// ---------------------------------------------------------------------------

export function SocialProofClient({
  testimonials,
}: {
  testimonials: TestimonialType[];
}) {
  return (
    <>
      <StatsBar />
      <TestimonialGrid testimonials={testimonials} />
    </>
  );
}
