"use client";

import { useState } from "react";
import { AccountType } from "@/constants/registerConstants";

export interface RegisterFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  accountType: AccountType | "";
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RegisterFormActions {
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setEmail: (v: string) => void;
  setPhone: (v: string) => void;
  setPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  setAccountType: (v: AccountType) => void;
  toggleShowPassword: () => void;
  toggleShowConfirmPassword: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useRegisterForm(): RegisterFormState & RegisterFormActions {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleShowPassword = () => setShowPassword((p) => !p);
  const toggleShowConfirmPassword = () => setShowConfirmPassword((p) => !p);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!accountType) {
      setError("Please select an account type.");
      return;
    }

    setIsLoading(true);
    try {
      // 🔌 Replace with your real registration call:
      // await registerUser({ firstName, lastName, email, phone, password, accountType });
      await new Promise((res) => setTimeout(res, 1500));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    firstName, lastName, email, phone,
    password, confirmPassword, accountType,
    showPassword, showConfirmPassword,
    isLoading, error,
    setFirstName, setLastName, setEmail, setPhone,
    setPassword, setConfirmPassword,
    setAccountType: setAccountType as (v: AccountType) => void,
    toggleShowPassword, toggleShowConfirmPassword,
    handleSubmit,
  };
}
