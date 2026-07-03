// Path: app/predictor/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, Lock, ArrowRight, AlertCircle, Info, Loader2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const SUBJECTS = ["Physics", "Chemistry", "Mathematics"];

interface SubjectPrediction {
  subject: string;
  predictedPercentile: number;
  bandLower: number;
  bandUpper: number;
  bandWidth: number;
  sessionsUsed: number;
  calibrationSource: string;
  disclaimer: string;
}

interface PredictionResult {
  overallPercentile: number;
  overallBandLower: number;
  overallBandUpper: number;
  overallBandWidth: number;
  subjects: SubjectPrediction[];
  totalTrackedSessions: number;
  calibrationSource: string;
  disclaimer: string;
  frozenAt: string | null;
  isFrozen: boolean;
  prediction_id?: string;
}

export default function PredictorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  // Step 1: Phone entry
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "result">("phone");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [verifiedSessionId, setVerifiedSessionId] = useState<string | null>(null);

  // If coming from verified session, skip to result
  useEffect(() => {
    if (sessionId && step === "phone") {
      setStep("result");
      fetchPrediction(sessionId);
    }
  }, [sessionId]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("91")) {
      return "+" + digits.slice(0, 12).replace(/(\d{2})(\d{5})(\d{5})/, "+$1 $2 $3");
    }
    if (digits.length > 10) return value; // Already formatted
    return "+91 " + digits.slice(0, 5) + " " + digits.slice(5, 10);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/predictor/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.replace(/\s/g, ""),
          exam_name: "JEE Main",
          target_date: "2027-01-31", // Default, user can change later
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setVerifiedSessionId(data.session_id);
      setStep("otp");
      toast.success("OTP sent to your phone");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedSessionId) return;
    setLoading(true);

    try {
      const res = await fetch("/api/predictor/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.replace(/\s/g, ""),
          otp,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      setVerifiedSessionId(data.session_id);
      setStep("result");
      await fetchPrediction(data.session_id);
      toast.success("Verified! Loading your prediction...");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async (sessionId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/predictor/result?session_id=${sessionId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load prediction");
      setPrediction(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load prediction");
    } finally {
      setLoading(false);
    }
  };

  const getBandColor = (width: number) => {
    if (width <= 4) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (width <= 8) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  const getCalibrationBadge = (source: string) => {
    switch (source) {
      case "proprietary":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "blended":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  if (step === "phone") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">JEE Rank Predictor</h1>
            <p className="text-slate-400">Get your confidence interval, not a fake precise number</p>
          </div>

          <Card className="border-white/10 bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Enter your phone number</CardTitle>
              <CardDescription className="text-slate-400">
                We'll send a 6-digit OTP. No spam, just your prediction.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="pl-10 text-lg"
                    maxLength={16}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full py-3 text-lg" disabled={loading || phone.replace(/\D/g, "").length < 12}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 mr-2" />}
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </form>

              <div className="mt-6 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Honest prediction, not fake precision</p>
                    <p className="mt-1 opacity-80">You'll see a confidence interval (e.g., 87–91 percentile) based on public NTA data, sharpening with each practice session.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 mx-auto text-indigo-400 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Enter OTP</h1>
            <p className="text-slate-400">Sent to <strong className="text-white">{phone}</strong></p>
          </div>

          <Card className="border-white/10 bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="space-y-4">
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-3xl tracking-widest"
                  maxLength={6}
                  required
                  disabled={loading}
                  autoFocus
                />
                <Button type="submit" className="w-full py-3 text-lg" disabled={loading || otp.length !== 6}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 mr-2" />}
                  {loading ? "Verifying..." : "Verify & Show Prediction"}
                </Button>
              </form>

              <Button variant="ghost" className="w-full text-sm text-slate-400 hover:text-slate-300" onClick={() => setStep("phone")}>
                Change phone number
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Result view
  if (!prediction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <Target className="w-4 h-4" />
            <span>JEE Main Rank Predictor</span>
            {prediction.isFrozen && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs border border-amber-500/30">
                FROZEN (7 days pre-exam)
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold">Your Projected Percentile Band</h1>
          <p className="text-slate-400 mt-1">{prediction.disclaimer}</p>
        </div>

        {/* Overall Band - Hero Metric */}
        <Card className="border-white/10 bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-indigo-500/10 to-transparent" />
          <CardContent className="relative p-8">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Overall Projected Percentile</p>
              <div className="flex items-baseline justify-center gap-1 mb-4">
                <span className="text-6xl font-bold tracking-tight text-white">
                  {prediction.overallBandLower}–{prediction.overallBandUpper}
                </span>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getBandColor(prediction.overallBandWidth)}`}>
                <span className="text-sm font-medium">±{Math.round(prediction.overallBandWidth / 2)} percentile points</span>
                <span className="text-xs opacity-70">(width: {prediction.overallBandWidth})</span>
              </div>

              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-400">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{prediction.totalTrackedSessions}</p>
                  <p>Tracked Sessions</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{prediction.calibrationSource}</p>
                  <p>Calibration</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calibration Source Badge */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCalibrationBadge(prediction.calibrationSource)}`}>
            {prediction.calibrationSource === "public_nta" && "Public NTA Prior"}
            {prediction.calibrationSource === "blended" && "Blended: NTA + Personal"}
            {prediction.calibrationSource === "proprietary" && "Fully Personal Model"}
          </span>
        </div>

        {/* Subject-wise Breakdown */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {prediction.subjects.map((subj) => (
            <Card key={subj.subject} className="border-white/10 bg-slate-900/80">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">{subj.subject}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getCalibrationBadge(subj.calibrationSource)}`}>
                    {subj.calibrationSource}
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {subj.bandLower}–{subj.bandUpper}
                </div>
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${getBandColor(subj.bandWidth)} text-sm`}>
                  Width: {subj.bandWidth} pts
                </div>
                <p className="text-xs text-slate-500 mt-3">{subj.disclaimer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA to Start Practicing */}
        <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Turn this projection into a plan</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Start a 15-min daily drill tailored to push your band toward 94–96.
                </p>
              </div>
              <Button
                size="lg"
                className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500"
                onClick={() => router.push("/setup")}
              >
                Start Free Practice
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Disclaimer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Based on public NTA normalization tables (2025–2026 cycles). Your band sharpens with every tracked session.</p>
          <p className="mt-1">Data privacy: Phone used only for OTP. Delete your data anytime.</p>
        </div>
      </div>
    </div>
  );
}