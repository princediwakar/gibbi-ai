// Path: components/landing/PeerInsightsSection.tsx

"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import { CountUp } from "@/components/shared/CountUp";
import Link from "next/link";

const CIRCUMFERENCE = 2 * Math.PI * 40; // ~251.33

interface GaugeData {
  topic: string;
  value: number;
  colorClass: string;
  strokeColor: string;
}

const gaugeData: GaugeData[] = [
  {
    topic: "Rotational Mechanics",
    value: 28,
    colorClass: "text-destructive",
    strokeColor: "hsl(var(--destructive))",
  },
  {
    topic: "Thermodynamics",
    value: 54,
    colorClass: "text-amber-500",
    strokeColor: "#f59e0b",
  },
  {
    topic: "Reading Comprehension",
    value: 89,
    colorClass: "text-emerald-500",
    strokeColor: "#10b981",
  },
];

function GaugeCard({ topic, value, colorClass, strokeColor }: GaugeData) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  const dashOffset = CIRCUMFERENCE - (CIRCUMFERENCE * value) / 100;

  return (
    <div
      ref={ref}
      className="flex flex-col items-center rounded-2xl border bg-card p-6 shadow-sm"
    >
      <div className="relative mb-4 flex items-center justify-center">
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted-foreground/20"
          />
          {/* Foreground animated circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={
              inView ? { strokeDashoffset: dashOffset } : { strokeDashoffset: CIRCUMFERENCE }
            }
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        {/* Centered percentage */}
        <span
          className={`absolute text-2xl font-bold ${colorClass}`}
        >
          <CountUp to={value} suffix="%" />
        </span>
      </div>
      <p className="text-sm font-medium text-foreground">{topic}</p>
      <p className="mt-1 text-xs text-muted-foreground">Average Accuracy</p>
    </div>
  );
}

export default function PeerInsightsSection() {
  return (
    <section className="relative py-24">
      <MaxWidthWrapper>
        <div className="space-y-4 text-center mb-12">
          <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium tracking-wide text-primary uppercase">
            Live Peer Data
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-[40px]">
            Your Weak Spots, Predicted Before You Even Take The Test.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aggregated from thousands of practice sessions. See which topics
            students are struggling with right now.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {gaugeData.map((gauge) => (
            <GaugeCard key={gauge.topic} {...gauge} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          See what thousands of your peers are struggling with today. Don&apos;t
          fall behind the curve.
        </p>
        <div className="mt-4 text-center">
          <Link
            href="/insights"
            className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
          >
            Explore all topic insights &rarr;
          </Link>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
