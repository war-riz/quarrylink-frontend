"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { REGISTER_STATS, REGISTER_COPY } from "@/constants/registerConstants";
import { siteConfig } from "@/constants/navigation";

const PERKS = [
  "Access Nigeria's largest verified supplier network",
  "Real-time GPS delivery tracking",
  "Secure escrow payment protection",
  "AI-powered route & load optimization",
];

export function RegisterBrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[48%] bg-[#121212] relative overflow-hidden flex-col px-14 py-12">

      {/* Decorative glows */}
      <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-[#ffc107]/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#ffc107]/5 blur-[60px] rounded-full pointer-events-none" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-3.5 w-fit z-10">
        <div className="relative flex items-center justify-center w-[65px] h-10 rounded-[7px] bg-[#ffc107] overflow-hidden">
          <Image
            src="/images/logo.png"
            alt={siteConfig.name}
            fill
            sizes="65px"
            className="object-contain p-1"
          />
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
          <span className="w-1.5 h-1.5 bg-[#ffc107] rounded-full" />
          {REGISTER_COPY.badge}
        </span>

        <h1 className="font-extrabold text-[42px] xl:text-[50px] text-white leading-[1.1] mb-6">
          {REGISTER_COPY.heading.map((line, i) =>
            i === REGISTER_COPY.highlightLine ? (
              <span key={i} className="text-[#ffc107]">{line}<br /></span>
            ) : (
              <span key={i}>{line}<br /></span>
            )
          )}
        </h1>

        <p className="text-white/50 text-[14px] font-normal leading-relaxed max-w-[300px] mb-8">
          {REGISTER_COPY.subtext}
        </p>

        {/* Perks list */}
        <ul className="flex flex-col gap-3">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-3">
              <CheckCircle2 className="w-4.5 h-4.5 text-[#ffc107] shrink-0 mt-0.5" />
              <span className="text-[13px] text-white/60 leading-snug">{perk}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="flex items-center gap-8 pt-7 border-t border-white/10 z-10"
      >
        {REGISTER_STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-0.5">
            <span className="font-extrabold text-[22px] text-[#ffc107]">{stat.value}</span>
            <span className="text-[12px] text-white/40 font-normal">{stat.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
