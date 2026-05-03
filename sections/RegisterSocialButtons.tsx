"use client";

import { REGISTER_COPY } from "@/constants/registerConstants";

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg width="14" height="16" viewBox="0 0 814 1000" fill="currentColor">
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.4-150.3-109.1c-52.1-75.8-96.1-192.1-96.1-304.7 0-91.9 19.1-181.1 57.5-258.2 52.8-103.7 147-174.1 252.9-174.1 56.1 0 102.2 38.2 136.7 38.2 32.9 0 84.4-40.8 148.9-40.8 24.4 0 105.7 2.8 157.5 76.8zm-181.4-95.3c28.7-34 48.8-81.3 48.8-128.6 0-6.4-.6-12.9-1.9-18C657.9 26.5 573.8 74 519.8 137.9c-25.6 29.9-49.4 78.3-49.4 127.1 0 7 1.3 13.9 1.9 16.2 3.2.6 8.4 1.3 13.6 1.3 49.4 0 99.6-29.9 102.3-99.6z" />
  </svg>
);

export function RegisterSocialButtons() {
  return (
    <div className="flex flex-col gap-3 mb-2">
      <div className="flex gap-3">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2.5 h-11 rounded-xl border-2 border-zinc-200 bg-white hover:border-[#ffc107] hover:bg-[#fffdf0] transition-all duration-200 font-semibold text-[13px] text-[#121212]"
        >
          <GoogleIcon />
          Google
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2.5 h-11 rounded-xl border-2 border-zinc-200 bg-white hover:border-[#ffc107] hover:bg-[#fffdf0] transition-all duration-200 font-semibold text-[13px] text-[#121212]"
        >
          <AppleIcon />
          Apple
        </button>
      </div>

      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-zinc-200" />
        <span className="text-[12px] text-zinc-400 font-medium whitespace-nowrap">
          {REGISTER_COPY.dividerText}
        </span>
        <div className="flex-1 h-px bg-zinc-200" />
      </div>
    </div>
  );
}
