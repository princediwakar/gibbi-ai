// Path: components/shared/CountUp.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useInView } from "react-intersection-observer";

import { cn } from "@/lib/utils";

interface CountUpProps {
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  /** When true, the parent controls the trigger and CountUp skips its internal useInView. */
  start?: boolean;
}

export function CountUp({
  to,
  duration = 2000,
  className,
  suffix,
  prefix = "",
  start,
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const { ref, inView } = useInView({ triggerOnce: true });

  const animate = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      setCount(Math.floor(progress * to));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    },
    [to, duration],
  );

  // Determine whether to animate: external trigger takes precedence
  const shouldAnimate =
    start !== undefined ? start : inView && !hasTriggered;

  useEffect(() => {
    if (shouldAnimate && !hasTriggered) {
      setHasTriggered(true);
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [shouldAnimate, hasTriggered, animate]);

  const formatted = count.toLocaleString("en-US");

  return (
    <span ref={ref} className={cn("text-foreground", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
