"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Upload,
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  FileText,
  User2,
  ScanFace,
  Fingerprint,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ID_TYPES,
  DOC_TYPES,
  LIVENESS_CHALLENGES,
} from "@/constants/kycConstants";
import type { IdType, DocType } from "@/constants/kycConstants";
import type { KycFormState, KycFormActions } from "@/hooks/useKycForm";

type Props = KycFormState & KycFormActions;

const inputBase =
  "w-full h-12 rounded-xl border-2 border-zinc-200 bg-zinc-50 px-4 text-[14px] font-normal text-[#121212] placeholder:text-zinc-400 outline-none transition-all duration-200 focus:border-[#ffc107] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,193,7,0.12)]";

// ─────────────────────────────────────────────────────────────────
// STEP 1 — Identity (NIN / BVN)
// ─────────────────────────────────────────────────────────────────
export function StepIdentity({ idType, idNumber, setIdType, setIdNumber }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
        <Fingerprint className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[13px] text-blue-700 leading-snug">
          Your NIN or BVN is encrypted and used solely for identity
          verification. We never store raw ID numbers on our servers.
        </p>
      </div>

      {/* ID Type selector */}
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-bold text-[#121212]">ID type</label>
        <div className="grid grid-cols-2 gap-3">
          {ID_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setIdType(type.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                idType === type.value
                  ? "border-[#ffc107] bg-[#fffdf0] shadow-[0_0_0_4px_rgba(255,193,7,0.12)]"
                  : "border-zinc-200 bg-zinc-50 hover:border-zinc-300"
              )}
            >
              <span
                className={cn(
                  "font-extrabold text-[22px]",
                  idType === type.value ? "text-[#ffc107]" : "text-zinc-400"
                )}
              >
                {type.value.toUpperCase()}
              </span>
              <span className="text-[11px] font-medium text-zinc-500 text-center leading-tight">
                {type.value === "nin" ? "National ID Number" : "Bank Verification"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ID Number input */}
      <AnimatePresence mode="wait">
        {idType && (
          <motion.div
            key={idType}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2"
          >
            <label className="text-[13px] font-bold text-[#121212]">
              {idType === "nin"
                ? "National Identification Number"
                : "Bank Verification Number"}
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={11}
              value={idNumber}
              onChange={(e) =>
                setIdNumber(e.target.value.replace(/\D/g, "").slice(0, 11))
              }
              placeholder={
                idType === "nin"
                  ? "Enter your 11-digit NIN"
                  : "Enter your 11-digit BVN"
              }
              className={cn(inputBase, "tracking-widest font-mono text-[16px]")}
            />
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-zinc-400">
                {idType === "nin"
                  ? "Dial *346# on any phone to get your NIN"
                  : "Check your banking app or dial *565*0# (GTBank)"}
              </p>
              <span
                className={cn(
                  "text-[12px] font-bold tabular-nums",
                  idNumber.length === 11 ? "text-green-500" : "text-zinc-400"
                )}
              >
                {idNumber.length}/11
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// STEP 2 — Document Upload
// ─────────────────────────────────────────────────────────────────
function DropZone({
  label,
  preview,
  hint,
  onFile,
}: {
  label: string;
  preview: string | null;
  hint?: string;
  onFile: (f: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-bold text-[#121212]">{label}</label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative w-full aspect-video rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-all duration-200",
          preview
            ? "border-[#ffc107] bg-[#fffdf0]"
            : "border-zinc-200 bg-zinc-50 hover:border-[#ffc107] hover:bg-[#fffdf0]"
        )}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Document preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
              <span className="text-[11px] text-white font-medium">
                Click to replace
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
              <Upload className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-[13px] font-semibold text-zinc-600">
              Drop image or click to upload
            </p>
            {hint && (
              <p className="text-[11px] text-zinc-400 text-center">{hint}</p>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </div>
    </div>
  );
}

export function StepDocument({
  docType,
  docFrontPreview,
  docBackPreview,
  setDocType,
  handleDocFront,
  handleDocBack,
}: Props) {
  const needsBack =
    docType === "national_id" || docType === "drivers_licence";

  return (
    <div className="flex flex-col gap-5">
      {/* Doc type */}
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-bold text-[#121212]">
          Document type
        </label>
        <div className="relative">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocType)}
            className={cn(
              inputBase,
              "appearance-none cursor-pointer pr-10",
              docType === "" ? "text-zinc-400" : "text-[#121212]"
            )}
          >
            <option value="" disabled>
              Select document type...
            </option>
            {DOC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon: "💡", tip: "Well lit, no shadows" },
          { icon: "📐", tip: "Full document visible" },
          { icon: "🚫", tip: "No blurry images" },
        ].map(({ icon, tip }) => (
          <div
            key={tip}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-zinc-50 border border-zinc-100"
          >
            <span className="text-[18px]">{icon}</span>
            <span className="text-[11px] text-zinc-500 font-medium leading-tight">
              {tip}
            </span>
          </div>
        ))}
      </div>

      <DropZone
        label="Front side"
        preview={docFrontPreview}
        hint="Clear, complete image of the front"
        onFile={handleDocFront}
      />

      <AnimatePresence>
        {needsBack && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <DropZone
              label="Back side"
              preview={docBackPreview}
              hint="Required for this document type"
              onFile={handleDocBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// STEP 3 — Facial Scan
// ─────────────────────────────────────────────────────────────────
export function StepFacial({
  facialCapture,
  isCameraActive,
  cameraError,
  startCamera,
  stopCamera,
  capturePhoto,
  retakePhoto,
  videoRef,
  canvasRef,
}: Props) {
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="flex flex-col gap-5">
      {/* Instructions */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { emoji: "☀️", text: "Face well-lit" },
          { emoji: "👤", text: "Look straight ahead" },
          { emoji: "🚫", text: "No glasses or hat" },
          { emoji: "📏", text: "Keep arm's length" },
        ].map(({ emoji, text }) => (
          <div
            key={text}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100"
          >
            <span className="text-[16px]">{emoji}</span>
            <span className="text-[12px] text-zinc-600 font-medium">{text}</span>
          </div>
        ))}
      </div>

      {/* Camera viewport */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 flex items-center justify-center">
        {/* Face oval guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-44 h-56 border-2 border-dashed border-[#ffc107]/60 rounded-full" />
        </div>

        {/* Corner brackets */}
        {(
          [
            ["top-4 left-4", "border-t-2 border-l-2"],
            ["top-4 right-4", "border-t-2 border-r-2"],
            ["bottom-4 left-4", "border-b-2 border-l-2"],
            ["bottom-4 right-4", "border-b-2 border-r-2"],
          ] as [string, string][]
        ).map(([pos, border]) => (
          <div
            key={pos}
            className={`absolute ${pos} w-6 h-6 ${border} border-[#ffc107] z-10`}
          />
        ))}

        {/* Video stream */}
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 w-full h-full object-cover scale-x-[-1]",
            (!isCameraActive || facialCapture) && "hidden"
          )}
          muted
          playsInline
        />
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Captured photo */}
        {facialCapture && (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={facialCapture}
              alt="Facial capture"
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Idle state */}
        {!isCameraActive && !facialCapture && (
          <div className="flex flex-col items-center gap-3 text-white/70">
            <ScanFace className="w-14 h-14 text-[#ffc107]" />
            <p className="text-[14px] font-medium text-center max-w-[200px] leading-snug">
              Click below to activate your camera
            </p>
          </div>
        )}

        {/* Camera error */}
        {cameraError && !isCameraActive && !facialCapture && (
          <div className="absolute bottom-3 left-3 right-3 bg-red-600/90 backdrop-blur rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <p className="text-[12px] text-white leading-snug">{cameraError}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!facialCapture ? (
        isCameraActive ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={capturePhoto}
              className="flex-1 h-12 rounded-xl bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(255,193,7,0.35)] transition-all hover:scale-[1.01]"
            >
              <Camera className="w-4.5 h-4.5" />
              Take Photo
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="h-12 px-4 rounded-xl border-2 border-zinc-200 bg-white text-zinc-600 font-bold text-[14px] flex items-center justify-center gap-2 hover:border-zinc-300 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startCamera}
            className="w-full h-12 rounded-xl bg-[#121212] hover:bg-zinc-800 text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <Camera className="w-4.5 h-4.5" />
            Activate Camera
          </button>
        )
      ) : (
        <button
          type="button"
          onClick={retakePhoto}
          className="w-full h-11 rounded-xl border-2 border-zinc-200 bg-white text-zinc-600 font-bold text-[14px] flex items-center justify-center gap-2 hover:border-zinc-300 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Retake Photo
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// STEP 4 — Liveness Check
// ─────────────────────────────────────────────────────────────────
export function StepLiveness({ livenessIndex, livenessComplete, nextLiveness }: Props) {
  const challenge = LIVENESS_CHALLENGES[livenessIndex];
  const progress = livenessComplete
    ? 100
    : (livenessIndex / LIVENESS_CHALLENGES.length) * 100;

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider">
            Progress
          </span>
          <span className="text-[12px] font-bold text-[#ffc107]">
            {livenessComplete
              ? "Complete!"
              : `${livenessIndex} / ${LIVENESS_CHALLENGES.length}`}
          </span>
        </div>
        <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#ffc107] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Challenge display */}
      <AnimatePresence mode="wait">
        {!livenessComplete ? (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-6 py-4"
          >
            {/* Challenge icon */}
            <div className="relative w-44 h-44 rounded-full bg-[#ffc107]/10 border-2 border-dashed border-[#ffc107]/40 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-[#ffc107]/20 flex items-center justify-center">
                <span className="text-[52px]">
                  {challenge.id === "blink"
                    ? "👁️"
                    : challenge.id === "turn_left"
                    ? "⬅️"
                    : challenge.id === "turn_right"
                    ? "➡️"
                    : "😊"}
                </span>
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#ffc107]/60"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                Challenge {livenessIndex + 1} of {LIVENESS_CHALLENGES.length}
              </p>
              <h3 className="font-bold text-[22px] text-[#121212] leading-tight">
                {challenge.instruction}
              </h3>
            </div>

            <button
              type="button"
              onClick={nextLiveness}
              className="w-full h-12 rounded-xl bg-[#121212] hover:bg-zinc-800 text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-4.5 h-4.5" />
              Done — Next
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </motion.div>
            <div className="text-center">
              <h3 className="font-bold text-[22px] text-[#121212] mb-1">
                All done!
              </h3>
              <p className="text-[14px] text-zinc-500">
                Liveness check passed successfully.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step dots */}
      <div className="flex items-center justify-center gap-2">
        {LIVENESS_CHALLENGES.map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              i < livenessIndex || livenessComplete
                ? "bg-[#ffc107]"
                : i === livenessIndex && !livenessComplete
                ? "bg-[#ffc107] scale-125"
                : "bg-zinc-200"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// STEP 5 — Review & Submit
// ─────────────────────────────────────────────────────────────────
export function StepReview({
  idType,
  idNumber,
  docType,
  docFrontPreview,
  facialCapture,
  isLoading,
  handleSubmit,
}: Props) {
  const maskedId =
    idNumber.slice(0, 3) + "•".repeat(5) + idNumber.slice(-3);
  const docLabel =
    DOC_TYPES.find((d) => d.value === docType)?.label ?? docType;
  const idLabel =
    ID_TYPES.find((d) => d.value === idType)?.label ?? idType;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {/* ID row */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
          <div className="w-10 h-10 rounded-lg bg-[#ffc107]/15 flex items-center justify-center shrink-0">
            <Fingerprint className="w-5 h-5 text-[#ffc107]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">
              ID Number
            </p>
            <p className="text-[14px] font-bold text-[#121212]">{idLabel}</p>
            <p className="text-[13px] font-mono text-zinc-500">{maskedId}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
        </div>

        {/* Document row */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
          <div className="w-10 h-10 rounded-lg bg-[#ffc107]/15 flex items-center justify-center shrink-0 overflow-hidden">
            {docFrontPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={docFrontPreview}
                alt="doc"
                className="w-full h-full object-cover"
              />
            ) : (
              <FileText className="w-5 h-5 text-[#ffc107]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">
              Document
            </p>
            <p className="text-[14px] font-bold text-[#121212]">{docLabel}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
        </div>

        {/* Face row */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#ffc107] shrink-0">
            {facialCapture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={facialCapture}
                alt="face"
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full bg-[#ffc107]/15 flex items-center justify-center">
                <User2 className="w-5 h-5 text-[#ffc107]" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">
              Face Scan
            </p>
            <p className="text-[14px] font-bold text-[#121212]">Captured</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
        </div>

        {/* Liveness row */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <ScanFace className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">
              Liveness
            </p>
            <p className="text-[14px] font-bold text-[#121212]">
              Passed — {LIVENESS_CHALLENGES.length} checks
            </p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
        </div>
      </div>

      {/* Consent notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
        <ClipboardCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-amber-800 leading-snug">
          By submitting, you consent to QuarryLink processing your biometric
          and identity data for KYC verification purposes, in compliance with
          the NDPR and CBN regulations.
        </p>
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className={cn(
          "w-full h-12 rounded-xl font-bold text-[15px]",
          "flex items-center justify-center gap-2.5",
          "transition-all duration-200",
          isLoading
            ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
            : "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] shadow-[0_4px_14px_rgba(255,193,7,0.35)] hover:scale-[1.01] active:scale-[0.99]"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4.5 h-4.5 animate-spin" />
            Submitting verification...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4.5 h-4.5" />
            Submit for Verification
          </>
        )}
      </button>
    </div>
  );
}