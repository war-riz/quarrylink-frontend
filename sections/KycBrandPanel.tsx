"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { KYC_COPY, KYC_STEPS, KycStep } from "@/constants/kycConstants";
import { siteConfig } from "@/constants/navigation";

interface KycBrandPanelProps {
  currentStep: KycStep;
}

export function KycBrandPanel({ currentStep }: KycBrandPanelProps) {
  const currentIndex = KYC_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="hidden lg:flex lg:w-[45%] bg-[#121212] relative overflow-hidden flex-col px-14 py-12">
      {/* Glow effects */}
      <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-[#ffc107]/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#ffc107]/5 blur-[60px] rounded-full pointer-events-none" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-3.5 w-fit z-10">
        <div className="relative flex items-center justify-center w-[65px] h-10 rounded-[7px] bg-[#ffc107] overflow-hidden">
          <Image src="/images/logo.png" alt={siteConfig.name} fill sizes="65px" className="object-contain p-1" />
        </div>
        <span className="font-bold text-[20px] text-white">{siteConfig.name}</span>
      </Link>

      {/* Central copy */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="flex-1 flex flex-col justify-center z-10"
      >
        <span className="inline-flex items-center gap-2 bg-[#ffc107]/15 border border-[#ffc107]/40 text-[#ffc107] text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full w-fit mb-6">
          <span className="w-1.5 h-1.5 bg-[#ffc107] rounded-full animate-pulse" />
          {KYC_COPY.badge}
        </span>

        <h1 className="font-extrabold text-[42px] xl:text-[50px] text-white leading-[1.1] mb-6">
          {KYC_COPY.heading.map((line, i) =>
            i === KYC_COPY.highlightLine ? (
              <span key={i} className="text-[#ffc107]">{line}<br /></span>
            ) : (
              <span key={i}>{line}<br /></span>
            )
          )}
        </h1>

        <p className="text-white/50 text-[14px] font-normal leading-relaxed max-w-[300px] mb-10">
          {KYC_COPY.subtext}
        </p>

        {/* Progress steps */}
        <div className="flex flex-col gap-3">
          {KYC_STEPS.map((s, i) => {
            const isDone = i < currentIndex;
            const isActive = i === currentIndex;
            return (
              <div key={s.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300 ${
                  isDone
                    ? "bg-[#ffc107] text-[#121212]"
                    : isActive
                    ? "bg-[#ffc107]/20 border-2 border-[#ffc107] text-[#ffc107]"
                    : "bg-white/5 border border-white/15 text-white/30"
                }`}>
                  {isDone ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-[13px] font-medium transition-colors duration-300 ${
                  isDone ? "text-[#ffc107]" : isActive ? "text-white" : "text-white/25"
                }`}>
                  {s.label}
                </span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ffc107] animate-pulse ml-auto" />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Security perks */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="flex flex-col gap-3 pt-7 border-t border-white/10 z-10"
      >
        {KYC_COPY.perks.map((perk) => (
          <div key={perk} className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#ffc107] shrink-0 mt-0.5" />
            <span className="text-[12px] text-white/40 leading-snug">{perk}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}