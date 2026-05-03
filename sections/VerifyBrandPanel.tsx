"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, RefreshCcw } from "lucide-react";
import { siteConfig } from "@/constants/navigation";

const TIPS = [
  { icon: ShieldCheck, text: "Your code is valid for 10 minutes" },
  { icon: Clock,       text: "Check your spam folder if you don't see it" },
  { icon: RefreshCcw,  text: "You can request a new code after 30 seconds" },
];

export function VerifyBrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[48%] bg-[#121212] relative overflow-hidden flex-col px-14 py-12">

      {/* Decorative glows */}
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
          <span className="w-1.5 h-1.5 bg-[#ffc107] rounded-full" />
          One last step
        </span>

        <h1 className="font-extrabold text-[46px] xl:text-[52px] text-white leading-[1.1] mb-6">
          Almost<br />
          <span className="text-[#ffc107]">there.</span>
        </h1>

        <p className="text-white/50 text-[15px] font-normal leading-relaxed max-w-[300px] mb-10">
          Verify your email to unlock full access to QuarryLink's supplier network and logistics platform.
        </p>

        {/* Tips */}
        <div className="flex flex-col gap-4">
          {TIPS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#ffc107]/10 border border-[#ffc107]/20 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#ffc107]" />
              </div>
              <span className="text-[13px] text-white/55 leading-snug">{text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-[12px] text-white/25 z-10 pt-7 border-t border-white/10"
      >
        Having trouble? Contact us at{" "}
        <a href="mailto:hello@quarrylink.com" className="text-white/50 hover:text-[#ffc107] transition-colors">
          hello@quarrylink.com
        </a>
      </motion.p>
    </div>
  );
}
