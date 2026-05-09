import { Suspense } from "react";
import { VerifyPageInner } from "@/sections/VerifyPageInner";

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-4 border-[#ffc107] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyPageInner />
    </Suspense>
  );
} 