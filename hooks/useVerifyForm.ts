"use client";

/**
 * useVerifyForm
 * ─────────────────────────────────────────────────────────────────
 * Wired to:
 *   POST /api/users/auth/verify-email/      — verify the OTP code
 *   POST /api/users/auth/send-verification/ — resend a fresh code
 *
 * Backend request shape (verify):
 *   { login: string, otp: string }
 *
 * Backend request shape (resend):
 *   { login: string }
 *
 * On verify success (200) → redirect to /kyc
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { VERIFY_COPY, VerifyChannel } from "@/constants/verifyConstants";
import { saveTokens } from "@/lib/api";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://quarrylink-backend.onrender.com/api";

export function useVerifyForm(email: string, phone: string) {
  const router = useRouter();

  // Resolve the contact — prefer props, fall back to sessionStorage
  const resolvedEmail = email || (typeof window !== "undefined"
    ? sessionStorage.getItem("ql_pending_login") ?? ""
    : "");
  const resolvedPhone = phone;

  const [channel, setChannel] = useState<VerifyChannel>(
    resolvedEmail ? "email" : "phone"
  );

  const [code,           setCode]           = useState<string[]>(
    Array(VERIFY_COPY.codeLength).fill("")
  );
  const [isLoading,      setIsLoading]      = useState(false);
  const [isSuccess,      setIsSuccess]      = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending,    setIsResending]    = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setResendCooldown(VERIFY_COPY.resendCooldown);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function activeContact() {
    return channel === "email" ? resolvedEmail : resolvedPhone;
  }

  const focusInput = (index: number) => {
    setTimeout(() => inputsRef.current[index]?.focus(), 50);
  };

  const switchChannel = (to: VerifyChannel) => {
    setChannel(to);
    setCode(Array(VERIFY_COPY.codeLength).fill(""));
    setError(null);
    setResendCooldown(VERIFY_COPY.resendCooldown);
    focusInput(0);
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);
    if (digit && index < VERIFY_COPY.codeLength - 1) focusInput(index + 1);
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
    pasted.split("").forEach((char, i) => { newCode[i] = char; });
    setCode(newCode);
    focusInput(Math.min(pasted.length, VERIFY_COPY.codeLength - 1));
  };

  // ── Submit — POST /api/users/auth/verify-email/ ───────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullCode = code.join("");
    if (fullCode.length < VERIFY_COPY.codeLength) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    const contact = activeContact();
    if (!contact) {
      setError("Could not determine the account to verify. Please go back and try again.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/users/auth/verify-email/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ login: contact, otp: fullCode }),
      });

      const data = await res.json();

      if (res.ok) {
        // Persist tokens if backend returns them on verify
        if (data?.data?.access && data?.data?.refresh) {
          saveTokens(data.data.access, data.data.refresh);
        }
        sessionStorage.removeItem("ql_pending_login");
        setIsSuccess(true);
        setTimeout(() => router.push("/kyc"), 1800);
        return;
      }

      if (data?.errors) {
        const first = Object.values(data.errors as Record<string, string[]>).flat()[0];
        setError(first ?? "Invalid or expired code. Please try again.");
      } else {
        setError(data?.message ?? "Invalid or expired code. Please try again.");
      }
      setCode(Array(VERIFY_COPY.codeLength).fill(""));
      focusInput(0);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setCode(Array(VERIFY_COPY.codeLength).fill(""));
      focusInput(0);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend — POST /api/users/auth/send-verification/ ─────────────

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || isResending) return;

    const contact = activeContact();
    if (!contact) return;

    setIsResending(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/users/auth/send-verification/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ login: contact }),
      });

      const data = await res.json();

      if (res.ok) {
        setResendCooldown(VERIFY_COPY.resendCooldown);
        setCode(Array(VERIFY_COPY.codeLength).fill(""));
        focusInput(0);
      } else {
        setError(data?.message ?? "Failed to resend code. Please try again.");
      }
    } catch {
      setError("Network error. Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resendCooldown, isResending, channel, resolvedEmail, resolvedPhone]);

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