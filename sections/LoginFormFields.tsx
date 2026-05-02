"use client";

import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOGIN_COPY } from "@/constants/loginConstants";

interface LoginFormFieldsProps {
  email: string;
  password: string;
  remember: boolean;
  showPassword: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onToggleRemember: () => void;
  onToggleShowPassword: () => void;
}

const inputBase =
  "w-full h-12 rounded-xl border-2 border-zinc-200 bg-zinc-50 pl-11 pr-4 text-[14px] font-normal text-[#121212] placeholder:text-zinc-400 outline-none transition-all duration-200 focus:border-[#ffc107] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,193,7,0.12)]";

export function LoginFormFields({
  email,
  password,
  remember,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onToggleRemember,
  onToggleShowPassword,
}: LoginFormFieldsProps) {
  return (
    <div className="flex flex-col gap-4">

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-[13px] font-bold text-[#121212]">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            required
            className={inputBase}
          />
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-[13px] font-bold text-[#121212]">
            Password
          </label>
          <Link
            href={LOGIN_COPY.forgotHref}
            className="text-[12px] font-medium text-zinc-500 hover:text-[#ffc107] transition-colors underline underline-offset-2"
          >
            {LOGIN_COPY.forgotLabel}
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            className={cn(inputBase, "pr-11")}
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Remember me */}
      <button
        type="button"
        onClick={onToggleRemember}
        className="flex items-center gap-2.5 w-fit cursor-pointer select-none group"
      >
        <div
          className={cn(
            "w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150",
            remember
              ? "bg-[#ffc107] border-[#ffc107]"
              : "bg-white border-zinc-300 group-hover:border-zinc-400"
          )}
        >
          {remember && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"
              stroke="#121212" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
        </div>
        <span className="text-[13px] font-normal text-zinc-500">
          {LOGIN_COPY.rememberLabel}
        </span>
      </button>

    </div>
  );
}
