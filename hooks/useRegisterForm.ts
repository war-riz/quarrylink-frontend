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
 * Next step:        route to /verify-otp screen.
 *
 * On failure (400): serializer errors returned in `errors` key.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────

export type FrontendRole = "customer" | "supplier" | "driver" | "financial" | "pm";

// Map frontend role slugs → backend enum values
const ROLE_MAP: Record<FrontendRole, string> = {
  customer:  "CUSTOMER",
  supplier:  "AGENT",
  driver:    "LOGISTICS",
  financial: "FINANCE",
  pm:        "PROJECT_MANAGER",
};

export interface RegisterFormState {
  firstName:       string;
  lastName:        string;
  email:           string;
  phone:           string;
  password:        string;
  passwordConfirm: string;
  role:            FrontendRole;
}

// ── Constants ──────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://quarrylink-backend.onrender.com/api";

// ── Hook ───────────────────────────────────────────────────────────

export function useRegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterFormState>({
    firstName:       "",
    lastName:        "",
    email:           "",
    phone:           "",
    password:        "",
    passwordConfirm: "",
    role:            "customer",
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // ── Field helpers ────────────────────────────────────────────────

  function setField<K extends keyof RegisterFormState>(
    key: K,
    value: RegisterFormState[K]
  ) {
    setForm(prev => ({ ...prev, [key]: value }));
    setError(null);
  }

  // ── Phone normalisation ──────────────────────────────────────────
  // Accepts: 08012345678 / 2348012345678 / +2348012345678
  // Returns: +234XXXXXXXXXX or throws a readable error string

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

  // ── Submit ───────────────────────────────────────────────────────

  async function submit() {
    setError(null);

    // ── Client-side validation ──────────────────────────────────
    const { firstName, lastName, email, phone, password, passwordConfirm, role } = form;

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
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    let normalisedPhone: string;
    try {
      normalisedPhone = normalisePhone(phone);
    } catch (e: any) {
      setError(e.message);
      return;
    }

    // ── API call ─────────────────────────────────────────────────
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
          password_confirm: passwordConfirm,
          role:             ROLE_MAP[role],
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        // ✅ Registration successful — backend sent OTP to email + SMS
        // Store the login identifier so the verify screen knows who to verify
        sessionStorage.setItem("ql_pending_login", email.trim().toLowerCase());
        sessionStorage.setItem("ql_pending_role",  role);

        router.push("/verify-otp");
        return;
      }

      // ── Handle backend validation errors (400) ─────────────────
      if (data?.errors) {
        // Backend returns errors as { field: ["message", ...] }
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

  return { form, setField, loading, error, submit };
}