"use client";

/**
 * OrderStatusBanner
 * ─────────────────────────────────────────────────────────────────────────────
 * Persistent top-of-dashboard banner that shows the latest active order status.
 * Polls for updates automatically using useOrderRealtime.
 *
 * 🔌 BACKEND: This uses useOrderRealtime which is fully stubbed.
 *    When you connect the backend, the banner updates in real-time automatically.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderStatus, ORDER_STATUS_CONFIG } from "@/constants/dashboardConstants";
import { useOrderRealtime } from "@/hooks/useOrderRealtime";

const STATUS_ICON: Partial<Record<OrderStatus, React.ElementType>> = {
  pending_acceptance: Clock,
  accepted: CheckCircle2,
  ready_for_pickup: Package,
  driver_assigned: Truck,
  in_transit: Truck,
  delivered: CheckCircle2,
  completed: CheckCircle2,
};

interface OrderStatusBannerProps {
  orderId: string;
  onClickTrack: () => void;
}

export function OrderStatusBanner({ orderId, onClickTrack }: OrderStatusBannerProps) {
  const { order } = useOrderRealtime(orderId);
  const [dismissed, setDismissed] = useState(false);

  if (!order || dismissed) return null;

  const statusCfg = ORDER_STATUS_CONFIG[order.status];
  const Icon = STATUS_ICON[order.status] ?? Package;

  const isActive = !["completed", "cancelled"].includes(order.status);
  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl border"
        style={{
          background: statusCfg.bg,
          borderColor: statusCfg.color + "40",
        }}
      >
        {/* Pulse dot */}
        <div className="relative shrink-0">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: statusCfg.color }}
          />
          <motion.div
            animate={{ scale: [1, 2], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{ background: statusCfg.color }}
          />
        </div>

        {/* Status text */}
        <div className="flex-1 min-w-0">
          <p
            className="font-bold text-[13px] truncate"
            style={{ color: statusCfg.color }}
          >
            {order.id} — {statusCfg.label}
          </p>
          <p className="text-[11px] truncate" style={{ color: statusCfg.color + "99" }}>
            {order.material} · {order.quantity} tons
          </p>
        </div>

        {/* Track button */}
        <button
          onClick={onClickTrack}
          className="shrink-0 flex items-center gap-1 font-bold text-[12px] transition-opacity hover:opacity-70"
          style={{ color: statusCfg.color }}
        >
          Track
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 opacity-50 hover:opacity-80 transition-opacity"
          style={{ color: statusCfg.color }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
