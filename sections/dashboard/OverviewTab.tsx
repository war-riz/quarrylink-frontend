"use client";

import { motion } from "framer-motion";
import {
  Package,
  Wallet,
  Clock,
  ArrowRight,
  MapPin,
  ChevronRight,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_CONFIG,
  Order,
  DashboardTab,
} from "@/constants/dashboardConstants";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
  });
}

interface OverviewTabProps {
  setActiveTab: (tab: DashboardTab) => void;
  setSelectedOrder: (order: Order) => void;
  // real data passed down from useDashboard
  stats: {
    totalOrders: number;
    activeOrders: number;
    totalSpent: number;
    savedAmount: number;
    pendingDeliveries: number;
    completedOrders: number;
  };
  orders: Order[];
  activeOrder: Order | null;
}

export function OverviewTab({
  setActiveTab,
  setSelectedOrder,
  stats,
  orders,
  activeOrder,
}: OverviewTabProps) {
  const { displayName } = useCurrentUser();
  const recentOrders = orders.slice(0, 4);

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      sub: `${stats.activeOrders} active`,
      icon: Package,
      accent: "#3b82f6",
      bg: "#dbeafe",
    },
    {
      label: "Total Spent",
      value: formatNaira(stats.totalSpent),
      sub: "All time",
      icon: Wallet,
      accent: "#10b981",
      bg: "#d1fae5",
    },
    {
      label: "Completed",
      value: stats.completedOrders.toString(),
      sub: "Successfully delivered",
      icon: CheckCircle2,
      accent: "#ffc107",
      bg: "#fef9c3",
    },
    {
      label: "Pending",
      value: stats.pendingDeliveries.toString(),
      sub: "Awaiting delivery",
      icon: Clock,
      accent: "#f97316",
      bg: "#ffedd5",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#121212] rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
      >
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#ffc107]/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="z-10">
          <p className="text-[12px] font-bold text-[#ffc107] uppercase tracking-wider mb-1">
            Welcome back 👋
          </p>
          <h2 className="font-extrabold text-[22px] text-white leading-tight">
            {displayName || "—"}
          </h2>
          <p className="text-[13px] text-white/50 mt-0.5">
            Verified Customer
          </p>
        </div>
        <button
          onClick={() => setActiveTab("browse")}
          className="z-10 shrink-0 flex items-center gap-2 bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold text-[14px] px-5 py-2.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.99]"
        >
          Order Materials
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: card.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: card.accent }} />
                </div>
              </div>
              <p className="font-extrabold text-[20px] lg:text-[22px] text-[#121212] leading-tight">
                {card.value}
              </p>
              <p className="font-semibold text-[13px] text-zinc-500 mt-0.5">
                {card.label}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">{card.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Active order tracker */}
      {activeOrder && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <h3 className="font-bold text-[15px] text-[#121212]">
                Live Order — {activeOrder.id}
              </h3>
            </div>
            <button
              onClick={() => {
                setSelectedOrder(activeOrder);
                setActiveTab("tracking");
              }}
              className="text-[12px] font-bold text-[#ffc107] flex items-center gap-1 hover:gap-2 transition-all"
            >
              Track Live <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
              <div className="flex-1">
                <p className="font-bold text-[16px] text-[#121212]">
                  {activeOrder.material}
                </p>
                <p className="text-[13px] text-zinc-500">
                  {activeOrder.quantity} tons · {activeOrder.supplier}
                </p>
              </div>
              {activeOrder.driver && (
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
                  <Truck className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="font-bold text-[13px] text-orange-700">
                      {activeOrder.driver.name}
                    </p>
                    <p className="text-[11px] text-orange-500">
                      {activeOrder.eta ? `ETA: ${activeOrder.eta} · ` : ""}{activeOrder.driver.truckPlate}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress steps */}
            <div className="flex items-center gap-1">
              {["Placed", "Accepted", "In Preparation", "In Transit", "Delivered"].map(
                (step, i) => {
                  const stepNum = i + 1;
                  const currentStep = ORDER_STATUS_CONFIG[activeOrder.status]?.step ?? 1;
                  const isDone = stepNum < currentStep;
                  const isActive = stepNum === currentStep;
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                            isDone
                              ? "bg-[#ffc107] text-[#121212]"
                              : isActive
                              ? "bg-orange-500 text-white"
                              : "bg-zinc-100 text-zinc-400"
                          )}
                        >
                          {isDone ? "✓" : stepNum}
                        </div>
                        <span className="text-[9px] text-zinc-400 text-center leading-tight hidden sm:block max-w-[60px]">
                          {step}
                        </span>
                      </div>
                      {i < 4 && (
                        <div className="flex-1 h-[2px] mx-1 bg-zinc-100 overflow-hidden rounded-full">
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              isDone ? "bg-[#ffc107] w-full" : "w-0"
                            )}
                          />
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>

            <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
              <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-[12px] text-zinc-500 leading-snug">
                {activeOrder.deliveryAddress}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent orders */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white rounded-2xl border border-zinc-100 shadow-sm"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h3 className="font-bold text-[15px] text-[#121212]">Recent Orders</h3>
          <button
            onClick={() => setActiveTab("orders")}
            className="text-[12px] font-bold text-[#ffc107] flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Package className="w-10 h-10 text-zinc-200 mb-3" />
            <p className="text-[13px] text-zinc-400 font-medium">No orders yet</p>
            <button
              onClick={() => setActiveTab("browse")}
              className="mt-3 text-[13px] font-bold text-[#ffc107] hover:underline"
            >
              Browse materials →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {recentOrders.map((order) => {
              const statusCfg = ORDER_STATUS_CONFIG[order.status];
              return (
                <button
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setActiveTab("orders");
                  }}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-zinc-50/80 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[13px] text-[#121212] truncate">
                      {order.material}
                    </p>
                    <p className="text-[12px] text-zinc-400">
                      {order.id} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[13px] text-[#121212]">
                      {formatNaira(order.total)}
                    </p>
                    <span
                      className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: statusCfg.color, background: statusCfg.bg }}
                    >
                      {statusCfg.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}