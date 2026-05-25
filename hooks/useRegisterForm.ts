"use client";

/**
 * useRegisterForm
 * ─────────────────────────────────────────────────────────────────
 * Wired to: POST /api/users/auth/register/
 *
 * Backend expects:
 *   email, phone_number, password, password_confirm,
 *   first_name, last_name, role
 *
 * Role mapping (frontend label → backend value):
 *   customer  → CUSTOMER
 *   supplier  → AGENT
 *   driver    → LOGISTICS
 *   financial → FINANCE
 *   pm        → PROJECT_MANAGER
 *
 * On success (201): user created, OTP sent to email + SMS.
 * Next step:        route to /verify screen.
 *
 * On failure (400): serializer errors returned in `errors` key.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────

import { AccountType } from "@/constants/registerConstants";

// Map frontend role slugs → backend enum values
const ROLE_MAP: Record<AccountType, string> = {
  contractor: "CUSTOMER",
  supplier:   "AGENT",
  logistics:  "LOGISTICS",
  financial:  "FINANCE",
};

// ── Constants ──────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://quarrylink-backend.onrender.com/api";

// ── Hook ───────────────────────────────────────────────────────────

export function useRegisterForm() {
  const router = useRouter();

  // ── Step ─────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2>(1);

  // ── Step 1 fields ─────────────────────────────────────────────────
  const [firstName,       setFirstName]       = useState("");
  const [lastName,        setLastName]        = useState("");
  const [email,           setEmail]           = useState("");
  const [phone,           setPhone]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType,     setAccountType]     = useState<AccountType | "">("");

  // Password visibility
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function toggleShowPassword()        { setShowPassword(s => !s); }
  function toggleShowConfirmPassword() { setShowConfirmPassword(s => !s); }

  // ── Step 2 fields (next of kin) ───────────────────────────────────
  const [nokName,         setNokName]         = useState("");
  const [nokRelationship, setNokRelationship] = useState("");
  const [nokPhone,        setNokPhone]        = useState("");
  const [nokEmail,        setNokEmail]        = useState("");
  const [nokAddress,      setNokAddress]      = useState("");

  // ── Consent ───────────────────────────────────────────────────────
  const [consent, setConsent] = useState(false);
  function toggleConsent() { setConsent(c => !c); }

  // ── UI state ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // ── Phone normalisation ───────────────────────────────────────────
  // Accepts: 08012345678 / 2348012345678 / +2348012345678
  function normalisePhone(raw: string): string {
    const digits = raw.replace(/[\s\-\(\)]/g, "");
    const normalised = digits.startsWith("+234")
      ? digits
      : digits.startsWith("234")
      ? `+${digits}`
      : digits.startsWith("0")
      ? `+234${digits.slice(1)}`
      : digits;

    if (!/^\+234\d{10}$/.test(normalised)) {
      throw new Error("Enter a valid Nigerian phone number (e.g. 08012345678).");
    }
    return normalised;
  }

  // ── Step 1 validation + advance ───────────────────────────────────
  function handleNext(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (!accountType) {
      setError("Please select an account type.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Validate phone early so the user can fix it on step 1
    try {
      normalisePhone(phone);
    } catch (err: any) {
      setError(err.message);
      return;
    }

    setStep(2);
  }

  function handleBack() {
    setError(null);
    setStep(1);
  }

  // ── Final submit (step 2) ─────────────────────────────────────────
  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    if (!nokName.trim()) {
      setError("Please enter your next of kin's name.");
      return;
    }
    if (!nokRelationship) {
      setError("Please select the relationship.");
      return;
    }
    if (!nokPhone.trim()) {
      setError("Please enter your next of kin's phone number.");
      return;
    }
    if (!nokAddress.trim()) {
      setError("Please enter your next of kin's address.");
      return;
    }
    if (!consent) {
      setError("Please accept the Terms of Service to continue.");
      return;
    }

    let normalisedPhone: string;
    try {
      normalisedPhone = normalisePhone(phone);
    } catch (err: any) {
      setError(err.message);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/users/auth/register/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name:       firstName.trim(),
          last_name:        lastName.trim(),
          email:            email.trim().toLowerCase(),
          phone_number:     normalisedPhone,
          password:         password,
          password_confirm: confirmPassword,
          role:             ROLE_MAP[accountType as AccountType],
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        // ✅ Registration successful — backend sent OTP to email + SMS
        sessionStorage.setItem("ql_pending_login", email.trim().toLowerCase());
        sessionStorage.setItem("ql_pending_role",  accountType);

        router.push("/verify");
        return;
      }

      // ── Backend validation errors (400) ────────────────────────
      if (data?.errors) {
        const firstError = Object.values(data.errors as Record<string, string[]>)
          .flat()[0];
        setError(firstError ?? "Registration failed. Please check your details.");
      } else {
        setError(data?.message ?? "Registration failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return {
    // Step
    step,

    // Step 1
    firstName,        setFirstName,
    lastName,         setLastName,
    email,            setEmail,
    phone,            setPhone,
    password,         setPassword,
    confirmPassword,  setConfirmPassword,
    accountType,      setAccountType,
    showPassword,     toggleShowPassword,
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
    isLoading: loading, // alias

    // Navigation
    handleNext,
    handleBack,
    handleSubmit,
  };
}