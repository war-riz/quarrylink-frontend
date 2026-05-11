"use client";

/**
 * useLoginForm — updated to use dummy auth + role-based routing.
 * 🔌 Replace authenticateUser() with real API call (NextAuth, Supabase, etc.)
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  authenticateUser,
  saveSession,
  ROLE_CONFIG,
} from "@/constants/dummyUsers";

export interface LoginFormState {
  email: string;
  password: string;
  remember: boolean;
  showPassword: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginFormActions {
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  toggleRemember: () => void;
  toggleShowPassword: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useLoginForm(): LoginFormState & LoginFormActions {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRemember = () => setRemember((p) => !p);
  const toggleShowPassword = () => setShowPassword((p) => !p);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // Simulate network delay
      await new Promise((res) => setTimeout(res, 800));

      // 🔌 REPLACE WITH REAL AUTH:
      // const session = await signIn("credentials", {
      //   email, password, redirect: false
      // });
      // if (session?.error) throw new Error(session.error);
      // const user = await fetch("/api/auth/me").then(r => r.json());
      // router.push(ROLE_CONFIG[user.role].dashboardPath);

      // STUB: dummy auth
      const user = authenticateUser(email, password);
      if (!user) {
        setError("Invalid email or password. Please try again.");
        return;
      }
      saveSession(user);
      router.push(ROLE_CONFIG[user.role].dashboardPath);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email, password, remember, showPassword, isLoading, error,
    setEmail, setPassword, toggleRemember, toggleShowPassword, handleSubmit,
  };
}
