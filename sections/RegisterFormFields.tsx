"use client";

import { Eye, EyeOff, Mail, Lock, Phone, User, ChevronDown, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ACCOUNT_TYPES, AccountType } from "@/constants/registerConstants";

/* ─────────────────────────────────────────
   Shared input style
───────────────────────────────────────── */
const inputBase =
  "w-full h-11 rounded-xl border-2 border-zinc-200 bg-zinc-50 pl-10 pr-4 text-[13.5px] font-normal text-[#121212] placeholder:text-zinc-400 outline-none transition-all duration-200 focus:border-[#ffc107] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,193,7,0.12)]";

const RELATIONSHIPS = [
  "Parent", "Sibling", "Spouse",
  "Child", "Friend", "Colleague", "Other",
];

/* ─────────────────────────────────────────
   STEP 1 — Personal Information
───────────────────────────────────────── */
export interface Step1FieldsProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  accountType: AccountType | "";
  showPassword: boolean;
  showConfirmPassword: boolean;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onAccountTypeChange: (v: AccountType) => void;
  onToggleShowPassword: () => void;
  onToggleShowConfirmPassword: () => void;
}

export function Step1Fields({
  firstName, lastName, email, phone,
  password, confirmPassword, accountType,
  showPassword, showConfirmPassword,
  onFirstNameChange, onLastNameChange,
  onEmailChange, onPhoneChange,
  onPasswordChange, onConfirmPasswordChange,
  onAccountTypeChange,
  onToggleShowPassword, onToggleShowConfirmPassword,
}: Step1FieldsProps) {
  return (
    <div className="flex flex-col gap-3.5">

      {/* First name + Last name */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="firstName" className="text-[12.5px] font-bold text-[#121212]">First name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <input id="firstName" type="text" value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              placeholder="John" autoComplete="given-name" required className={inputBase} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastName" className="text-[12.5px] font-bold text-[#121212]">Last name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <input id="lastName" type="text" value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              placeholder="Doe" autoComplete="family-name" required className={inputBase} />
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-email" className="text-[12.5px] font-bold text-[#121212]">Email address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          <input id="reg-email" type="email" value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@company.com" autoComplete="email" required className={inputBase} />
        </div>
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-[12.5px] font-bold text-[#121212]">Phone number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          <input id="phone" type="tel" value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+234 800 000 0000" autoComplete="tel" required className={inputBase} />
        </div>
      </div>

      {/* Account type */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="accountType" className="text-[12.5px] font-bold text-[#121212]">Account type</label>
        <div className="relative">
          <select id="accountType" value={accountType}
            onChange={(e) => onAccountTypeChange(e.target.value as AccountType)}
            required
            className={cn(inputBase, "pl-3.5 pr-9 appearance-none cursor-pointer",
              accountType === "" ? "text-zinc-400" : "text-[#121212]")}
          >
            <option value="" disabled>Select your role...</option>
            {ACCOUNT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-password" className="text-[12.5px] font-bold text-[#121212]">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          <input id="reg-password" type={showPassword ? "text" : "password"} value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Min. 8 characters" autoComplete="new-password" minLength={8} required
            className={cn(inputBase, "pr-10")} />
          <button type="button" onClick={onToggleShowPassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors">
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-[12.5px] font-bold text-[#121212]">Confirm password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="Repeat your password" autoComplete="new-password" required
            className={cn(inputBase, "pr-10")} />
          <button type="button" onClick={onToggleShowConfirmPassword}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors">
            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────
   STEP 2 — Next of Kin + Consent
───────────────────────────────────────── */
export interface Step2FieldsProps {
  nokName: string;
  nokRelationship: string;
  nokPhone: string;
  nokEmail: string;
  nokAddress: string;
  consent: boolean;
  onNokNameChange: (v: string) => void;
  onNokRelationshipChange: (v: string) => void;
  onNokPhoneChange: (v: string) => void;
  onNokEmailChange: (v: string) => void;
  onNokAddressChange: (v: string) => void;
  onToggleConsent: () => void;
}

export function Step2Fields({
  nokName, nokRelationship, nokPhone, nokEmail, nokAddress,
  consent,
  onNokNameChange, onNokRelationshipChange,
  onNokPhoneChange, onNokEmailChange, onNokAddressChange,
  onToggleConsent,
}: Step2FieldsProps) {
  return (
    <div className="flex flex-col gap-3.5">

      {/* Full name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nokName" className="text-[12.5px] font-bold text-[#121212]">Full name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          <input id="nokName" type="text" value={nokName}
            onChange={(e) => onNokNameChange(e.target.value)}
            placeholder="Next of kin's full name" required className={inputBase} />
        </div>
      </div>

      {/* Phone + Relationship */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nokPhone" className="text-[12.5px] font-bold text-[#121212]">Phone number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <input id="nokPhone" type="tel" value={nokPhone}
              onChange={(e) => onNokPhoneChange(e.target.value)}
              placeholder="+234 800 000 0000" required className={inputBase} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nokRelationship" className="text-[12.5px] font-bold text-[#121212]">Relationship</label>
          <div className="relative">
            <select id="nokRelationship" value={nokRelationship}
              onChange={(e) => onNokRelationshipChange(e.target.value)}
              required
              className={cn(inputBase, "pl-3.5 pr-8 appearance-none cursor-pointer",
                nokRelationship === "" ? "text-zinc-400" : "text-[#121212]")}
            >
              <option value="" disabled>Select...</option>
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Email (optional) */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nokEmail" className="text-[12.5px] font-bold text-[#121212]">
          Email address <span className="text-zinc-400 font-normal">(optional)</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          <input id="nokEmail" type="email" value={nokEmail}
            onChange={(e) => onNokEmailChange(e.target.value)}
            placeholder="kin@example.com" className={inputBase} />
        </div>
      </div>

      {/* Physical address */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nokAddress" className="text-[12.5px] font-bold text-[#121212]">Physical address</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          <textarea id="nokAddress" value={nokAddress}
            onChange={(e) => onNokAddressChange(e.target.value)}
            placeholder="12 Awolowo Road, Ikoyi, Lagos"
            rows={3} required
            className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 pl-10 pr-4 pt-3 pb-3 text-[13.5px] font-normal text-[#121212] placeholder:text-zinc-400 outline-none transition-all duration-200 focus:border-[#ffc107] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,193,7,0.12)] resize-none"
          />
        </div>
      </div>

      {/* ── Consent checkbox ── sits right here, above the buttons ── */}
      <button
        type="button"
        onClick={onToggleConsent}
        className="flex items-start gap-3 w-full cursor-pointer select-none group text-left mt-1"
      >
        {/* Checkbox */}
        <div className={cn(
          "w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 mt-0.5",
          consent
            ? "bg-[#ffc107] border-[#ffc107]"
            : "bg-white border-zinc-300 group-hover:border-zinc-400"
        )}>
          {consent && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"
              stroke="#121212" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
        </div>

        {/* Label */}
        <span className="text-[12.5px] font-normal text-zinc-500 leading-relaxed">
          I agree to QuarryLink's{" "}
          <Link href="/terms" onClick={(e) => e.stopPropagation()}
            className="font-semibold text-[#121212] underline underline-offset-2 hover:text-[#ffc107] transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" onClick={(e) => e.stopPropagation()}
            className="font-semibold text-[#121212] underline underline-offset-2 hover:text-[#ffc107] transition-colors">
            Privacy Policy
          </Link>
          , and consent to receive platform communications.
        </span>
      </button>

    </div>
  );
}