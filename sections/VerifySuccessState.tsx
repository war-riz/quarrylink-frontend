"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { VERIFY_COPY } from "@/constants/verifyConstants";

export function VerifySuccessState() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="flex flex-col items-center text-center py-8"
    >
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>
      <h3 className="font-extrabold text-[26px] text-[#121212] mb-3">
        {VERIFY_COPY.successHeading}
      </h3>
      <p className="text-[14px] text-zinc-500 leading-relaxed max-w-[280px]">
        {VERIFY_COPY.successSubtext}
      </p>

      {/* Loading dots */}
      <div className="flex gap-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-[#ffc107] rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
