"use client";

/**
 * useLoginForm
 * ─────────────────────────────────────────────────────────────────
 * Wired to: POST /api/users/auth/login/
 *
 * Backend expects:
 *   login     — email OR phone number (e.g. 08012345678 or user@example.com)
 *   password
 *
 * On success (200):
 *   { data: { access, refresh, user: { role, ... } } }
 *   → tokens saved via lib/api.ts saveTokens()
 *   → role-based redirect to the correct dashboard
 *
 * On 403 (unverified account):
 *   Backend auto-resends OTP.
 *   → route to /verify
 *
 * On 400: invalid credentials.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveTokens } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────

interface BackendUser {
  id:           string;
  email:        string | null;
  phone_number: string | null;
  first_name:   string;
  last_name:    string;
  role:         string; // "CUSTOMER" | "AGENT" | "LOGISTICS" | "PROJECT_MANAGER" | "FINANCE"
  is_verified:  boolean;
  created_at:   string;
}

// Map backend role → frontend dashboard path
const DASHBOARD_PATH: Record<string, string> = {
  CUSTOMER:        "/dashboard",
  AGENT:           "/supplier/dashboard",
  LOGISTICS:       "/driver/dashboard",
  PROJECT_MANAGER: "/pm/dashboard",
  FINANCE:         "/financial/dashboard",
  QUARRY_OWNER:    "/supplier/dashboard",
};

// Map backend role → frontend role slug (used in session)
const ROLE_SLUG: Record<string, string> = {
  CUSTOMER:        "customer",
  AGENT:           "supplier",
  LOGISTICS:       "driver",
  PROJECT_MANAGER: "pm",
  FINANCE:         "financial",
  QUARRY_OWNER:    "supplier",
};

// ── Constants ──────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://quarrylink-backend.onrender.com/api";

// ── Hook ───────────────────────────────────────────────────────────

export function useLoginForm() {
  const router = useRouter();

  // "login" accepts both email and phone — matches what the backend expects
  const [login,        setLogin]        = useState("");
  const [password,     setPassword]     = useState("");
  const [remember,     setRemember]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  function clearError()        { setError(null); }
  function toggleRemember()    { setRemember(r => !r); }
  function toggleShowPassword(){ setShowPassword(s => !s); }

  // ── Submit ───────────────────────────────────────────────────────

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    if (!login.trim()) {
      setError("Please enter your email or phone number.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/users/auth/login/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          login:    login.trim(),
          password: password,
        }),
      });

      const data = await res.json();

      // ── Unverified account (403) ────────────────────────────────
      // Backend already auto-resent the OTP
      if (res.status === 403) {
        sessionStorage.setItem("ql_pending_login", login.trim());
        router.push("/verify");
        return;
      }

      // ── Success (200) ───────────────────────────────────────────
      if (res.status === 200 && data?.data?.access) {
        const { access, refresh, user } = data.data as {
          access:  string;
          refresh: string;
          user:    BackendUser;
        };

        // Persist tokens — lib/api.ts handles silent refresh on 401
        saveTokens(access, refresh);

        // Lightweight session so dashboards can read user data immediately
        // without an extra /me/ round-trip on every page load.
        sessionStorage.setItem("ql_user", JSON.stringify({
          id:          user.id,
          email:       user.email,
          phone:       user.phone_number,
          firstName:   user.first_name,
          lastName:    user.last_name,
          role:        ROLE_SLUG[user.role] ?? user.role.toLowerCase(),
          backendRole: user.role,
          avatar:      `${user.first_name[0]}${user.last_name[0]}`.toUpperCase(),
        }));

        // Route to the correct dashboard
        const path = DASHBOARD_PATH[user.role] ?? "/dashboard";
        router.push(path);
        return;
      }

      // ── Failure (400 / other) ────────────────────────────────────
      if (data?.errors) {
        const firstError = Object.values(data.errors as Record<string, string[]>)
          .flat()[0];
        setError(firstError ?? "Login failed.");
      } else {
        setError(data?.message ?? "Invalid email/phone or password.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return {
    // Field state
    login,
    setLogin,
    password,
    setPassword,
    remember,
    showPassword,
    // UI state
    loading,
    error,
    // Actions
    clearError,
    toggleRemember,
    toggleShowPassword,
    handleSubmit,
    // Legacy alias so LoginFormPanel doesn't need to change its destructure
    // Remove once LoginFormPanel is updated to use `login` / `setLogin`
    email:    login,
    setEmail: setLogin,
    isLoading: loading,
  };
}