// Path: components/landing/ReliefComparisonSection.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMobile";
import { XCircle, CheckCircle2 } from "lucide-react";

const oldWayBullets = [
  "Blindly solving 100 questions hoping something sticks.",
  "Re-reading highlighted notes, unsure what actually matters.",
  "Forgetting last month's chapters when you need them most.",
];

const gibbiWayBullets = [
  "Solving 15 hyper-targeted questions that close your exact gaps.",
  "Learning from precise mistake analysis — every wrong answer teaches you why.",
  "Automated spaced-repetition reviews at the perfect moment.",
];

export default function ReliefComparisonSection() {
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState<"old" | "gibbi">("gibbi");

  return (
    <section className="relative py-24">
      <MaxWidthWrapper>
        <div className="text-center mb-16">
          <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium tracking-wide text-primary uppercase">
            See The Difference
          </span>
          <h2 className="mt-4 font-heading text-3xl md:text-4xl lg:text-[40px]">
            How You Study Now vs. How You&apos;ll Study Tomorrow
          </h2>
        </div>

        {isMobile ? (
          <MobileToggle activeTab={activeTab} setActiveTab={setActiveTab} />
        ) : (
          <DesktopCards />
        )}
      </MaxWidthWrapper>
    </section>
  );
}

function DesktopCards() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* The Old Way */}
      <div className="rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40">
            <XCircle className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground">
            The Old Way
          </h3>
        </div>
        <ul className="space-y-4">
          {oldWayBullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
              <span className="text-sm leading-relaxed text-muted-foreground">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* The GibbiAI Way */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-secondary/5 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            The GibbiAI Way
          </h3>
        </div>
        <ul className="space-y-4">
          {gibbiWayBullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span className="text-sm leading-relaxed text-foreground">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MobileToggle({
  activeTab,
  setActiveTab,
}: {
  activeTab: "old" | "gibbi";
  setActiveTab: (tab: "old" | "gibbi") => void;
}) {
  return (
    <div>
      {/* Tab buttons */}
      <div className="flex rounded-xl border bg-muted/30 p-1">
        <button
          onClick={() => setActiveTab("old")}
          className={cn(
            "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "old"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          The Old Way
        </button>
        <button
          onClick={() => setActiveTab("gibbi")}
          className={cn(
            "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "gibbi"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          The GibbiAI Way
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-6 min-h-[200px]">
        <AnimatePresence mode="wait">
          {activeTab === "old" ? (
            <motion.div
              key="old"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/40">
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-muted-foreground">
                  The Old Way
                </h3>
              </div>
              <ul className="space-y-3">
                {oldWayBullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.div
              key="gibbi"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border bg-gradient-to-br from-primary/5 to-secondary/5 p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  The GibbiAI Way
                </h3>
              </div>
              <ul className="space-y-3">
                {gibbiWayBullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="text-sm leading-relaxed text-foreground">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
