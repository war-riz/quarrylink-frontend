"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { REGISTER_COPY } from "@/constants/registerConstants";
import { siteConfig } from "@/constants/navigation";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import { RegisterSocialButtons } from "@/sections/RegisterSocialButtons";
import { Step1Fields, Step2Fields } from "@/sections/RegisterFormFields";
import { LoginErrorBanner } from "@/components/ui/LoginErrorBanner";

/* ── Step progress indicator ── */
function StepIndicator({ step }: { step: 1 | 2 }) {
  const steps = [
    { n: 1, label: "Personal Info" },
    { n: 2, label: "Next of Kin" },
  ];

  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map(({ n, label }, i) => {
        const isComplete = step > n;
        const isActive   = step === n;

        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold border-2 transition-all duration-300",
                isComplete ? "bg-[#ffc107] border-[#ffc107] text-[#121212]"
                  : isActive ? "bg-[#121212] border-[#121212] text-white"
                  : "bg-white border-zinc-200 text-zinc-400"
              )}>
                {isComplete ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : n}
              </div>
              <span className={cn(
                "text-[11px] font-semibold whitespace-nowrap transition-colors duration-300",
                isActive ? "text-[#121212]" : isComplete ? "text-[#ffc107]" : "text-zinc-400"
              )}>
                {label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-2 mb-5 rounded-full overflow-hidden bg-zinc-200">
                <div
                  className="h-full bg-[#ffc107] transition-all duration-500"
                  style={{ width: step > n ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main panel ── */
export function RegisterFormPanel() {
  const {
    step,

    // Step 1
    firstName, setFirstName,
    lastName,  setLastName,
    email,     setEmail,
    phone,     setPhone,
    password,        setPassword,
    confirmPassword, setConfirmPassword,
    accountType,     setAccountType,
    showPassword,        toggleShowPassword,
    showConfirmPassword, toggleShowConfirmPassword,

    // Step 2
    nokName,          setNokName,
    nokRelationship,  setNokRelationship,
    nokPhone,         setNokPhone,
    nokEmail,         setNokEmail,
    nokAddress,       setNokAddress,

    // Consent
    consent,
    toggleConsent,

    // UI
    loading,
    error,

    // Navigation
    handleNext,
    handleBack,
    handleSubmit,
  } = useRegisterForm();

  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen overflow-y-auto">

      {/* Mobile logo */}
      <div className="lg:hidden px-7 pt-8 pb-2">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="relative flex items-center justify-center w-[52px] h-8 rounded-[6px] bg-[#ffc107] overflow-hidden">
            <Image src="/images/logo.png" alt={siteConfig.name} fill sizes="52px"
              className="object-contain p-1" />
          </div>
          <span className="font-bold text-[18px] text-[#121212]">{siteConfig.name}</span>
        </Link>
      </div>

      {/* Centered form */}
      <div className="flex-1 flex items-center justify-center px-7 py-10 lg:py-8">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full max-w-[440px]"
        >
          {/* Heading */}
          <div className="mb-5">
            <h2 className="font-extrabold text-[30px] text-[#121212] leading-tight mb-1.5">
              {REGISTER_COPY.formHeading}
            </h2>
            <p className="text-[14px] font-normal text-zinc-500">
              {REGISTER_COPY.formSub}{" "}
              <Link
                href={REGISTER_COPY.formSubLinkHref}
                className="text-[#121212] font-bold underline underline-offset-2 hover:text-[#ffc107] transition-colors"
              >
                {REGISTER_COPY.formSubLink}
              </Link>
            </p>
          </div>

          {/* Step indicator */}
          <StepIndicator step={step} />

          {/* Error banner */}
          {error && <LoginErrorBanner message={error} />}

          <AnimatePresence mode="wait">

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>

                <RegisterSocialButtons />

                <form onSubmit={handleNext} className="flex flex-col gap-5 mt-1">
                  <Step1Fields
                    firstName={firstName}             lastName={lastName}
                    email={email}                     phone={phone}
                    password={password}               confirmPassword={confirmPassword}
                    accountType={accountType}
                    showPassword={showPassword}       showConfirmPassword={showConfirmPassword}
                    onFirstNameChange={setFirstName}  onLastNameChange={setLastName}
                    onEmailChange={setEmail}          onPhoneChange={setPhone}
                    onPasswordChange={setPassword}    onConfirmPasswordChange={setConfirmPassword}
                    onAccountTypeChange={setAccountType}
                    onToggleShowPassword={toggleShowPassword}
                    onToggleShowConfirmPassword={toggleShowConfirmPassword}
                  />

                  <button
                    type="submit"
                    className={cn(
                      "w-full h-12 rounded-xl font-bold text-[15px]",
                      "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212]",
                      "flex items-center justify-center gap-2.5",
                      "shadow-[0_4px_14px_rgba(255,193,7,0.35)] hover:shadow-[0_6px_20px_rgba(255,193,7,0.45)]",
                      "transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                    )}
                  >
                    Next <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <motion.div key="step2"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <Step2Fields
                    nokName={nokName}                 nokRelationship={nokRelationship}
                    nokPhone={nokPhone}               nokEmail={nokEmail}
                    nokAddress={nokAddress}
                    consent={consent}
                    onNokNameChange={setNokName}
                    onNokRelationshipChange={setNokRelationship}
                    onNokPhoneChange={setNokPhone}
                    onNokEmailChange={setNokEmail}
                    onNokAddressChange={setNokAddress}
                    onToggleConsent={toggleConsent}
                  />

                  {/* Back + Create Account */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className={cn(
                        "h-12 px-5 rounded-xl font-bold text-[14px]",
                        "border-2 border-zinc-200 bg-white text-zinc-600",
                        "flex items-center justify-center gap-2",
                        "hover:border-zinc-300 hover:bg-zinc-50",
                        "transition-all duration-200 active:scale-[0.99]"
                      )}
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <button
                      type="submit"
                      disabled={loading || !consent}
                      className={cn(
                        "flex-1 h-12 rounded-xl font-bold text-[15px]",
                        "flex items-center justify-center gap-2.5",
                        "transition-all duration-200",
                        !consent
                          ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
                          : "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] shadow-[0_4px_14px_rgba(255,193,7,0.35)] hover:shadow-[0_6px_20px_rgba(255,193,7,0.45)] hover:scale-[1.01] active:scale-[0.99]",
                        loading && "opacity-70 cursor-not-allowed scale-100 shadow-none"
                      )}
                    >
                      {loading ? (
                        <><Loader2 className="w-4.5 h-4.5 animate-spin" />{REGISTER_COPY.submittingLabel}</>
                      ) : (
                        <>{REGISTER_COPY.submitLabel} <ArrowRight className="w-4.5 h-4.5" /></>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Terms */}
          <p className="mt-5 text-center text-[12px] text-zinc-400 leading-relaxed">
            {REGISTER_COPY.termsText}{" "}
            <Link href={REGISTER_COPY.termsHref}
              className="text-zinc-500 font-semibold hover:text-[#ffc107] transition-colors">
              {REGISTER_COPY.termsLink}
            </Link>{" "}
            and{" "}
            <Link href={REGISTER_COPY.privacyHref}
              className="text-zinc-500 font-semibold hover:text-[#ffc107] transition-colors">
              {REGISTER_COPY.privacyLink}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}