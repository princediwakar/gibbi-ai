// Path: components/tutor/SetupForm.tsx
"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { getTimeMode } from "@/lib/sm2";
import { TUTOR_ROUTES, TUTOR_CONFIG } from "@/lib/constants/tutor";
import { createExamProfile } from "@/lib/actions/tutor";
import type { TimeMode, SelfAssessment } from "@/types/tutor";
import taxonomy from "@/lib/taxonomies.json";

import { StepIndicator, STEPS } from "./setup/StepIndicator";
import { Step1RealityAnchor } from "./setup/Step1RealityAnchor";
import { Step3Contract } from "./setup/Step3Contract";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type TaxonomyData = Record<string, Record<string, string[]>>;
const taxonomyData = taxonomy as unknown as TaxonomyData;

function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(a: string, b: string): number {
  return Math.ceil(
    (new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24),
  );
}

function readLandingPrefill(): { exam?: string; targetDate?: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("landingPrefill");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SetupFormPrefill {
  exam: string;
  targetDate: string;
  assessments: Record<string, SelfAssessment>;
  isExisting: boolean;
  activeTargets?: string[];
}

interface SetupFormProps {
  prefill: SetupFormPrefill | null;
  examNames: string[];
  examSubjects: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export function SetupForm({ prefill, examNames, examSubjects }: SetupFormProps) {
  const router = useRouter();

  // ---- Step state ----
  const [step, setStep] = useState(1);

  // ---- Form state ----
  const [exam, setExam] = useState<string>(() => {
    if (prefill?.exam) return prefill.exam;
    const landing = readLandingPrefill();
    return landing?.exam ?? "";
  });
  const [targetDate, setTargetDate] = useState<string>(() => {
    if (prefill?.targetDate) return prefill.targetDate;
    const landing = readLandingPrefill();
    return landing?.targetDate ?? "";
  });
  const [assessments, setAssessments] = useState<Record<string, SelfAssessment>>(
    prefill?.assessments ?? {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectRef = useRef<HTMLButtonElement>(null);
  const isExisting = prefill?.isExisting ?? false;

  useEffect(() => {
    const timer = setTimeout(() => selectRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, []);

  // Consume landing page prefill from localStorage, then clear it
  useEffect(() => {
    try {
      localStorage.removeItem("landingPrefill");
    } catch {
      /* ignore */
    }
  }, []);

  // ---- Derived ----
  const subjects = useMemo<string[]>(() => {
    if (!exam) return [];
    return examSubjects[exam] ?? [];
  }, [exam, examSubjects]);

  const timeMode = useMemo<TimeMode | null>(() => {
    if (!targetDate) return null;
    const days = daysBetween(targetDate, getTodayISO());
    return getTimeMode(days);
  }, [targetDate]);

  const allAssessed = useMemo(() => {
    if (subjects.length === 0) return false;
    return subjects.every((s) => assessments[s] != null);
  }, [subjects, assessments]);

  // ---- Step 1 validity ----
  const step1Valid = exam && targetDate && allAssessed;

  // ---- Handlers ----
  const handleExamChange = useCallback((value: string) => {
    setExam(value);
    setAssessments({});
  }, []);

  const handleAssessmentChange = (subject: string, level: SelfAssessment) => {
    setAssessments((prev) => ({ ...prev, [subject]: level }));
  };

  const goBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const goNext = () => {
    setStep((prev) => Math.min(STEPS.length, prev + 1));
  };

  // ---- Save profile helper ----
  const saveProfile = useCallback(async () => {
    if (!step1Valid || !timeMode) return null;

    return createExamProfile({
      exam_name: exam,
      target_date: targetDate,
      self_assessments: assessments as Record<string, SelfAssessment>,
      active_targets: [],
    });
  }, [step1Valid, timeMode, exam, targetDate, assessments]);

  // ---- Save only (existing profiles) ----
  const handleSaveOnly = useCallback(async () => {
    setIsSubmitting(true);
    const result = await saveProfile();
    setIsSubmitting(false);

    if (!result) return;
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Profile saved.", { duration: 3000 });
    }
  }, [saveProfile]);

  // ---- Complete Setup (skip diagnostic) ----
  const handleCompleteSetup = useCallback(async () => {
    setIsSubmitting(true);

    const result = await saveProfile();

    if (!result) {
      setIsSubmitting(false);
      return;
    }
    if ("error" in result) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    toast.success("Profile created! Redirecting...", { duration: 2000 });
    router.push(TUTOR_ROUTES.DASHBOARD);
  }, [saveProfile, router]);

  // ---- Page metadata ----
  const pageTitle = isExisting ? "Update your exam profile" : "Let's set up your prep";
  const pageDescription = isExisting
    ? "Adjust your exam, target date, or self-assessments."
    : "Tell us about your exam and where you stand. We'll handle the rest.";

  // ---- Render step content ----
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Step1RealityAnchor
            exam={exam}
            examNames={examNames}
            targetDate={targetDate}
            subjects={subjects}
            assessments={assessments}
            timeMode={timeMode}
            onExamChange={handleExamChange}
            onTargetDateChange={setTargetDate}
            onAssessmentChange={handleAssessmentChange}
            selectRef={selectRef}
          />
        );
      case 2:
        return (
          <Step3Contract
            isSubmitting={isSubmitting}
            isExisting={isExisting}
            onCompleteSetup={handleCompleteSetup}
            onSaveOnly={handleSaveOnly}
          />
        );
      default:
        return null;
    }
  };

  // ---- Render ----
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col justify-center px-4 py-12">
      {/* Step indicator */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{pageDescription}</p>
      </div>

      <StepIndicator currentStep={step} totalSteps={STEPS.length} />

      {/* Step content */}
      <div className="animate-in fade-in slide-in-from-right-2 duration-300">
        {renderStepContent()}
      </div>

      {/* Navigation buttons (step 1 only) */}
      {step === 1 && (
        <div className="mt-6 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div /> {/* Spacer to keep Next right-aligned */}
          
          <Button
            size="lg"
            onClick={goNext}
            disabled={!step1Valid || isSubmitting}
          >
            Next
            <ChevronRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 2 back button (rendered above the card if we were to put it here, but actually it's fine below) */}
      {step === 2 && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={goBack}
            disabled={isSubmitting}
          >
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
        </div>
      )}

      {/* Step 1 validation hint */}
      {step === 1 && !step1Valid && exam && targetDate && !allAssessed && (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Rate all subjects above to continue.
        </p>
      )}
    </main>
  );
}
