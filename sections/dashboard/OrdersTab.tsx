"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  MapPin,
  ChevronRight,
  X,
  Truck,
  CheckCircle2,
  Phone,
  Star,
  Clock,
  ShieldCheck,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Order,
  ORDER_STATUS_CONFIG,
  ORDER_STEPS,
} from "@/constants/dashboardConstants";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Order detail panel ───────────────────────────────────────────

function OrderDetail({
  order,
  onBack,
}: {
  order: Order;
  onBack: () => void;
}) {
  const statusCfg = ORDER_STATUS_CONFIG[order.status];
  const currentStep = statusCfg.step;

  const materialCost = order.materialCost;
  const deliveryFee = order.deliveryFee;
  const platformFee = order.platformFee;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-5"
    >
      {/* Back btn */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[13px] font-bold text-zinc-500 hover:text-[#121212] transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              {order.id}
            </p>
            <h2 className="font-extrabold text-[20px] text-[#121212]">
              {order.material}
            </h2>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              {order.quantity} tons · {order.supplier}
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold shrink-0"
            style={{ color: statusCfg.color, background: statusCfg.bg }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.color }} />
            {statusCfg.label}
          </span>
        </div>

        {/* Timeline */}
        <div className="flex flex-col gap-0">
          {ORDER_STEPS.map((step, i) => {
            const stepNum = i + 1;
            const isDone = stepNum < currentStep;
            const isActive = stepNum === currentStep;
            const isFuture = stepNum > currentStep;

            if (order.status === "cancelled") return null;

            return (
              <div key={step.key} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 z-10",
                      isDone
                        ? "bg-[#ffc107] text-[#121212]"
                        : isActive
                        ? "bg-[#121212] text-white ring-4 ring-[#121212]/10"
                        : "bg-zinc-100 text-zinc-400"
                    )}
                  >
                    {isDone ? "✓" : stepNum}
                  </div>
                  {i < ORDER_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 h-6 my-1",
                        isDone ? "bg-[#ffc107]" : "bg-zinc-100"
                      )}
                    />
                  )}
                </div>
                <div className="pb-1 pt-1">
                  <p
                    className={cn(
                      "font-semibold text-[13px]",
                      isActive ? "text-[#121212]" : isFuture ? "text-zinc-300" : "text-zinc-500"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver card (if assigned) */}
      {order.driver && (
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
          <h3 className="font-bold text-[14px] text-zinc-400 uppercase tracking-wide mb-4">
            Your Driver
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ffc107]/20 border-2 border-[#ffc107]/40 flex items-center justify-center shrink-0">
              <span className="font-bold text-[16px] text-[#ffc107]">
                {order.driver.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-[15px] text-[#121212]">
                {order.driver.name}
              </p>
              <div className="flex items-center gap-1.5">
                <Star className="w-3 h-3 text-[#ffc107] fill-[#ffc107]" />
                <span className="text-[12px] text-zinc-500">
                  {order.driver.rating} · {order.driver.truckPlate}
                </span>
              </div>
            </div>
            <a
              href={`tel:${order.driver.phone}`}
              className="w-10 h-10 rounded-xl bg-[#ffc107]/10 border border-[#ffc107]/20 flex items-center justify-center hover:bg-[#ffc107]/20 transition-colors"
            >
              <Phone className="w-4 h-4 text-[#ffc107]" />
            </a>
          </div>
          {order.eta && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-orange-50 border border-orange-100 rounded-xl">
              <Clock className="w-4 h-4 text-orange-500 shrink-0" />
              <p className="text-[13px] text-orange-700 font-medium">
                Estimated arrival: <strong>{order.eta}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Delivery address */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
        <h3 className="font-bold text-[14px] text-zinc-400 uppercase tracking-wide mb-3">
          Delivery Address
        </h3>
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <p className="text-[14px] text-[#121212]">{order.deliveryAddress}</p>
        </div>
      </div>

      {/* Payment breakdown */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
        <h3 className="font-bold text-[14px] text-zinc-400 uppercase tracking-wide mb-4">
          Payment Details
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { label: "Material cost", value: formatNaira(materialCost) },
            { label: "Delivery fee", value: formatNaira(deliveryFee) },
            { label: "Platform fee", value: formatNaira(platformFee) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-[13px]">
              <span className="text-zinc-500">{label}</span>
              <span className="font-semibold text-[#121212]">{value}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 border-t border-zinc-100 font-bold text-[15px]">
            <span>Total</span>
            <span>{formatNaira(order.total)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
          <p className="text-[12px] text-green-700">
            {order.status === "completed"
              ? "Payment released to supplier and driver."
              : "Funds are secured in escrow until delivery."}
          </p>
        </div>
      </div>

      {/* Ordered at */}
      <p className="text-center text-[12px] text-zinc-400">
        Placed on {formatDate(order.createdAt)}
      </p>
    </motion.div>
  );
}

// ── Orders Tab ────────────────────────────────────────────────────

type FilterStatus = "all" | "active" | "completed" | "cancelled";

interface OrdersTabProps {
  orders: Order[];
  selectedOrder: Order | null;
  setSelectedOrder: (o: Order | null) => void;
}

export function OrdersTab({ orders, selectedOrder, setSelectedOrder }: OrdersTabProps) {
  const [filter, setFilter] = useState<FilterStatus>("all");

  const filtered = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "active")
      return !["completed", "cancelled"].includes(o.status);
    if (filter === "completed") return o.status === "completed";
    if (filter === "cancelled") return o.status === "cancelled";
    return true;
  });

  if (selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "active", "completed", "cancelled"] as FilterStatus[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-xl font-semibold text-[13px] capitalize transition-all",
              filter === f
                ? "bg-[#121212] text-white"
                : "bg-white border-2 border-zinc-200 text-zinc-500 hover:border-zinc-300"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-12 h-12 text-zinc-200 mb-4" />
          <p className="font-bold text-[15px] text-zinc-400">No orders found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => {
            const statusCfg = ORDER_STATUS_CONFIG[order.status];
            return (
              <motion.button
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-bold text-[15px] text-[#121212] truncate">
                      {order.material}
                    </p>
                    <span
                      className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ color: statusCfg.color, background: statusCfg.bg }}
                    >
                      {statusCfg.label}
                    </span>
                  </div>
                  <p className="text-[12px] text-zinc-400 mb-2">
                    {order.id} · {order.quantity} tons · {order.supplier}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[14px] text-[#121212]">
                      {formatNaira(order.total)}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0 mt-3" />
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
