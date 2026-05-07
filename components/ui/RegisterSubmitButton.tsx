"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { REGISTER_COPY } from "@/constants/registerConstants";

interface RegisterSubmitButtonProps {
  isLoading: boolean;
  disabled?: boolean;
}

export function RegisterSubmitButton({ isLoading, disabled }: RegisterSubmitButtonProps) {
  const isDisabled = isLoading || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={cn(
        "w-full h-12 rounded-xl font-bold text-[15px]",
        "flex items-center justify-center gap-2.5",
        "transition-all duration-200",
        isDisabled
          ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
          : "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] shadow-[0_4px_14px_rgba(255,193,7,0.35)] hover:shadow-[0_6px_20px_rgba(255,193,7,0.45)] hover:scale-[1.01] active:scale-[0.99]"
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4.5 h-4.5 animate-spin" />
          {REGISTER_COPY.submittingLabel}
        </>
      ) : (
        <>
          {REGISTER_COPY.submitLabel}
          <ArrowRight className="w-4.5 h-4.5" />
        </>
      )}
    </button>
  );
}