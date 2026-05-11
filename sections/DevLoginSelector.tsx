"use client";

/**
 * DevLoginSelector
 * ─────────────────────────────────────────────────────────────────────────────
 * Development-only login page that shows all 4 dummy user types.
 * Each card auto-fills credentials and logs in immediately.
 *
 * USAGE: Visit /dev-login during development.
 * 🔌 Remove or gate behind env check before production.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DUMMY_USERS,
  ROLE_CONFIG,
  authenticateUser,
  saveSession,
  DummyUser,
  UserRole,
} from "@/constants/dummyUsers";

function formatNaira(n: number) {
  return `₦${(n / 1000000).toFixed(1)}M`;
}

export function DevLoginSelector() {
  const router = useRouter();
  const [loggingIn, setLoggingIn] = useState<string | null>(null);
  const [manualEmail, setManualEmail] = useState("");
  const [manualPassword, setManualPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualLoading, setManualLoading] = useState(false);

  const loginAs = async (user: DummyUser) => {
    setLoggingIn(user.id);
    // Simulate auth delay
    await new Promise((r) => setTimeout(r, 600));
    saveSession(user);
    router.push(ROLE_CONFIG[user.role].dashboardPath);
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);
    setManualLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const user = authenticateUser(manualEmail, manualPassword);
    if (!user) {
      setManualError("Invalid email or password.");
      setManualLoading(false);
      return;
    }
    saveSession(user);
    router.push(ROLE_CONFIG[user.role].dashboardPath);
  };

  const roleOrder: UserRole[] = ["customer", "supplier", "driver", "financial"];

  return (
    <div className="min-h-screen bg-[#F4F4F7] flex flex-col items-center justify-center p-4">
      {/* Dev badge */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col items-center gap-3"
      >
        <div className="flex items-center gap-2 bg-amber-100 border border-amber-300 text-amber-800 text-[12px] font-bold px-4 py-2 rounded-full">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          Development Mode — Test Login
        </div>
        <h1 className="font-extrabold text-[28px] text-[#121212] text-center">
          QuarryLink Test Accounts
        </h1>
        <p className="text-[14px] text-zinc-500 text-center max-w-sm">
          Click any role card to log in instantly, or use the credentials below.
          All passwords: <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono">Test1234!</code>
        </p>
      </motion.div>

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
        {roleOrder.map((role, i) => {
          const user = DUMMY_USERS.find((u) => u.role === role)!;
          const cfg = ROLE_CONFIG[role];
          const isLoading = loggingIn === user.id;

          return (
            <motion.button
              key={role}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => loginAs(user)}
              disabled={!!loggingIn}
              className={cn(
                "bg-white rounded-2xl border-2 p-5 text-left transition-all duration-200 shadow-sm",
                "hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]",
                isLoading
                  ? "border-[#ffc107] shadow-[0_0_0_4px_rgba(255,193,7,0.15)]"
                  : "border-zinc-100 hover:border-zinc-200",
                loggingIn && !isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon + avatar */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-[22px]"
                    style={{ background: cfg.bg }}
                  >
                    {cfg.icon}
                  </div>
                  {user.kycVerified && (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-green-600">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      KYC
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="font-bold text-[15px] text-[#121212] truncate">
                    {user.name}
                  </p>
                  <p className="text-[12px] text-zinc-400 truncate">{user.company}</p>
                  <p className="text-[11px] text-zinc-400 mt-1">{user.email}</p>
                </div>

                {/* Arrow / spinner */}
                <div className="shrink-0 mt-1">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-[#ffc107] animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-500" />
                  )}
                </div>
              </div>

              {/* Credentials strip */}
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="font-mono text-[11px] text-zinc-400">{user.email}</span>
                <span className="font-mono text-[11px] text-zinc-300">Test1234!</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Manual login form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 w-full max-w-sm"
      >
        <h3 className="font-bold text-[15px] text-[#121212] mb-4">
          Or sign in manually
        </h3>
        <form onSubmit={handleManualLogin} className="flex flex-col gap-3">
          <input
            type="email"
            value={manualEmail}
            onChange={(e) => setManualEmail(e.target.value)}
            placeholder="Email address"
            required
            className="h-11 rounded-xl border-2 border-zinc-200 bg-zinc-50 px-4 text-[14px] text-[#121212] outline-none focus:border-[#ffc107] transition-colors placeholder:text-zinc-400"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={manualPassword}
              onChange={(e) => setManualPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full h-11 rounded-xl border-2 border-zinc-200 bg-zinc-50 px-4 pr-11 text-[14px] text-[#121212] outline-none focus:border-[#ffc107] transition-colors placeholder:text-zinc-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {manualError && (
            <p className="text-[12px] text-red-500 font-medium">{manualError}</p>
          )}

          <button
            type="submit"
            disabled={manualLoading}
            className={cn(
              "h-11 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all",
              manualLoading
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] hover:scale-[1.01]"
            )}
          >
            {manualLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
            ) : (
              <>Sign In <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </motion.div>

      <p className="mt-6 text-[11px] text-zinc-400 text-center max-w-xs">
        🔌 This dev login page uses localStorage for session storage.
        Replace with real auth before going to production.
      </p>
    </div>
  );
}
