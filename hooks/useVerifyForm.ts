"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { VERIFY_COPY } from "@/constants/verifyConstants";

export function useVerifyForm(email: string) {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(VERIFY_COPY.codeLength).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Start cooldown timer on mount
  useEffect(() => {
    setResendCooldown(VERIFY_COPY.resendCooldown);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const focusInput = (index: number) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    // Allow only digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);

    // Auto-advance
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
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, VERIFY_COPY.codeLength);
    if (!pasted) return;
    const newCode = Array(VERIFY_COPY.codeLength).fill("");
    pasted.split("").forEach((char, i) => { newCode[i] = char; });
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
      // await verifyEmail({ email, code: fullCode });
      await new Promise((res) => setTimeout(res, 1500));
      setIsSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
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
      // await resendVerificationEmail({ email });
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
    code, isLoading, isSuccess, error,
    resendCooldown, isResending,
    inputsRef,
    handleChange, handleKeyDown, handlePaste,
    handleSubmit, handleResend,
  };
}
