"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { KYC_COPY, KYC_STEPS } from "@/constants/kycConstants";
import { siteConfig } from "@/constants/navigation";
import { KycFormState, KycFormActions } from "@/hooks/useKycForm";
import { LoginErrorBanner } from "@/components/ui/LoginErrorBanner";
import {
  StepIdentity,
  StepDocument,
  StepFacial,
  StepLiveness,
  StepReview,
} from "@/sections/KycSteps";
import { KycSuccessState } from "@/sections/KycSuccessState";

type Props = KycFormState & KycFormActions;

// ── Mobile step strip ────────────────────────────────────────────
function MobileStepStrip({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="lg:hidden px-6 pb-4 pt-2">
      <div className="flex items-center gap-1">
        {KYC_STEPS.map((s, i) => {
          const isDone = i < stepIndex;
          const isActive = i === stepIndex;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-300",
                  isDone
                    ? "bg-[#ffc107] text-[#121212]"
                    : isActive
                    ? "bg-[#121212] text-white"
                    : "bg-zinc-100 text-zinc-400"
                )}
              >
                {isDone ? (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {i < KYC_STEPS.length - 1 && (
                <div className="flex-1 h-[2px] mx-1 rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className="h-full bg-[#ffc107] transition-all duration-500"
                    style={{ width: isDone ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] font-bold text-[#121212]">
          {KYC_STEPS[stepIndex]?.label}
        </span>
        <span className="text-[11px] text-zinc-400">
          Step {stepIndex + 1} of {KYC_STEPS.length}
        </span>
      </div>
    </div>
  );
}

// ── Step heading ─────────────────────────────────────────────────
function StepHeading({ stepKey }: { stepKey: keyof typeof KYC_COPY.steps }) {
  const copy = KYC_COPY.steps[stepKey];
  return (
    <div className="mb-6">
      <h2 className="font-extrabold text-[26px] text-[#121212] leading-tight mb-1.5">
        {copy.heading}
      </h2>
      <p className="text-[13.5px] font-normal text-zinc-500 leading-relaxed">
        {copy.sub}
      </p>
    </div>
  );
}

// ── Main exported component ──────────────────────────────────────
export function KycFormPanel(props: Props) {
  const {
    step,
    stepIndex,
    error,
    isLoading,
    livenessComplete,
    facialCapture,
    handleNext,
    handleBack,
    handleSubmit,
  } = props;

  const isSuccess = step === "success";

  // Steps that have a valid key in KYC_COPY.steps
  const validStepKey =
    step !== "success"
      ? (step as keyof typeof KYC_COPY.steps)
      : null;

  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen overflow-y-auto">

      {/* Mobile logo */}
      <div className="lg:hidden px-6 pt-8 pb-2">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="relative flex items-center justify-center w-[52px] h-8 rounded-[6px] bg-[#ffc107] overflow-hidden">
            <Image
              src="/images/logo.png"
              alt={siteConfig.name}
              fill
              sizes="52px"
              className="object-contain p-1"
            />
          </div>
          <span className="font-bold text-[18px] text-[#121212]">
            {siteConfig.name}
          </span>
        </Link>
      </div>

      {/* Mobile step strip — hidden on success */}
      {!isSuccess && <MobileStepStrip stepIndex={stepIndex} />}

      {/* Centered content */}
      <div className="flex-1 flex items-start lg:items-center justify-center px-6 py-6 lg:py-10">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full max-w-[460px]"
        >
          {isSuccess ? (
            // ── Success ──────────────────────────────────────────
            <KycSuccessState />
          ) : (
            <>
              {/* Step heading */}
              <AnimatePresence mode="wait">
                {validStepKey && (
                  <motion.div
                    key={`heading-${step}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <StepHeading stepKey={validStepKey} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error banner */}
              {error && <LoginErrorBanner message={error} />}

              {/* Step content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -28 }}
                  transition={{ duration: 0.25 }}
                >
                  {step === "identity" && <StepIdentity {...props} />}
                  {step === "document" && <StepDocument {...props} />}
                  {step === "facial"   && <StepFacial   {...props} />}
                  {step === "liveness" && <StepLiveness  {...props} />}
                  {step === "review"   && <StepReview    {...props} />}
                </motion.div>
              </AnimatePresence>

              {/* ── Navigation buttons ─────────────────────────── */}

              {/* Steps 1–4: Back + Continue */}
              {step !== "review" && (
                <div
                  className={cn(
                    "flex gap-3 mt-6",
                    step === "identity" && "justify-end"
                  )}
                >
                  {/* Back — hidden on first step */}
                  {step !== "identity" && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="h-12 px-5 rounded-xl font-bold text-[14px] border-2 border-zinc-200 bg-white text-zinc-600 flex items-center justify-center gap-2 hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-200 active:scale-[0.99]"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}

                  {/* Continue */}
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      (step === "facial" && !facialCapture) ||
                      (step === "liveness" && !livenessComplete)
                    }
                    className={cn(
                      "flex-1 h-12 rounded-xl font-bold text-[15px]",
                      "flex items-center justify-center gap-2.5",
                      "transition-all duration-200",
                      (step === "facial" && !facialCapture) ||
                      (step === "liveness" && !livenessComplete)
                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                        : "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] shadow-[0_4px_14px_rgba(255,193,7,0.35)] hover:shadow-[0_6px_20px_rgba(255,193,7,0.45)] hover:scale-[1.01] active:scale-[0.99]"
                    )}
                  >
                    Continue
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              )}

              {/* Step 5 (review): Submit is inside StepReview.
                  We only show a "go back" link below it. */}
              {step === "review" && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="w-full mt-3 h-11 rounded-xl border-2 border-zinc-200 bg-white text-zinc-600 font-bold text-[14px] flex items-center justify-center gap-2 hover:border-zinc-300 hover:bg-zinc-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go back and edit
                </button>
              )}

              {/* Progress note */}
              <p className="mt-6 text-center text-[12px] text-zinc-400">
                Step {stepIndex + 1} of {KYC_STEPS.length} —{" "}
                Your data is encrypted and never shared.
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}