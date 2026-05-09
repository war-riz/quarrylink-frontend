"use client";

/**
 * RatingFlow
 * ─────────────────────────────────────────────────────────────────────────────
 * Shown after order is confirmed as completed.
 * Customer rates:
 *   1. The supplier (material quality, communication)
 *   2. The driver  (professionalism, speed, care)
 *
 * 🔌 BACKEND INTEGRATION:
 *   POST /api/orders/:id/ratings  { supplierRating, driverRating, reviews }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Order } from "@/constants/dashboardConstants";

// ── Star picker ───────────────────────────────────────────────────

function StarPicker({
  value,
  onChange,
  size = "lg",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const dim = size === "lg" ? "w-9 h-9" : "w-6 h-6";

  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const active = s <= (hovered || value);
        return (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(s)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              className={cn(dim, "transition-colors")}
              fill={active ? "#ffc107" : "none"}
              stroke={active ? "#ffc107" : "#d1d5db"}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const QUICK_TAGS_SUPPLIER = [
  "On time", "Great quality", "Good communication",
  "True to description", "Would order again",
];

const QUICK_TAGS_DRIVER = [
  "Professional", "Careful handling", "Punctual",
  "Friendly", "Clean truck",
];

// ── Main component ────────────────────────────────────────────────

interface RatingFlowProps {
  order: Order;
  onDone: () => void;
}

export function RatingFlow({ order, onDone }: RatingFlowProps) {
  const [supplierRating, setSupplierRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [supplierTags, setSupplierTags] = useState<string[]>([]);
  const [driverTags, setDriverTags] = useState<string[]>([]);
  const [supplierReview, setSupplierReview] = useState("");
  const [driverReview, setDriverReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const toggleTag = (
    tags: string[],
    setTags: (t: string[]) => void,
    tag: string
  ) => {
    setTags(
      tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 🔌 REPLACE WITH:
      // await fetch(`/api/orders/${order.id}/ratings`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     supplierRating,
      //     driverRating,
      //     supplierTags,
      //     driverTags,
      //     supplierReview,
      //     driverReview,
      //   }),
      // });
      await new Promise((r) => setTimeout(r, 1500));
      setIsDone(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180 }}
        className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 bg-[#ffc107]/15 rounded-full flex items-center justify-center mb-5"
        >
          <Star className="w-10 h-10 text-[#ffc107] fill-[#ffc107]" />
        </motion.div>
        <h3 className="font-extrabold text-[22px] text-[#121212] mb-2">
          Thanks for your feedback!
        </h3>
        <p className="text-[14px] text-zinc-500 mb-6 max-w-[260px] leading-relaxed">
          Your ratings help us maintain quality across the QuarryLink network.
        </p>
        <button
          onClick={onDone}
          className="w-full h-11 bg-[#121212] hover:bg-zinc-800 text-white font-bold rounded-xl transition-all"
        >
          Back to Dashboard
        </button>
      </motion.div>
    );
  }

  const canSubmit = supplierRating > 0 && driverRating > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      <div className="text-center mb-2">
        <h2 className="font-extrabold text-[20px] text-[#121212]">
          Rate Your Experience
        </h2>
        <p className="text-[13px] text-zinc-400 mt-1">
          Order {order.id} · {order.material}
        </p>
      </div>

      {/* Supplier rating */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#ffc107]/15 flex items-center justify-center shrink-0">
            <span className="text-[18px]">🏭</span>
          </div>
          <div>
            <p className="font-bold text-[15px] text-[#121212]">{order.supplier}</p>
            <p className="text-[12px] text-zinc-400">Supplier · Material quality & service</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <StarPicker value={supplierRating} onChange={setSupplierRating} />
          {supplierRating > 0 && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[13px] font-bold text-[#ffc107]"
            >
              {STAR_LABELS[supplierRating]}
            </motion.span>
          )}
        </div>

        {/* Quick tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_TAGS_SUPPLIER.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(supplierTags, setSupplierTags, tag)}
              className={cn(
                "text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-all",
                supplierTags.includes(tag)
                  ? "bg-[#121212] text-white border-[#121212]"
                  : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300"
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        <textarea
          rows={2}
          value={supplierReview}
          onChange={(e) => setSupplierReview(e.target.value)}
          placeholder="Any comments about this supplier? (optional)"
          className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 px-4 py-3 text-[13px] text-[#121212] placeholder:text-zinc-400 outline-none focus:border-[#ffc107] focus:bg-white transition-all resize-none"
        />
      </div>

      {/* Driver rating */}
      {order.driver && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#ffc107]/15 border-2 border-[#ffc107]/30 flex items-center justify-center shrink-0">
              <span className="font-extrabold text-[13px] text-[#ffc107]">
                {order.driver.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div>
              <p className="font-bold text-[15px] text-[#121212]">{order.driver.name}</p>
              <p className="text-[12px] text-zinc-400">Driver · {order.driver.truckPlate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <StarPicker value={driverRating} onChange={setDriverRating} />
            {driverRating > 0 && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[13px] font-bold text-[#ffc107]"
              >
                {STAR_LABELS[driverRating]}
              </motion.span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {QUICK_TAGS_DRIVER.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(driverTags, setDriverTags, tag)}
                className={cn(
                  "text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-all",
                  driverTags.includes(tag)
                    ? "bg-[#121212] text-white border-[#121212]"
                    : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300"
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          <textarea
            rows={2}
            value={driverReview}
            onChange={(e) => setDriverReview(e.target.value)}
            placeholder="Any comments about this driver? (optional)"
            className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 px-4 py-3 text-[13px] text-[#121212] placeholder:text-zinc-400 outline-none focus:border-[#ffc107] focus:bg-white transition-all resize-none"
          />
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className={cn(
          "w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all duration-200",
          canSubmit && !isSubmitting
            ? "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] shadow-[0_4px_14px_rgba(255,193,7,0.35)] hover:scale-[1.01] active:scale-[0.99]"
            : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
        )}
      >
        {isSubmitting ? (
          <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Submitting...</>
        ) : (
          <>Submit Ratings</>
        )}
      </button>

      <button
        type="button"
        onClick={onDone}
        className="w-full text-center text-[13px] text-zinc-400 hover:text-zinc-600 transition-colors pb-2"
      >
        Skip for now
      </button>
    </motion.div>
  );
}
