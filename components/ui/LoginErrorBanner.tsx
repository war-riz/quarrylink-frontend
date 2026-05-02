"use client";

import { AlertCircle } from "lucide-react";

interface LoginErrorBannerProps {
  message: string;
}

export function LoginErrorBanner({ message }: LoginErrorBannerProps) {
  return (
    <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium px-4 py-3 rounded-xl mb-5">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
