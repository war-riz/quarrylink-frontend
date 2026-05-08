"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { VERIFY_COPY, VerifyChannel } from "@/constants/verifyConstants";

export function useVerifyForm(email: string, phone: string) {
  const router = useRouter();

  // Channel — default to email if available, else phone
  const [channel, setChannel] = useState<VerifyChannel>(
    email ? "email" : "phone"
  );

  const [code, setCode] = useState<string[]>(
    Array(VERIFY_COPY.codeLength).fill("")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Start cooldown on mount
  useEffect(() => {
    setResendCooldown(VERIFY_COPY.resendCooldown);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Reset code + restart cooldown when channel switches
  const switchChannel = (to: VerifyChannel) => {
    setChannel(to);
    setCode(Array(VERIFY_COPY.codeLength).fill(""));
    setError(null);
    setResendCooldown(VERIFY_COPY.resendCooldown);
    focusInput(0);
  };

  const focusInput = (index: number) => {
    // Small delay so DOM has updated after channel switch
    setTimeout(() => inputsRef.current[index]?.focus(), 50);
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);
    if (digit && index < VERIFY_COPY.codeLength - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < VERIFY_COPY.codeLength - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, VERIFY_COPY.codeLength);
    if (!pasted) return;
    const newCode = Array(VERIFY_COPY.codeLength).fill("");
    pasted.split("").forEach((char, i) => {
      newCode[i] = char;
    });
    setCode(newCode);
    focusInput(Math.min(pasted.length, VERIFY_COPY.codeLength - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < VERIFY_COPY.codeLength) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      // 🔌 Replace with your real verify call:
      // await verifyCode({ channel, contact: channel === "email" ? email : phone, code: fullCode });
      await new Promise((res) => setTimeout(res, 1500));
      setIsSuccess(true);
      // ✅ After verification → go to KYC
      setTimeout(() => router.push("/kyc"), 2000);
    } catch {
      setError("Invalid or expired code. Please try again.");
      setCode(Array(VERIFY_COPY.codeLength).fill(""));
      focusInput(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError(null);
    try {
      // 🔌 Replace with your real resend call:
      // await resendCode({ channel, contact: channel === "email" ? email : phone });
      await new Promise((res) => setTimeout(res, 1000));
      setResendCooldown(VERIFY_COPY.resendCooldown);
      setCode(Array(VERIFY_COPY.codeLength).fill(""));
      focusInput(0);
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  }, [resendCooldown, isResending]);

  return {
    channel,
    switchChannel,
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
  };
}