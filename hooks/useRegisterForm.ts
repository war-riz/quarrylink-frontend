"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccountType } from "@/constants/registerConstants";

export interface RegisterFormState {
  step: 1 | 2;
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
  nokName: string;
  nokRelationship: string;
  nokPhone: string;
  nokEmail: string;
  nokAddress: string;
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
  handleNext: (e: React.FormEvent) => void;
  handleBack: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setNokName: (v: string) => void;
  setNokRelationship: (v: string) => void;
  setNokPhone: (v: string) => void;
  setNokEmail: (v: string) => void;
  setNokAddress: (v: string) => void;
}

export function useRegisterForm(): RegisterFormState & RegisterFormActions {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);

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

  const [nokName, setNokName] = useState("");
  const [nokRelationship, setNokRelationship] = useState("");
  const [nokPhone, setNokPhone] = useState("");
  const [nokEmail, setNokEmail] = useState("");
  const [nokAddress, setNokAddress] = useState("");

  const toggleShowPassword = () => setShowPassword((p) => !p);
  const toggleShowConfirmPassword = () => setShowConfirmPassword((p) => !p);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
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

    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setError(null);
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nokName.trim()) {
      setError("Please enter your next of kin's full name.");
      return;
    }
    if (!nokRelationship) {
      setError("Please select your relationship to next of kin.");
      return;
    }
    if (!nokPhone.trim()) {
      setError("Please enter your next of kin's phone number.");
      return;
    }
    if (!nokAddress.trim()) {
      setError("Please enter your next of kin's physical address.");
      return;
    }

    setIsLoading(true);
    try {
      // 🔌 Replace with your real registration call:
      // await registerUser({
      //   firstName, lastName, email, phone, password, accountType,
      //   nextOfKin: { name: nokName, relationship: nokRelationship, phone: nokPhone, email: nokEmail, address: nokAddress }
      // });
      await new Promise((res) => setTimeout(res, 1500));
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return {
    step,
    firstName, lastName, email, phone,
    password, confirmPassword, accountType,
    showPassword, showConfirmPassword,
    isLoading, error,
    nokName, nokRelationship, nokPhone, nokEmail, nokAddress,
    setFirstName, setLastName, setEmail, setPhone,
    setPassword, setConfirmPassword,
    setAccountType: setAccountType as (v: AccountType) => void,
    toggleShowPassword, toggleShowConfirmPassword,
    handleNext, handleBack, handleSubmit,
    setNokName, setNokRelationship, setNokPhone, setNokEmail, setNokAddress,
  };
}