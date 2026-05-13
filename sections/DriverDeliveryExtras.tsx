"use client";

/**
 * DriverDeliveryExtras
 * ─────────────────────────────────────────────────────────────────
 * Two missing pieces for DriverDashboardShell.tsx:
 *
 *   1. NavigateButton  — "Open in Google Maps" for pickup + delivery
 *   2. ProofOfDelivery — Before/after photo upload on driver side
 *
 * HOW TO USE:
 * Copy this file to sections/DriverDeliveryExtras.tsx
 * Then follow the wiring instructions at the bottom of this file.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation,
  ExternalLink,
  Camera,
  CheckCircle2,
  X,
  Loader2,
  MapPin,
  Upload,
  Trash2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── 1. NavigateButton ─────────────────────────────────────────────
// Drop this wherever the pickup/delivery address is shown.
// It opens Google Maps directions from current location to the address.

interface NavigateButtonProps {
  address: string;
  label?: string; // e.g. "Navigate to Pickup" or "Navigate to Delivery"
  lat?: number;   // optional — if you have coords, use them for precision
  lng?: number;
}

export function NavigateButton({
  address,
  label = "Open in Google Maps",
  lat,
  lng,
}: NavigateButtonProps) {
  const handleNavigate = () => {
    // Use lat/lng if available (more accurate), otherwise use address string
    const destination = lat && lng
      ? `${lat},${lng}`
      : encodeURIComponent(address);

    // Opens Google Maps directions on mobile (app) and desktop (web)
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleNavigate}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-[13px] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_14px_rgba(59,130,246,0.3)]"
    >
      <Navigation className="w-4 h-4" />
      {label}
      <ExternalLink className="w-3 h-3 opacity-60" />
    </button>
  );
}

// ── 2. ProofOfDelivery ────────────────────────────────────────────
// Shown when driver reaches delivery site, before marking complete.
// Captures before-unloading and after-unloading photos.

interface ProofOfDeliveryProps {
  orderId: string;
  onSubmit: (photos: { before: string[]; after: string[] }) => void;
  isSubmitting?: boolean;
}

function PhotoGrid({
  label,
  hint,
  photos,
  onAdd,
  onRemove,
  max,
}: {
  label: string;
  hint: string;
  photos: string[];
  onAdd: (dataUrl: string) => void;
  onRemove: (i: number) => void;
  max: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) onAdd(ev.target.result as string);
      // 🔌 REPLACE WITH CLOUDINARY UPLOAD:
      // const formData = new FormData();
      // formData.append("file", file);
      // formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!);
      // const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload`, {
      //   method: "POST", body: formData,
      // });
      // const data = await res.json();
      // onAdd(data.secure_url);  // store URL, send to backend
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="font-bold text-[13px] text-[#121212]">{label}</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">{hint}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {photos.map((src, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#ffc107]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${label} ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
            >
              <Trash2 className="w-2.5 h-2.5 text-white" />
            </button>
          </div>
        ))}
        {photos.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-300 hover:border-[#ffc107] hover:bg-[#fffdf0] flex flex-col items-center justify-center gap-1 transition-all"
          >
            <Camera className="w-5 h-5 text-zinc-400" />
            <span className="text-[9px] text-zinc-400 font-medium">Add</span>
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

export function ProofOfDelivery({ orderId, onSubmit, isSubmitting }: ProofOfDeliveryProps) {
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos]   = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = beforePhotos.length > 0 && afterPhotos.length > 0;

  const handleSubmit = async () => {
    // 🔌 Photos will be Cloudinary URLs in production.
    // POST /api/orders/:id/proof-of-delivery { beforePhotos: string[], afterPhotos: string[] }
    onSubmit({ before: beforePhotos, after: afterPhotos });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col items-center text-center gap-3"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <p className="font-extrabold text-[16px] text-green-800">Proof Submitted!</p>
          <p className="text-[12px] text-green-600 mt-0.5">
            {beforePhotos.length + afterPhotos.length} photos uploaded for {orderId}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#ffc107]/15 flex items-center justify-center shrink-0">
          <Upload className="w-5 h-5 text-[#ffc107]" />
        </div>
        <div>
          <p className="font-bold text-[15px] text-[#121212]">Proof of Delivery</p>
          <p className="text-[12px] text-zinc-400 leading-snug mt-0.5">
            Required before completing delivery. Photos are saved as evidence.
          </p>
        </div>
      </div>

      <PhotoGrid
        label="Before Unloading"
        hint="Photo of materials on truck before offloading — min 1 required"
        photos={beforePhotos}
        onAdd={url => setBeforePhotos(p => [...p, url])}
        onRemove={i => setBeforePhotos(p => p.filter((_, j) => j !== i))}
        max={3}
      />

      <PhotoGrid
        label="After Unloading"
        hint="Photo of materials at site after offloading — min 1 required"
        photos={afterPhotos}
        onAdd={url => setAfterPhotos(p => [...p, url])}
        onRemove={i => setAfterPhotos(p => p.filter((_, j) => j !== i))}
        max={3}
      />

      <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
        <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        <p className="text-[11px] text-zinc-400">
          Photos are used for dispute resolution if the customer raises an issue.
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className={cn(
          "w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all duration-200",
          canSubmit && !isSubmitting
            ? "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] shadow-[0_4px_14px_rgba(255,193,7,0.35)] hover:scale-[1.01]"
            : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
        )}
      >
        {isSubmitting
          ? <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Uploading...</>
          : !canSubmit
          ? "Add at least 1 photo of each stage"
          : <><CheckCircle2 className="w-4.5 h-4.5" /> Submit Delivery Proof</>
        }
      </button>
    </div>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────
 * HOW TO WIRE INTO DriverDashboardShell.tsx
 * ─────────────────────────────────────────────────────────────────
 *
 * 1. Import at the top:
 *    import { NavigateButton, ProofOfDelivery } from "./DriverDeliveryExtras";
 *
 * 2. In ActiveDeliveryTab, find the route section (pickup/delivery addresses).
 *    After each address <p>, add a NavigateButton:
 *
 *    Pickup address block:
 *    <NavigateButton address={trip.pickupAddress} label="Navigate to Pickup" />
 *
 *    Delivery address block:
 *    <NavigateButton address={trip.deliveryAddress} label="Navigate to Delivery" />
 *
 * 3. In ActiveDeliveryTab, find the status === "in_transit" CTA button
 *    (currently: "Mark as Arrived at Site").
 *    Replace that section with:
 *
 *    {tripStatus === "in_transit" && (
 *      <div className="flex flex-col gap-4">
 *        <ProofOfDelivery
 *          orderId={trip.orderId}
 *          onSubmit={(photos) => {
 *            // store photos, then allow marking arrived
 *            setTripStatus("completed");
 *          }}
 *        />
 *      </div>
 *    )}
 *
 *    This forces the driver to upload photos before marking delivery complete.
 * ─────────────────────────────────────────────────────────────────
 */
