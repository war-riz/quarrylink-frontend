"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { VERIFY_COPY } from "@/constants/verifyConstants";
import { siteConfig } from "@/constants/navigation";
import { useVerifyForm } from "@/hooks/useVerifyForm";
import { VerifyCodeInputs } from "@/sections/VerifyCodeInputs";
import { VerifySuccessState } from "@/sections/VerifySuccessState";
import { LoginErrorBanner } from "@/components/ui/LoginErrorBanner";
import { cn } from "@/lib/utils";

interface VerifyFormPanelProps {
  email: string;
}

export function VerifyFormPanel({ email }: VerifyFormPanelProps) {
  const {
    code, isLoading, isSuccess, error,
    resendCooldown, isResending,
    inputsRef,
    handleChange, handleKeyDown, handlePaste,
    handleSubmit, handleResend,
  } = useVerifyForm(email);

  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen overflow-y-auto">

      {/* Mobile logo */}
      <div className="lg:hidden px-7 pt-8 pb-2">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="relative flex items-center justify-center w-[52px] h-8 rounded-[6px] bg-[#ffc107] overflow-hidden">
            <Image src="/images/logo.png" alt={siteConfig.name} fill sizes="52px" className="object-contain p-1" />
          </div>
          <span className="font-bold text-[18px] text-[#121212]">{siteConfig.name}</span>
        </Link>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-7 py-12 lg:py-0">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full max-w-[420px]"
        >
          {isSuccess ? (
            <VerifySuccessState />
          ) : (
            <>
              {/* Email icon */}
              <div className="w-16 h-16 bg-[#ffc107]/15 border-2 border-[#ffc107]/30 rounded-2xl flex items-center justify-center mb-6">
                <Mail className="w-7 h-7 text-[#ffc107]" />
              </div>

              {/* Heading */}
              <div className="mb-8">
                <h2 className="font-extrabold text-[30px] text-[#121212] leading-tight mb-2">
                  {VERIFY_COPY.heading}{" "}
                  <span className="text-[#ffc107]">{VERIFY_COPY.headingHighlight}</span>
                </h2>
                <p className="text-[14px] font-normal text-zinc-500 leading-relaxed">
                  {email
                    ? VERIFY_COPY.subtext(email)
                    : VERIFY_COPY.subtextFallback}
                </p>
                {email && (
                  <p className="mt-2 text-[13px] font-bold text-[#121212] truncate">
                    {email}
                  </p>
                )}
              </div>

              {/* Error */}
              {error && <LoginErrorBanner message={error} />}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <VerifyCodeInputs
                  code={code}
                  inputsRef={inputsRef}
                  hasError={!!error}
                  isSuccess={isSuccess}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading || code.join("").length < VERIFY_COPY.codeLength}
                  className={cn(
                    "w-full h-12 rounded-xl font-bold text-[15px]",
                    "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212]",
                    "flex items-center justify-center gap-2.5",
                    "shadow-[0_4px_14px_rgba(255,193,7,0.35)]",
                    "transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      {VERIFY_COPY.submittingLabel}
                    </>
                  ) : (
                    VERIFY_COPY.submitLabel
                  )}
                </button>
              </form>

              {/* Resend */}
              <div className="mt-6 flex items-center justify-center gap-1.5">
                <span className="text-[13px] text-zinc-400">
                  {VERIFY_COPY.resendPrompt}
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isResending}
                  className="text-[13px] font-bold text-[#121212] hover:text-[#ffc107] transition-colors disabled:text-zinc-400 disabled:cursor-not-allowed"
                >
                  {isResending
                    ? VERIFY_COPY.resendingLabel
                    : resendCooldown > 0
                    ? `${VERIFY_COPY.resendLabel} (${resendCooldown}s)`
                    : VERIFY_COPY.resendLabel}
                </button>
              </div>

              {/* Back link */}
              <div className="mt-8 flex justify-center">
                <Link
                  href={VERIFY_COPY.backHref}
                  className="inline-flex items-center gap-2 text-[13px] text-zinc-400 hover:text-[#121212] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {VERIFY_COPY.backLabel}
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
