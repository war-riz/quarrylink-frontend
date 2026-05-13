"use client";

/**
 * SupplierOrderActions
 * ─────────────────────────────────────────────────────────────────
 * DROP-IN REPLACEMENT for the order action buttons inside
 * SupplierDashboardShell.tsx → SupplierOrders component.
 *
 * HOW TO USE:
 * 1. Copy this file to sections/SupplierOrderActions.tsx
 * 2. In sections/SupplierDashboardShell.tsx, find the SupplierOrders
 *    function and replace the bottom action area with this component.
 *
 * WHAT IT ADDS:
 *   - "Mark Ready for Pickup" button (accepted → ready state)
 *   - Driver pickup confirmation screen (verify driver identity)
 *
 * 🔌 BACKEND:
 *   Mark Ready  → POST /api/orders/:id/ready   (triggers driver broadcast)
 *   Confirm Driver → POST /api/orders/:id/confirm-pickup { driverId }
 * ─────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Truck,
  ShieldCheck,
  X,
  Loader2,
  AlertCircle,
  Phone,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────

export type SupplierOrderStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "dispatched"
  | "delivered"
  | "completed"
  | "rejected";

export interface SupplierOrderForActions {
  id: string;
  material: string;
  quantity: number;
  status: SupplierOrderStatus;
}

// Mock driver info — 🔌 comes from backend when driver accepts the job
const MOCK_ARRIVING_DRIVER = {
  id: "drv_001",
  name: "Emeka Okafor",
  phone: "+234 812 345 6789",
  truckPlate: "LND 742 MU",
  rating: 4.7,
  photo: "", // initials fallback
};

// ── Mark Ready Modal ──────────────────────────────────────────────

function MarkReadyModal({
  order,
  onClose,
  onConfirm,
}: {
  order: SupplierOrderForActions;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    // 🔌 REPLACE WITH:
    // await fetch(`/api/orders/${order.id}/ready`, { method: "POST" });
    // This triggers backend to broadcast the job to available drivers.
    await new Promise(r => setTimeout(r, 1200));
    setIsLoading(false);
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-[420px] overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-extrabold text-[17px] text-[#121212]">Mark Ready for Pickup</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Order summary */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
            <div className="w-10 h-10 rounded-xl bg-[#ffc107]/20 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-[#ffc107]" />
            </div>
            <div>
              <p className="font-bold text-[14px] text-[#121212]">{order.material}</p>
              <p className="text-[12px] text-zinc-400">{order.quantity} tons · {order.id}</p>
            </div>
          </div>

          {/* What happens next */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <Truck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-blue-700 leading-snug">
              Confirming materials are loaded and ready will broadcast this job
              to all available drivers. The first driver to accept will be assigned.
            </p>
          </div>

          {/* Checklist */}
          <div className="flex flex-col gap-2">
            {[
              "Materials are fully loaded onto the truck area",
              "Quantity matches the order specification",
              "Materials are accessible for driver pickup",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-[13px] text-zinc-600">{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all duration-200",
              !isLoading
                ? "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] shadow-[0_4px_14px_rgba(255,193,7,0.35)] hover:scale-[1.01]"
                : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
            )}
          >
            {isLoading
              ? <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Broadcasting to drivers...</>
              : <><Truck className="w-4.5 h-4.5" /> Mark Ready — Broadcast Job</>
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Driver Pickup Confirmation Modal ──────────────────────────────

function DriverPickupModal({
  order,
  onClose,
  onConfirm,
}: {
  order: SupplierOrderForActions;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const driver = MOCK_ARRIVING_DRIVER;

  // 🔌 In production: driver info comes from
  // GET /api/orders/:id/assigned-driver
  // Returns: { id, name, phone, truckPlate, rating, photoUrl }

  const handleConfirmPickup = async () => {
    setIsLoading(true);
    // 🔌 REPLACE WITH:
    // await fetch(`/api/orders/${order.id}/confirm-pickup`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ driverId: driver.id }),
    // });
    await new Promise(r => setTimeout(r, 1500));
    setIsLoading(false);
    setConfirmed(true);
  };

  const handleDone = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!confirmed ? onClose : undefined} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-[420px] overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-extrabold text-[17px] text-[#121212]">Driver Pickup Confirmation</h3>
          {!confirmed && (
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          )}
        </div>

        <div className="p-6 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {!confirmed ? (
              <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-4">

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-amber-700 leading-snug">
                    A driver has arrived for this order. Verify their identity
                    before releasing the materials.
                  </p>
                </div>

                {/* Driver details */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div className="w-14 h-14 rounded-full bg-[#ffc107]/20 border-2 border-[#ffc107]/40 flex items-center justify-center shrink-0">
                    <span className="font-extrabold text-[18px] text-[#ffc107]">
                      {driver.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[15px] text-[#121212]">{driver.name}</p>
                    <p className="text-[12px] text-zinc-500">
                      ⭐ {driver.rating} · {driver.truckPlate}
                    </p>
                    <p className="text-[12px] text-zinc-400">{driver.phone}</p>
                  </div>
                  <a href={`tel:${driver.phone}`}
                    className="w-10 h-10 rounded-xl bg-[#ffc107] flex items-center justify-center hover:bg-[#e0a800] transition-all">
                    <Phone className="w-4.5 h-4.5 text-[#121212]" />
                  </a>
                </div>

                {/* Verification checklist */}
                <div className="flex flex-col gap-2">
                  <p className="font-bold text-[13px] text-[#121212]">Before releasing materials, confirm:</p>
                  {[
                    `Driver name matches: ${driver.name}`,
                    `Truck plate matches: ${driver.truckPlate}`,
                    "Driver has shown valid QuarryLink driver ID",
                    "Truck is suitable for the load",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                      <ShieldCheck className="w-4 h-4 text-zinc-300 shrink-0" />
                      <span className="text-[12px] text-zinc-600">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Order info */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <Package className="w-4 h-4 text-zinc-400 shrink-0" />
                  <p className="text-[12px] text-zinc-500">
                    {order.material} · {order.quantity} tons · {order.id}
                  </p>
                </div>

                <button
                  onClick={handleConfirmPickup}
                  disabled={isLoading}
                  className={cn(
                    "w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all",
                    !isLoading
                      ? "bg-green-500 hover:bg-green-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:scale-[1.01]"
                      : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                  )}
                >
                  {isLoading
                    ? <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Confirming...</>
                    : <><CheckCircle2 className="w-4.5 h-4.5" /> Confirm Driver & Release Materials</>
                  }
                </button>
              </motion.div>
            ) : (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-4 gap-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </motion.div>
                <div>
                  <h3 className="font-extrabold text-[20px] text-[#121212] mb-1">Pickup Confirmed!</h3>
                  <p className="text-[13px] text-zinc-500 leading-relaxed max-w-[260px]">
                    {driver.name} has been confirmed and materials are en route to the customer.
                  </p>
                </div>
                <div className="w-full p-3 rounded-xl bg-blue-50 border border-blue-100 text-[12px] text-blue-700 text-center">
                  Order status updated to <strong>In Transit</strong> · Customer notified automatically
                </div>
                <button onClick={handleDone}
                  className="w-full h-11 bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold rounded-xl transition-all">
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ── SupplierOrderActionsBar ───────────────────────────────────────
// This is the component you drop into SupplierDashboardShell.tsx
// inside the SupplierOrders list, replacing the plain "View" button
// with status-aware actions.

interface SupplierOrderActionsBarProps {
  order: SupplierOrderForActions;
  onStatusChange: (id: string, newStatus: SupplierOrderStatus) => void;
}

export function SupplierOrderActionsBar({ order, onStatusChange }: SupplierOrderActionsBarProps) {
  const [showMarkReady, setShowMarkReady] = useState(false);
  const [showPickupConfirm, setShowPickupConfirm] = useState(false);

  return (
    <>
      <div className="flex gap-2 shrink-0">
        {/* Mark Ready — shown when order is accepted */}
        {order.status === "accepted" && (
          <button
            onClick={() => setShowMarkReady(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-[12px] transition-all"
          >
            <Package className="w-3.5 h-3.5" />
            Mark Ready
          </button>
        )}

        {/* Confirm Driver Pickup — shown when order is ready and driver is assigned */}
        {order.status === "ready" && (
          <button
            onClick={() => setShowPickupConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold text-[12px] transition-all"
          >
            <Truck className="w-3.5 h-3.5" />
            Verify Driver
          </button>
        )}
      </div>

      <AnimatePresence>
        {showMarkReady && (
          <MarkReadyModal
            order={order}
            onClose={() => setShowMarkReady(false)}
            onConfirm={() => onStatusChange(order.id, "ready")}
          />
        )}
        {showPickupConfirm && (
          <DriverPickupModal
            order={order}
            onClose={() => setShowPickupConfirm(false)}
            onConfirm={() => onStatusChange(order.id, "dispatched")}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────
 * HOW TO WIRE INTO SupplierDashboardShell.tsx
 * ─────────────────────────────────────────────────────────────────
 *
 * 1. Import at the top:
 *    import { SupplierOrderActionsBar } from "./SupplierOrderActions";
 *
 * 2. In SupplierOrders(), change orders state to use SupplierOrderStatus:
 *    const [orders, setOrders] = useState(MOCK_SUPPLIER_ORDERS);
 *
 * 3. Add a handler:
 *    const handleStatusChange = (id: string, newStatus: SupplierOrderStatus) => {
 *      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
 *    };
 *
 * 4. In the order card JSX, replace:
 *    <button onClick={() => setSelectedOrder(order)} ...>View</button>
 *
 *    With:
 *    <div className="flex items-center gap-2 shrink-0">
 *      <SupplierOrderActionsBar
 *        order={order}
 *        onStatusChange={handleStatusChange}
 *      />
 *      <button onClick={() => setSelectedOrder(order)} ...>View</button>
 *    </div>
 * ─────────────────────────────────────────────────────────────────
 */
