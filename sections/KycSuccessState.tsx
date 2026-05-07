"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Clock } from "lucide-react";
import { KYC_COPY } from "@/constants/kycConstants";

export function KycSuccessState() {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="flex flex-col items-center text-center py-6"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="relative mb-8"
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        {/* Ripple rings */}
        {[1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-green-300"
            animate={{ scale: [1, 1.6 + i * 0.3], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center gap-3 mb-8"
      >
        <h3 className="font-extrabold text-[28px] text-[#121212] leading-tight">
          {KYC_COPY.steps.success.heading}
        </h3>
        <p className="text-[14px] text-zinc-500 leading-relaxed max-w-[300px]">
          {KYC_COPY.steps.success.sub}
        </p>
      </motion.div>

      {/* Status card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-start gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-[#ffc107]/20 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-[#ffc107]" />
        </div>
        <div className="text-left">
          <p className="text-[13px] font-bold text-amber-900 mb-1">Verification under review</p>
          <p className="text-[12px] text-amber-700 leading-snug">
            Our compliance team will review your submission within 24 hours. You'll receive an email update once approved.
          </p>
        </div>
      </motion.div>

      {/* What's next */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="w-full flex flex-col gap-3 mb-8"
      >
        {[
          { step: "01", text: "Email notification with verification result" },
          { step: "02", text: "Verified badge added to your account" },
          { step: "03", text: "Full platform access unlocked" },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
            <span className="font-extrabold text-[13px] text-[#ffc107] w-6 shrink-0">{step}</span>
            <span className="text-[13px] text-zinc-600">{text}</span>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="w-full flex flex-col gap-3"
      >
        <Link
          href="/dashboard"
          className="w-full h-12 rounded-xl bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold text-[15px] flex items-center justify-center gap-2.5 shadow-[0_4px_14px_rgba(255,193,7,0.35)] transition-all hover:scale-[1.01]"
        >
          Go to Dashboard
          <ArrowRight className="w-4.5 h-4.5" />
        </Link>
        <Link
          href="/"
          className="w-full h-11 rounded-xl border-2 border-zinc-200 bg-white text-zinc-600 font-bold text-[14px] flex items-center justify-center transition-all hover:border-zinc-300"
        >
          Back to Home
        </Link>
      </motion.div>
    </motion.div>
  );
}