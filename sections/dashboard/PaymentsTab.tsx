"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  ArrowUpRight,
  Wallet,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Order } from "@/constants/dashboardConstants";

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

interface PaymentsTabProps {
  orders: Order[];
}

export function PaymentsTab({ orders }: PaymentsTabProps) {
  const totalSpent = orders.reduce((sum, o) =>
    o.status === "completed" ? sum + o.total : sum, 0);

  const escrowHeld = orders.reduce((sum, o) =>
    !["completed", "cancelled"].includes(o.status) ? sum + o.total : sum, 0);

  const transactions = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((o) => ({
      id:     o.id,
      label:  o.material,
      sub:    `${o.quantity} tons · ${o.supplier}`,
      amount: o.total,
      date:   o.createdAt,
      status: o.status,
      type:   o.status === "completed" ? "paid" : "escrow",
    }));

  return (
    <div className="flex flex-col gap-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Spent",
            value: formatNaira(totalSpent),
            sub: "All completed orders",
            icon: Wallet,
            color: "#10b981",
            bg: "#d1fae5",
          },
          {
            label: "In Escrow",
            value: formatNaira(escrowHeld),
            sub: "Active orders, held safely",
            icon: ShieldCheck,
            color: "#f59e0b",
            bg: "#fef3c7",
          },
          {
            label: "Total Transactions",
            value: orders.length.toString(),
            sub: formatNaira(orders.reduce((s, o) => s + o.total, 0)) + " total",
            icon: CreditCard,
            color: "#3b82f6",
            bg: "#dbeafe",
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: card.bg }}>
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <p className="font-extrabold text-[19px] text-[#121212]">{card.value}</p>
              <p className="font-semibold text-[13px] text-zinc-500 mt-0.5">{card.label}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{card.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Escrow explainer */}
      <div className="bg-[#121212] rounded-2xl p-5 flex items-start gap-4 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#ffc107]/15 blur-[60px] rounded-full pointer-events-none" />
        <div className="w-10 h-10 rounded-xl bg-[#ffc107]/20 flex items-center justify-center shrink-0 z-10">
          <ShieldCheck className="w-5 h-5 text-[#ffc107]" />
        </div>
        <div className="z-10">
          <p className="font-bold text-[14px] text-white mb-1">How QuarryLink Escrow Works</p>
          <p className="text-[12px] text-white/50 leading-relaxed">
            Your payment is held securely when you place an order. Funds are only
            released to the supplier and driver after you confirm delivery.
          </p>
        </div>
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="font-bold text-[15px] text-[#121212]">Transaction History</h3>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CreditCard className="w-10 h-10 text-zinc-200 mb-3" />
            <p className="text-[13px] text-zinc-400 font-medium">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {transactions.map((tx, i) => {
              const isPaid = tx.type === "paid";
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    isPaid ? "bg-green-100" : "bg-amber-100")}>
                    {isPaid
                      ? <ArrowUpRight className="w-5 h-5 text-green-500" />
                      : <ShieldCheck className="w-5 h-5 text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] text-[#121212] truncate">{tx.label}</p>
                    <p className="text-[12px] text-zinc-400">{tx.id} · {formatDate(tx.date)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-[14px] text-[#121212]">{formatNaira(tx.amount)}</p>
                    <span className={cn("text-[11px] font-bold", isPaid ? "text-green-500" : "text-amber-500")}>
                      {isPaid ? "Paid" : "In Escrow"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}