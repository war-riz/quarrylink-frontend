"use client";

/**
 * DeliveryConfirmationModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Shown when driver marks order as "delivered".
 * Customer must:
 *   1. Verify quantity and quality
 *   2. Upload delivery photos (optional but encouraged)
 *   3. Enter 6-digit OTP (sent by driver / SMS) OR draw digital signature
 *
 * 🔌 BACKEND INTEGRATION:
 *   - OTP is generated server-side when driver clicks "Arrived"
 *   - POST /api/orders/:id/confirm  { otp, deliveryPhotos, notes }
 *   - On success → order.status = "completed", escrow released
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Camera,
  CheckCircle2,
  Package,
  AlertTriangle,
  Loader2,
  Upload,
  Trash2,
  Star,
  ArrowRight,
  Shield,
  Phone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VERIFY_COPY } from "@/constants/verifyConstants";
import { Order } from "@/constants/dashboardConstants";

// ── OTP input sub-component ──────────────────────────────────────
function OtpInput({
  value,
  onChange,
  hasError,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  hasError: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const LENGTH = 6;

  const focusInput = (i: number) => inputsRef.current[i]?.focus();

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < LENGTH - 1) focusInput(i + 1);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (value[i]) {
        const next = [...value];
        next[i] = "";
        onChange(next);
      } else if (i > 0) {
        focusInput(i - 1);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, LENGTH);
    if (!digits) return;
    const next = Array(LENGTH).fill("");
    digits.split("").forEach((d, i) => (next[i] = d));
    onChange(next);
    focusInput(Math.min(digits.length, LENGTH - 1));
  };

  return (
    <div className="flex gap-2.5 justify-center">
      {Array.from({ length: LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "w-11 h-13 text-center text-[20px] font-bold rounded-xl border-2 outline-none transition-all duration-150 bg-zinc-50",
            "focus:bg-white focus:scale-105",
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

// ── Photo upload sub-component ───────────────────────────────────
function PhotoUpload({
  photos,
  onAdd,
  onRemove,
}: {
  photos: string[];
  onAdd: (dataUrl: string) => void;
  onRemove: (i: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-wrap">
        {photos.map((src, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
            >
              <Trash2 className="w-2.5 h-2.5 text-white" />
            </button>
          </div>
        ))}

        {photos.length < 4 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-300 hover:border-[#ffc107] hover:bg-[#fffdf0] flex flex-col items-center justify-center gap-1 transition-all"
          >
            <Camera className="w-5 h-5 text-zinc-400" />
            <span className="text-[10px] text-zinc-400 font-medium">Add photo</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// ── Quantity checklist ───────────────────────────────────────────
interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

// ── Main modal ───────────────────────────────────────────────────

type ConfirmStep = "checklist" | "photos" | "otp" | "success";

interface DeliveryConfirmationModalProps {
  order: Order;
  onClose: () => void;
  onConfirm: (otp: string, photos: string[]) => Promise<void>;
  isConfirming: boolean;
  confirmError: string | null;
  isConfirmed: boolean;
}

export function DeliveryConfirmationModal({
  order,
  onClose,
  onConfirm,
  isConfirming,
  confirmError,
  isConfirmed,
}: DeliveryConfirmationModalProps) {
  const [step, setStep] = useState<ConfirmStep>(isConfirmed ? "success" : "checklist");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueNote, setIssueNote] = useState("");

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "qty", label: `Quantity matches: ${order.quantity} tons delivered`, checked: false },
    { id: "quality", label: "Material quality is acceptable", checked: false },
    { id: "damage", label: "No visible damage to materials", checked: false },
  ]);

  const allChecked = checklist.every((c) => c.checked);
  const otpFull = otp.join("").length === 6;

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  };

  const addPhoto = (dataUrl: string) => setPhotos((p) => [...p, dataUrl]);
  const removePhoto = (i: number) =>
    setPhotos((p) => p.filter((_, idx) => idx !== i));

  const handleConfirm = async () => {
    await onConfirm(otp.join(""), photos);
    setStep("success");
  };

  const stepTitles: Record<ConfirmStep, string> = {
    checklist: "Verify Your Delivery",
    photos: "Delivery Photos",
    otp: "Enter Confirmation Code",
    success: "Delivery Confirmed! 🎉",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step !== "success" ? onClose : undefined}
      />

      <motion.div
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 48 }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        className="relative bg-white w-full sm:max-w-[520px] rounded-t-3xl sm:rounded-2xl max-h-[94vh] overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-zinc-100 px-6 py-4">
          {/* Progress steps */}
          {step !== "success" && (
            <div className="flex items-center gap-1 mb-3">
              {(["checklist", "photos", "otp"] as ConfirmStep[]).map((s, i) => {
                const steps: ConfirmStep[] = ["checklist", "photos", "otp"];
                const currentIdx = steps.indexOf(step);
                const thisIdx = steps.indexOf(s);
                const isDone = thisIdx < currentIdx;
                const isActive = thisIdx === currentIdx;
                return (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shrink-0",
                        isDone
                          ? "bg-[#ffc107] text-[#121212]"
                          : isActive
                          ? "bg-[#121212] text-white"
                          : "bg-zinc-100 text-zinc-400"
                      )}
                    >
                      {isDone ? "✓" : i + 1}
                    </div>
                    {i < 2 && (
                      <div className="flex-1 h-[2px] mx-1 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#ffc107] transition-all duration-500"
                          style={{ width: isDone ? "100%" : "0%" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-extrabold text-[18px] text-[#121212] leading-tight">
                {stepTitles[step]}
              </h3>
              <p className="text-[12px] text-zinc-400 mt-0.5">{order.id}</p>
            </div>
            {step !== "success" && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors ml-3 shrink-0"
              >
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Checklist ─────────────────────────────── */}
            {step === "checklist" && (
              <motion.div
                key="checklist"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-5"
              >
                {/* Order summary */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div className="w-10 h-10 rounded-xl bg-[#ffc107]/20 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-[#ffc107]" />
                  </div>
                  <div>
                    <p className="font-bold text-[14px] text-[#121212]">{order.material}</p>
                    <p className="text-[12px] text-zinc-500">
                      {order.quantity} tons · {order.supplier}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-[13px] text-[#121212] mb-3">
                    Check each item before confirming:
                  </p>
                  <div className="flex flex-col gap-3">
                    {checklist.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleCheck(item.id)}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200",
                          item.checked
                            ? "border-green-400 bg-green-50"
                            : "border-zinc-200 bg-white hover:border-zinc-300"
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-[5px] border-2 flex items-center justify-center shrink-0 transition-all",
                            item.checked
                              ? "bg-green-500 border-green-500"
                              : "border-zinc-300"
                          )}
                        >
                          {item.checked && (
                            <svg
                              width="10" height="10" viewBox="0 0 12 12"
                              fill="none" stroke="white"
                              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            >
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                          )}
                        </div>
                        <span
                          className={cn(
                            "font-medium text-[13px]",
                            item.checked ? "text-green-700" : "text-zinc-600"
                          )}
                        >
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Issue report toggle */}
                <div className="border border-zinc-100 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowIssueForm((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-[13px] text-zinc-600">
                        Report an issue with this delivery
                      </span>
                    </div>
                    {showIssueForm ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                  <AnimatePresence>
                    {showIssueForm && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4">
                          <textarea
                            rows={3}
                            value={issueNote}
                            onChange={(e) => setIssueNote(e.target.value)}
                            placeholder="Describe the issue (e.g. wrong quantity, damaged material)..."
                            className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 p-3 text-[13px] text-[#121212] outline-none focus:border-[#ffc107] resize-none transition-colors"
                          />
                          <p className="text-[11px] text-zinc-400 mt-1">
                            {/* 🔌 Issue note will be sent to POST /api/orders/:id/confirm */}
                            Our team will review this and contact you within 2 hours.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Photos ────────────────────────────────── */}
            {step === "photos" && (
              <motion.div
                key="photos"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-5"
              >
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <Camera className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-blue-700 leading-snug">
                    Take photos of the delivered materials at your site. These are
                    saved with your order and help resolve any future disputes.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-[13px] text-[#121212] mb-3">
                    Add up to 4 photos <span className="text-zinc-400 font-normal">(optional)</span>
                  </p>
                  <PhotoUpload
                    photos={photos}
                    onAdd={addPhoto}
                    onRemove={removePhoto}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-[13px] text-[#121212]">
                    Additional notes <span className="text-zinc-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Materials offloaded at Gate B..."
                    className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 p-3 text-[13px] text-[#121212] outline-none focus:border-[#ffc107] resize-none transition-colors"
                  />
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: OTP ───────────────────────────────────── */}
            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-5"
              >
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[13px] text-amber-800 mb-0.5">
                      Confirm with your driver's code
                    </p>
                    <p className="text-[12px] text-amber-700 leading-snug">
                      {/* 🔌 Driver OTP is generated server-side when they click "Arrived" */}
                      Ask your driver for the 6-digit code shown on their app, or
                      use the code sent to your registered phone number.
                    </p>
                  </div>
                </div>

                {/* OTP */}
                <div className="flex flex-col gap-3">
                  <p className="font-bold text-[13px] text-[#121212] text-center">
                    Enter 6-digit confirmation code
                  </p>
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    hasError={!!confirmError}
                  />
                  {confirmError && (
                    <p className="text-center text-[12px] text-red-500 font-medium">
                      {confirmError}
                    </p>
                  )}
                </div>

                {/* Driver contact */}
                {order.driver && (
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div>
                      <p className="font-bold text-[13px] text-[#121212]">
                        {order.driver.name}
                      </p>
                      <p className="text-[12px] text-zinc-400">{order.driver.phone}</p>
                    </div>
                    <a
                      href={`tel:${order.driver.phone}`}
                      className="flex items-center gap-2 bg-[#ffc107] text-[#121212] font-bold text-[12px] px-3 py-2 rounded-xl hover:bg-[#e0a800] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call Driver
                    </a>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── SUCCESS ───────────────────────────────────────── */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-center py-4 gap-5"
              >
                {/* Animated checkmark */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="relative"
                >
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  {[1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border-2 border-green-300"
                      animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                    />
                  ))}
                </motion.div>

                <div>
                  <h3 className="font-extrabold text-[24px] text-[#121212] mb-2">
                    Delivery Confirmed!
                  </h3>
                  <p className="text-[14px] text-zinc-500 leading-relaxed max-w-[280px]">
                    Payment has been released to {order.supplier} and the driver.
                    Your order is complete.
                  </p>
                </div>

                {/* Escrow release breakdown */}
                <div className="w-full bg-green-50 border border-green-100 rounded-xl p-4 text-left">
                  <p className="font-bold text-[12px] text-green-700 uppercase tracking-wide mb-3">
                    Escrow Released
                  </p>
                  {[
                    { label: "Supplier payment", value: `₦${(order.materialCost / 1000).toFixed(0)}k` },
                    { label: "Driver fee", value: `₦${(order.deliveryFee / 1000).toFixed(0)}k` },
                    { label: "Platform fee", value: `₦${(order.platformFee / 1000).toFixed(0)}k` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-[13px] mb-1.5">
                      <span className="text-green-700">{label}</span>
                      <span className="font-bold text-green-800">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Star rating */}
                <div className="w-full flex flex-col items-center gap-3">
                  <p className="font-bold text-[14px] text-[#121212]">
                    Rate this delivery
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "w-8 h-8 transition-colors",
                            star <= (hoverRating || rating)
                              ? "text-[#ffc107] fill-[#ffc107]"
                              : "text-zinc-300"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-[13px] text-zinc-500">
                      {["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][rating]}
                    </p>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="w-full h-12 bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold rounded-xl transition-all hover:scale-[1.01]"
                >
                  View Order Receipt
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer CTA */}
        {step !== "success" && (
          <div className="sticky bottom-0 bg-white border-t border-zinc-100 px-6 py-4">
            {step === "checklist" && (
              <button
                onClick={() => setStep("photos")}
                disabled={!allChecked}
                className={cn(
                  "w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all",
                  allChecked
                    ? "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] shadow-[0_4px_14px_rgba(255,193,7,0.35)] hover:scale-[1.01]"
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                )}
              >
                {allChecked ? (
                  <>Continue <ArrowRight className="w-4.5 h-4.5" /></>
                ) : (
                  "Check all items above to continue"
                )}
              </button>
            )}

            {step === "photos" && (
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("checklist")}
                  className="h-12 px-5 rounded-xl border-2 border-zinc-200 font-bold text-[14px] text-zinc-600 hover:border-zinc-300 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("otp")}
                  className="flex-1 h-12 rounded-xl bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(255,193,7,0.35)] hover:scale-[1.01] transition-all"
                >
                  {photos.length > 0
                    ? `Continue with ${photos.length} photo${photos.length > 1 ? "s" : ""}`
                    : "Skip Photos"}
                  <ArrowRight className="w-4.5 h-4.5" />
                </button>
              </div>
            )}

            {step === "otp" && (
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("photos")}
                  disabled={isConfirming}
                  className="h-12 px-5 rounded-xl border-2 border-zinc-200 font-bold text-[14px] text-zinc-600 hover:border-zinc-300 transition-all disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!otpFull || isConfirming}
                  className={cn(
                    "flex-1 h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all",
                    otpFull && !isConfirming
                      ? "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] shadow-[0_4px_14px_rgba(255,193,7,0.35)] hover:scale-[1.01]"
                      : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  )}
                >
                  {isConfirming ? (
                    <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Confirming...</>
                  ) : (
                    <>Confirm Delivery</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
