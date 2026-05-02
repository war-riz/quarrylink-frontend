"use client";

import { useState } from "react";

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
      // 🔌 Replace this with your real auth call:
      // await signIn("credentials", { email, password, redirect: false });
      await new Promise((res) => setTimeout(res, 1500));
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email, password, remember, showPassword, isLoading, error,
    setEmail, setPassword, toggleRemember, toggleShowPassword, handleSubmit,
  };
}
