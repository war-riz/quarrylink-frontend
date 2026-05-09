"use client";

/**
 * DeliveryConfirmation
 * ─────────────────────────────────────────────────────────────────────────────
 * Shown when order status === "delivered".
 * Customer must:
 *   1. Verify quantity & quality
 *   2. Enter 6-digit OTP (sent by driver via backend)
 *   3. Upload delivery photos (optional but recommended)
 *   4. Submit — triggers escrow release
 *
 * 🔌 BACKEND INTEGRATION:
 *   - onConfirm(otp, photos) calls useOrderRealtime.confirmDelivery()
 *   - That function POSTs to /api/orders/:id/confirm
 *   - Backend validates OTP, marks order as completed, releases escrow
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  X,
  Package,
  Star,
  ArrowRight,
  Truck,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Order } from "@/constants/dashboardConstants";

// ── OTP Input ────────────────────────────────────────────────────

function OtpInput({
  value,
  onChange,
  hasError,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  hasError: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (value[i]) {
        const next = [...value];
        next[i] = "";
        onChange(next);
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array(6).fill("");
    pasted.split("").forEach((c, i) => { next[i] = c; });
    onChange(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2.5 justify-center">
      {Array(6).fill(null).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "w-11 h-13 sm:w-12 sm:h-14 text-center text-[20px] font-extrabold rounded-xl border-2 outline-none transition-all duration-150 bg-zinc-50",
            "focus:scale-105",
            hasError
              ? "border-red-400 bg-red-50 text-red-600"
              : value[i]
              ? "border-[#ffc107] bg-[#fffdf0] text-[#121212] shadow-[0_0_0_4px_rgba(255,193,7,0.12)]"
              : "border-zinc-200 text-[#121212] focus:border-[#ffc107] focus:shadow-[0_0_0_4px_rgba(255,193,7,0.12)]"
          )}
        />
      ))}
    </div>
  );
}

// ── Photo upload strip ────────────────────────────────────────────

function PhotoUploadStrip({
  photos,
  onAdd,
  onRemove,
}: {
  photos: string[];
  onAdd: (dataUrl: string) => void;
  onRemove: (i: number) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) onAdd(ev.target.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {/* Add button */}
      {photos.length < 4 && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center gap-1 hover:border-[#ffc107] hover:bg-[#fffdf0] transition-all"
        >
          <Camera className="w-5 h-5 text-zinc-400" />
          <span className="text-[10px] text-zinc-400 font-medium">Add Photo</span>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      {/* Uploaded photos */}
      {photos.map((src, i) => (
        <div key={i} className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-[#ffc107]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`delivery-${i}`} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Quantity check row ────────────────────────────────────────────

function QuantityCheck({
  ordered,
  received,
  onReceivedChange,
}: {
  ordered: number;
  received: number;
  onReceivedChange: (v: number) => void;
}) {
  const isMatch = received === ordered;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold text-[#121212]">Quantity Received</span>
        <span className={cn(
          "text-[12px] font-bold px-2.5 py-1 rounded-full",
          isMatch ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
        )}>
          {isMatch ? "✓ Matches order" : "⚠ Mismatch"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
          <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wide">Ordered</span>
          <span className="font-extrabold text-[18px] text-[#121212]">{ordered} <span className="text-[13px] font-normal text-zinc-400">tons</span></span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-xl border-2 border-[#ffc107]/30 bg-[#fffdf0]">
          <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wide">Received</span>
          <input
            type="number"
            value={received}
            min={0}
            max={ordered * 1.1}
            step={0.5}
            onChange={(e) => onReceivedChange(parseFloat(e.target.value) || 0)}
            className="font-extrabold text-[18px] text-[#121212] bg-transparent outline-none w-full"
          />
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

interface DeliveryConfirmationProps {
  order: Order;
  onConfirm: (otp: string, photos: string[]) => Promise<void>;
  isConfirming: boolean;
  confirmError: string | null;
  isConfirmed: boolean;
}

export function DeliveryConfirmation({
  order,
  onConfirm,
  isConfirming,
  confirmError,
  isConfirmed,
}: DeliveryConfirmationProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [photos, setPhotos] = useState<string[]>([]);
  const [receivedQty, setReceivedQty] = useState(order.quantity);
  const [qualityOk, setQualityOk] = useState<boolean | null>(null);
  const [otpError, setOtpError] = useState(false);
  const [step, setStep] = useState<"checklist" | "otp">("checklist");

  const otpValue = otp.join("");
  const canProceedChecklist = qualityOk !== null;
  const canSubmit = otpValue.length === 6 && !isConfirming;

  const handleProceedToOtp = () => {
    setStep("otp");
  };

  const handleSubmit = async () => {
    if (otpValue.length !== 6) {
      setOtpError(true);
      return;
    }
    setOtpError(false);
    await onConfirm(otpValue, photos);
  };

  // ── Success state ────────────────────────────────────────────────
  if (isConfirmed) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 flex flex-col items-center text-center"
      >
        {/* Animated check */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="relative mb-6"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          {[1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-green-300"
              animate={{ scale: [1, 1.6 + i * 0.3], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
        </motion.div>

        <h2 className="font-extrabold text-[26px] text-[#121212] mb-2">
          Delivery Confirmed!
        </h2>
        <p className="text-[14px] text-zinc-500 leading-relaxed mb-6 max-w-[280px]">
          Your payment has been released from escrow. Order <strong>{order.id}</strong> is now complete.
        </p>

        {/* Escrow release summary */}
        <div className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-5 text-left mb-4">
          <p className="font-bold text-[13px] text-zinc-400 uppercase tracking-wide mb-3">
            Escrow Release
          </p>
          {[
            { label: "Supplier payment", value: order.materialCost, color: "#10b981" },
            { label: "Driver payment", value: order.deliveryFee, color: "#3b82f6" },
            { label: "Platform fee", value: order.platformFee, color: "#8b5cf6" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-[13px] text-zinc-500">{label}</span>
              </div>
              <span className="font-bold text-[13px] text-[#121212]">
                {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[12px] text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          Funds released securely via QuarryLink Escrow
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      {/* Header */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
          <Truck className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <p className="font-extrabold text-[16px] text-orange-800">
            Driver has arrived!
          </p>
          <p className="text-[13px] text-orange-600 leading-snug mt-0.5">
            {order.driver?.name} is at your site. Please inspect your delivery before confirming.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── STEP 1: Checklist ── */}
        {step === "checklist" && (
          <motion.div
            key="checklist"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-4"
          >
            {/* Quantity check */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <QuantityCheck
                ordered={order.quantity}
                received={receivedQty}
                onReceivedChange={setReceivedQty}
              />
            </div>

            {/* Quality check */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <p className="font-bold text-[13px] text-[#121212] mb-3">
                Material Quality
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "✓ Acceptable", value: true, bg: "bg-green-50 border-green-200 text-green-700" },
                  { label: "✗ Not Acceptable", value: false, bg: "bg-red-50 border-red-200 text-red-700" },
                ].map(({ label, value, bg }) => (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => setQualityOk(value)}
                    className={cn(
                      "p-3 rounded-xl border-2 font-bold text-[13px] transition-all",
                      qualityOk === value
                        ? bg + " scale-[0.98]"
                        : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {qualityOk === false && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-red-700 leading-snug">
                    You can still confirm delivery and raise a dispute afterwards. Your escrow is protected.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Delivery photos */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-[13px] text-[#121212]">
                  Delivery Photos
                </p>
                <span className="text-[11px] text-zinc-400">
                  Optional · up to 4
                </span>
              </div>
              <PhotoUploadStrip
                photos={photos}
                onAdd={(url) => setPhotos((p) => [...p, url])}
                onRemove={(i) => setPhotos((p) => p.filter((_, j) => j !== i))}
              />
              <p className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Photos are stored as proof in case of a dispute
              </p>
            </div>

            <button
              type="button"
              disabled={!canProceedChecklist}
              onClick={handleProceedToOtp}
              className={cn(
                "w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all duration-200",
                canProceedChecklist
                  ? "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] shadow-[0_4px_14px_rgba(255,193,7,0.35)] hover:scale-[1.01] active:scale-[0.99]"
                  : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              )}
            >
              Continue to Confirmation
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </motion.div>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === "otp" && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-4"
          >
            {/* Info banner */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#ffc107]/15 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#ffc107]" />
                </div>
                <div>
                  <p className="font-bold text-[15px] text-[#121212]">
                    Enter Delivery OTP
                  </p>
                  <p className="text-[13px] text-zinc-500 leading-snug mt-0.5">
                    Ask the driver for the 6-digit code. This confirms delivery and releases payment from escrow.
                  </p>
                </div>
              </div>

              <OtpInput value={otp} onChange={setOtp} hasError={otpError} />

              {/* Error */}
              {(otpError || confirmError) && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-[12px] text-red-700">
                    {confirmError ?? "Please enter the 6-digit code from your driver."}
                  </p>
                </motion.div>
              )}

              {/* 🔌 In production, OTP is sent via SMS/app notification by backend */}
              <p className="mt-3 text-[11px] text-zinc-400 text-center">
                🔌 In production: OTP sent to driver's app · Driver shows it to you
              </p>
            </div>

            {/* Order summary */}
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex items-center gap-3">
              <Package className="w-5 h-5 text-zinc-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[14px] text-[#121212] truncate">{order.material}</p>
                <p className="text-[12px] text-zinc-400">{order.quantity} tons · {order.supplier}</p>
              </div>
              <p className="font-extrabold text-[14px] text-[#121212] shrink-0">
                {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(order.total)}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("checklist")}
                className="h-12 px-5 rounded-xl border-2 border-zinc-200 bg-white text-zinc-600 font-bold text-[14px] flex items-center justify-center hover:border-zinc-300 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  "flex-1 h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all duration-200",
                  canSubmit
                    ? "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] shadow-[0_4px_14px_rgba(255,193,7,0.35)] hover:scale-[1.01] active:scale-[0.99]"
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                )}
              >
                {isConfirming ? (
                  <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Confirming...</>
                ) : (
                  <>Confirm & Release Payment</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
