"use client";

import { useKycForm } from "@/hooks/useKycForm";
import { KycBrandPanel } from "@/sections/KycBrandPanel";
import { KycFormPanel } from "@/sections/KycFormPanel";

export function KycShell() {
  const form = useKycForm();

  return (
    <div className="min-h-screen flex">
      {/* Left — dark brand panel, synced to live step */}
      <KycBrandPanel currentStep={form.step} />

      {/* Right — form panel, receives all state + actions */}
      <KycFormPanel {...form} />
    </div>
  );
}