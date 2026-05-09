"use client";

/**
 * TrackingTab — Complete live tracking experience
 * ─────────────────────────────────────────────────────────────────────────────
 * State machine:
 *   active order found
 *     → in_transit:  LiveMap + driver card + ETA
 *     → delivered:   DeliveryConfirmation (OTP + photos + quantity check)
 *     → completed:   RatingFlow → OrderReceipt
 *
 * 🔌 Replace useOrderRealtime interval with WebSocket/SWR
 * 🔌 Replace useMapTracking interval with GPS WebSocket
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation,
  Clock,
  Phone,
  Star,
  MapPin,
  Radio,
  AlertCircle,
  Package,
  Wifi,
  WifiOff,
} from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Order, ORDER_STATUS_CONFIG, ORDER_STEPS } from "@/constants/dashboardConstants";
import { useOrderRealtime } from "@/hooks/useOrderRealtime";
import { useMapTracking } from "@/hooks/useMapTracking";
import { DeliveryConfirmation } from "@/sections/dashboard/DeliveryConfirmation";
import { RatingFlow } from "@/sections/dashboard/RatingFlow";
import { OrderReceipt } from "@/sections/dashboard/OrderReceipt";

// Leaflet must be client-only
const LiveMap = dynamic(
  () => import("@/components/dashboard/LiveMap").then((m) => m.LiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-72 sm:h-96 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          <MapPin className="w-8 h-8" />
          <p className="text-[13px] font-medium">Loading map…</p>
        </div>
      </div>
    ),
  }
);

// ── Helpers ───────────────────────────────────────────────────────

function formatNaira(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);
}

// ── Status timeline ───────────────────────────────────────────────

function StatusTimeline({ status }: { status: string }) {
  const cfg = ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG];
  const currentStep = cfg?.step ?? 0;
  const steps = ORDER_STEPS.filter((s) => s.key !== "completed");

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm px-5 py-4">
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none min-w-0">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300",
                  isDone ? "bg-[#ffc107] text-[#121212]"
                    : isActive ? "bg-[#121212] text-white ring-4 ring-[#121212]/10"
                    : "bg-zinc-100 text-zinc-400"
                )}>
                  {isDone ? "✓" : stepNum}
                </div>
                <span className={cn(
                  "text-[9px] font-medium text-center leading-tight hidden sm:block max-w-[52px]",
                  isActive ? "text-[#121212] font-bold" : isDone ? "text-zinc-400" : "text-zinc-300"
                )}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-1 bg-zinc-100 overflow-hidden rounded-full">
                  <motion.div
                    className="h-full bg-[#ffc107]"
                    initial={{ width: "0%" }}
                    animate={{ width: isDone ? "100%" : "0%" }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Connection badge ──────────────────────────────────────────────

function ConnectionBadge({ isConnected, lastUpdated }: { isConnected: boolean; lastUpdated: Date | null }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 10000);
    return () => clearInterval(t);
  }, []);
  const secs = lastUpdated ? Math.floor((Date.now() - lastUpdated.getTime()) / 1000) : null;

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold",
      isConnected ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
    )}>
      {isConnected ? <><Wifi className="w-3.5 h-3.5" />Live</> : <><WifiOff className="w-3.5 h-3.5" />Offline</>}
      {secs !== null && (
        <span className="font-normal text-[11px] opacity-70">
          · {secs < 10 ? "just now" : `${secs}s`}
        </span>
      )}
    </div>
  );
}

// ── Driver card ───────────────────────────────────────────────────

function DriverCard({ order, eta, distanceKm }: { order: Order; eta: string; distanceKm: number }) {
  if (!order.driver) return null;
  const { driver } = order;
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-[#ffc107]/20 border-2 border-[#ffc107]/40 flex items-center justify-center shrink-0">
          <span className="font-extrabold text-[18px] text-[#ffc107]">
            {driver.name.split(" ").map((n) => n[0]).join("")}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-[17px] text-[#121212]">{driver.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Star className="w-3.5 h-3.5 text-[#ffc107] fill-[#ffc107]" />
            <span className="font-bold text-[13px] text-[#121212]">{driver.rating}</span>
            <span className="text-[12px] text-zinc-400">· {driver.truckPlate}</span>
          </div>
        </div>
        <a
          href={`tel:${driver.phone}`}
          className="w-11 h-11 rounded-xl bg-[#ffc107] flex items-center justify-center shadow-[0_4px_14px_rgba(255,193,7,0.3)] hover:bg-[#e0a800] transition-all active:scale-95"
        >
          <Phone className="w-5 h-5 text-[#121212]" />
        </a>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2.5 p-3 bg-orange-50 border border-orange-100 rounded-xl">
          <Clock className="w-4 h-4 text-orange-500 shrink-0" />
          <div>
            <p className="font-extrabold text-[15px] text-orange-700">{eta}</p>
            <p className="text-[10px] text-orange-500">ETA</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <Navigation className="w-4 h-4 text-blue-500 shrink-0" />
          <div>
            <p className="font-extrabold text-[15px] text-blue-700">{distanceKm} km</p>
            <p className="text-[10px] text-blue-500">Away</p>
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2.5 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
        <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-zinc-500 leading-snug">{order.deliveryAddress}</p>
      </div>
    </div>
  );
}

// ── Arrival checklist ─────────────────────────────────────────────

function ArrivalChecklist() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#ffc107]/10 border border-[#ffc107]/30 rounded-2xl p-5"
    >
      <h3 className="font-bold text-[13px] text-[#121212] mb-3 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-[#ffc107]" />
        Driver is nearly there — prepare your site
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[
          "Ensure site is accessible for the truck",
          "Assign someone to receive delivery",
          "Have your phone ready for OTP",
          "Camera ready for delivery photos",
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-[#ffc107] flex items-center justify-center shrink-0">
              <span className="font-bold text-[9px] text-[#121212]">{i + 1}</span>
            </div>
            <p className="text-[12px] text-zinc-600">{item}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────

type PostDeliveryView = "rating" | "receipt" | null;

interface TrackingTabProps {
  activeOrder: Order | null;
}

export function TrackingTab({ activeOrder: initialActiveOrder }: TrackingTabProps) {
  const orderId = initialActiveOrder?.id ?? null;

  const {
    order,
    isLoading,
    confirmDelivery,
    isConfirmed,
    isConfirming,
    confirmError,
  } = useOrderRealtime(orderId);

  const {
    driverPosition,
    destinationLat,
    destinationLng,
    eta,
    distanceKm,
    isConnected,
    lastUpdated,
  } = useMapTracking(orderId);

  const [postDeliveryView, setPostDeliveryView] = useState<PostDeliveryView>(null);

  useEffect(() => {
    if (isConfirmed && !postDeliveryView) setPostDeliveryView("rating");
  }, [isConfirmed, postDeliveryView]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-10 bg-zinc-100 rounded-xl w-48" />
        <div className="h-72 sm:h-96 bg-zinc-100 rounded-2xl" />
        <div className="h-32 bg-zinc-100 rounded-2xl" />
      </div>
    );
  }

  // No active order
  if (!order && !initialActiveOrder) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-5">
          <Navigation className="w-9 h-9 text-zinc-300" />
        </div>
        <p className="font-bold text-[17px] text-zinc-400">No Active Delivery</p>
        <p className="text-[13px] text-zinc-300 mt-1 max-w-xs">
          Live tracking appears when an order is in transit.
        </p>
      </div>
    );
  }

  const displayOrder = order ?? initialActiveOrder!;
  const status = displayOrder.status;
  const cfg = ORDER_STATUS_CONFIG[status];

  // ── Post-delivery states ──────────────────────────────────────────

  if (postDeliveryView === "rating") {
    return (
      <RatingFlow
        order={displayOrder}
        onDone={() => setPostDeliveryView("receipt")}
      />
    );
  }

  if (postDeliveryView === "receipt") {
    return <OrderReceipt order={displayOrder} onClose={() => setPostDeliveryView(null)} />;
  }

  // ── Delivery confirmation ─────────────────────────────────────────

  if (status === "delivered") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="confirm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="font-bold text-[15px] text-[#121212]">{displayOrder.id}</span>
            <span
              className="text-[13px] font-bold px-3 py-1.5 rounded-full"
              style={{ color: cfg.color, background: cfg.bg }}
            >
              {cfg.label}
            </span>
          </div>
          <DeliveryConfirmation
            order={displayOrder}
            onConfirm={confirmDelivery}
            isConfirming={isConfirming}
            confirmError={confirmError}
            isConfirmed={isConfirmed}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Live tracking ─────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />
          <span className="font-bold text-[15px] text-[#121212] truncate max-w-[200px]">
            {displayOrder.id} · {displayOrder.material}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ConnectionBadge isConnected={isConnected} lastUpdated={lastUpdated} />
          <span
            className="text-[12px] font-bold px-2.5 py-1 rounded-full"
            style={{ color: cfg.color, background: cfg.bg }}
          >
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Status timeline */}
      <StatusTimeline status={status} />

      {/* Live map */}
      <div className="relative">
        <LiveMap
          driverPosition={driverPosition}
          destinationLat={destinationLat}
          destinationLng={destinationLng}
          className="h-72 sm:h-96"
        />
        {driverPosition && (
          <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-3 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="w-4.5 h-4.5 text-orange-500" />
                </div>
                <div>
                  <p className="font-extrabold text-[16px] text-[#121212]">{eta}</p>
                  <p className="text-[11px] text-zinc-400">{distanceKm} km away</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-orange-600">
                <Radio className="w-3.5 h-3.5" />
                Live
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Driver card */}
      {(status === "in_transit" || status === "driver_assigned") && (
        <DriverCard order={displayOrder} eta={eta} distanceKm={distanceKm} />
      )}

      {/* Arrival checklist when close */}
      {status === "in_transit" && distanceKm <= 5 && <ArrivalChecklist />}

      {/* Order summary */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 flex items-center gap-3">
        <Package className="w-5 h-5 text-zinc-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] text-[#121212] truncate">
            {displayOrder.material} · {displayOrder.quantity} tons
          </p>
          <p className="text-[12px] text-zinc-400">{displayOrder.supplier}</p>
        </div>
        <p className="font-extrabold text-[14px] text-[#121212] shrink-0">
          {formatNaira(displayOrder.total)}
        </p>
      </div>

      <p className="text-center text-[11px] text-zinc-300 pb-1">
        🔌 Map and status updates are simulated · Connect WebSocket/REST to go live
      </p>
    </motion.div>
  );
}
