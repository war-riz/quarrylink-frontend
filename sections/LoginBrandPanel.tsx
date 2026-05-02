"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LOGIN_STATS, LOGIN_COPY } from "@/constants/loginConstants";
import { siteConfig } from "@/constants/navigation";

export function LoginBrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[48%] bg-[#121212] relative overflow-hidden flex-col px-14 py-12">

      {/* Decorative amber glows */}
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
          {LOGIN_COPY.badge}
        </span>

        <h1 className="font-extrabold text-[46px] xl:text-[54px] text-white leading-[1.1] mb-6">
          {LOGIN_COPY.heading.map((line, i) =>
            i === LOGIN_COPY.highlightLine ? (
              <span key={i} className="text-[#ffc107]">{line}<br /></span>
            ) : (
              <span key={i}>{line}<br /></span>
            )
          )}
        </h1>

        <p className="text-white/50 text-[15px] font-normal leading-relaxed max-w-[300px]">
          {LOGIN_COPY.subtext}
        </p>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="flex items-center gap-8 pt-7 border-t border-white/10 z-10"
      >
        {LOGIN_STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-0.5">
            <span className="font-extrabold text-[22px] text-[#ffc107]">{stat.value}</span>
            <span className="text-[12px] text-white/40 font-normal">{stat.label}</span>
          </div>
        ))}
      </motion.div>

    </div>
  );
}
