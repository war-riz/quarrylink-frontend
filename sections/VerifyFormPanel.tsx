"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Mail, Phone } from "lucide-react";
import { VERIFY_COPY, VerifyChannel } from "@/constants/verifyConstants";
import { siteConfig } from "@/constants/navigation";
import { useVerifyForm } from "@/hooks/useVerifyForm";
import { VerifyCodeInputs } from "@/sections/VerifyCodeInputs";
import { VerifySuccessState } from "@/sections/VerifySuccessState";
import { LoginErrorBanner } from "@/components/ui/LoginErrorBanner";
import { cn } from "@/lib/utils";

interface VerifyFormPanelProps {
  email: string;
  phone: string;
  channel: VerifyChannel;
  onChannelChange: (c: VerifyChannel) => void;
}

/* ── Channel toggle pill ── */
function ChannelToggle({
  channel,
  email,
  phone,
  onSwitch,
}: {
  channel: VerifyChannel;
  email: string;
  phone: string;
  onSwitch: (c: VerifyChannel) => void;
}) {
  const tabs: {
    id: VerifyChannel;
    icon: typeof Mail;
    label: string;
    disabled: boolean;
  }[] = [
    { id: "email", icon: Mail,  label: "Email", disabled: !email },
    { id: "phone", icon: Phone, label: "SMS",   disabled: !phone },
  ];

  return (
    <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl mb-6">
      {tabs.map(({ id, icon: Icon, label, disabled }) => (
        <button
          key={id}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onSwitch(id)}
          title={disabled ? `No ${id} provided` : undefined}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-[13px] font-bold transition-all duration-200",
            channel === id
              ? "bg-white text-[#121212] shadow-sm"
              : disabled
              ? "text-zinc-300 cursor-not-allowed"
              : "text-zinc-500 hover:text-zinc-700 cursor-pointer"
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}

/* ── Contact display badge ── */
function ContactBadge({
  channel,
  email,
  phone,
}: {
  channel: VerifyChannel;
  email: string;
  phone: string;
}) {
  const contact = channel === "email" ? email : phone;
  if (!contact) return null;

  return (
    <div className="inline-flex items-center gap-2 bg-[#ffc107]/10 border border-[#ffc107]/30 px-3 py-1.5 rounded-full mt-2">
      {channel === "email" ? (
        <Mail className="w-3.5 h-3.5 text-[#ffc107] shrink-0" />
      ) : (
        <Phone className="w-3.5 h-3.5 text-[#ffc107] shrink-0" />
      )}
      <span className="text-[13px] font-bold text-[#121212] max-w-[220px] truncate">
        {contact}
      </span>
    </div>
  );
}

export function VerifyFormPanel({
  email,
  phone,
  channel,
  onChannelChange,
}: VerifyFormPanelProps) {
  const {
    code,
    isLoading,
    isSuccess,
    error,
    resendCooldown,
    isResending,
    inputsRef,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleSubmit,
    handleResend,
    switchChannel,
  } = useVerifyForm(email, phone);

  // Keep parent in sync when channel changes
  const handleSwitch = (c: VerifyChannel) => {
    switchChannel(c);
    onChannelChange(c);
  };

  const copy = VERIFY_COPY[channel];

  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen overflow-y-auto">

      {/* Mobile logo */}
      <div className="lg:hidden px-7 pt-8 pb-2">
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
              {/* Animated icon */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={channel}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-16 h-16 bg-[#ffc107]/15 border-2 border-[#ffc107]/30 rounded-2xl flex items-center justify-center mb-6 text-[28px]"
                >
                  {copy.icon}
                </motion.div>
              </AnimatePresence>

              {/* Animated heading */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`heading-${channel}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="mb-6"
                >
                  <h2 className="font-extrabold text-[30px] text-[#121212] leading-tight mb-2">
                    {copy.heading}{" "}
                    <span className="text-[#ffc107]">{copy.headingHighlight}</span>
                  </h2>
                  <p className="text-[14px] font-normal text-zinc-500 leading-relaxed">
                    {channel === "email"
                      ? email
                        ? copy.subtext(email)
                        : copy.subtextFallback
                      : phone
                      ? copy.subtext(phone)
                      : copy.subtextFallback}
                  </p>
                  <ContactBadge channel={channel} email={email} phone={phone} />
                </motion.div>
              </AnimatePresence>

              {/* Channel toggle — only when both are available */}
              {email && phone && (
                <ChannelToggle
                  channel={channel}
                  email={email}
                  phone={phone}
                  onSwitch={handleSwitch}
                />
              )}

              {/* Error */}
              {error && <LoginErrorBanner message={error} />}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`inputs-${channel}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <VerifyCodeInputs
                      code={code}
                      inputsRef={inputsRef}
                      hasError={!!error}
                      isSuccess={isSuccess}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      onPaste={handlePaste}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    code.join("").length < VERIFY_COPY.codeLength
                  }
                  className={cn(
                    "w-full h-12 rounded-xl font-bold text-[15px]",
                    "flex items-center justify-center gap-2.5",
                    "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212]",
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

              {/* Tip */}
              <p className="mt-4 text-center text-[12px] text-zinc-400 leading-relaxed">
                {copy.tip}
              </p>

              {/* Resend */}
              <div className="mt-3 flex items-center justify-center gap-1.5">
                <span className="text-[13px] text-zinc-400">{copy.resendPrompt}</span>
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

              {/* Back */}
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