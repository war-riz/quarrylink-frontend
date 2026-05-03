"use client";

import { cn } from "@/lib/utils";
import { VERIFY_COPY } from "@/constants/verifyConstants";

interface VerifyCodeInputsProps {
  code: string[];
  inputsRef: React.MutableRefObject<(HTMLInputElement | null)[]>;
  hasError: boolean;
  isSuccess: boolean;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent) => void;
  onPaste: (e: React.ClipboardEvent) => void;
}

export function VerifyCodeInputs({
  code, inputsRef, hasError, isSuccess,
  onChange, onKeyDown, onPaste,
}: VerifyCodeInputsProps) {
  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: VERIFY_COPY.codeLength }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={code[i]}
          onChange={(e) => onChange(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "w-12 h-14 text-center text-[22px] font-bold rounded-xl border-2 outline-none",
            "transition-all duration-150 bg-zinc-50",
            "focus:bg-white focus:scale-105",
            isSuccess
              ? "border-green-400 bg-green-50 text-green-600"
              : hasError
              ? "border-red-400 bg-red-50 text-red-600"
              : code[i]
              ? "border-[#ffc107] bg-[#fffdf0] text-[#121212] shadow-[0_0_0_4px_rgba(255,193,7,0.12)]"
              : "border-zinc-200 text-[#121212] focus:border-[#ffc107] focus:shadow-[0_0_0_4px_rgba(255,193,7,0.12)]"
          )}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
