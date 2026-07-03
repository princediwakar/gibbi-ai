"use client";

import { useState, useCallback } from "react";
import { Eye, EyeOff, Target, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PredictionBand {
  overallPercentile: number;
  overallBandLower: number;
  overallBandUpper: number;
  overallBandWidth: number;
  calibrationSource: string;
  disclaimer: string;
  isFrozen: boolean;
  totalTrackedSessions: number;
}

export interface ProjectionHeroProps {
  prediction: PredictionBand | null;
}

function getBandColor(width: number) {
  if (width <= 4) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  if (width <= 8) return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  return "border-rose-500/30 bg-rose-500/10 text-rose-400";
}

function getCalibrationBadge(source: string) {
  switch (source) {
    case "proprietary": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "blended": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
}

const STORAGE_KEY = "gibbi_projection_hidden";

export function ProjectionHero({ prediction }: ProjectionHeroProps) {
  const [hidden, setHidden] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const toggleHidden = useCallback(() => {
    setHidden((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  if (!prediction) {
    return (
      <Card className="border-dashed border-white/10 bg-slate-900/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-slate-300">
                No projection yet
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Complete a tracked session to see your projected JEE percentile
                band. Uses public NTA data until you&apos;ve built enough practice
                history.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      {/* Hide Projection Toggle */}
      <div className="absolute top-3 right-3 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleHidden}
          className="h-7 px-2 text-xs text-slate-500 hover:text-slate-300"
          title={hidden ? "Show projection" : "Hide projection"}
        >
          {hidden ? (
            <Eye className="w-3.5 h-3.5 mr-1.5" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 mr-1.5" />
          )}
          {hidden ? "Show" : "Hide"} Projection
        </Button>
      </div>

      <Card
        className={`border-white/10 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 relative overflow-hidden transition-all duration-300 ${prediction.isFrozen ? "ring-1 ring-amber-500/30" : ""}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-indigo-500/5 to-transparent" />

        <CardContent className={`relative p-6 ${hidden ? "blur-md select-none" : ""}`}>
          {/* Frozen indicator */}
          {prediction.isFrozen && (
            <div className="flex items-center justify-center mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/25">
                <Lock className="w-3 h-3" />
                Frozen — 7 days pre-exam. This band is locked.
              </span>
            </div>
          )}

          {/* Hero Metric */}
          <div className="text-center">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
              Projected JEE Main Percentile
            </p>
            <div className="flex items-baseline justify-center gap-1 mb-3">
              <span className="text-5xl font-bold tracking-tight text-white">
                {prediction.overallBandLower}–{prediction.overallBandUpper}
              </span>
            </div>

            {/* Band width badge */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm ${getBandColor(prediction.overallBandWidth)}`}>
                <span className="font-medium">
                  ±{Math.round(prediction.overallBandWidth / 2)} pts
                </span>
                <span className="text-xs opacity-60">
                  (width: {prediction.overallBandWidth})
                </span>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <span>
                {prediction.totalTrackedSessions} tracked session{prediction.totalTrackedSessions !== 1 ? "s" : ""}
              </span>
              {prediction.calibrationSource !== "proprietary" && (
                <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${getCalibrationBadge(prediction.calibrationSource)}`}>
                  {prediction.calibrationSource === "public_nta" ? "NTA Prior" : "Blended"}
                </span>
              )}
            </div>
          </div>
        </CardContent>

        {/* Disclaimer */}
        <div className="px-6 pb-4">
          <p className="text-xs text-slate-600 text-center leading-relaxed">
            {prediction.disclaimer || "Your band sharpens with every tracked session. Based on public NTA normalization tables (2025–2026 cycles)."}
          </p>
        </div>
      </Card>
    </div>
  );
}
