"use client";

/**
 * OrderReceipt
 * ─────────────────────────────────────────────────────────────────────────────
 * A clean, printable receipt shown after order completion.
 * Can be printed to PDF via window.print() or downloaded.
 *
 * 🔌 BACKEND INTEGRATION:
 *   GET /api/orders/:id/receipt  → returns receipt PDF blob
 *   Or use a PDF generation lib (react-pdf, puppeteer) server-side.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useRef } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Printer,
  CheckCircle2,
  ShieldCheck,
  Package,
  MapPin,
  Truck,
  Calendar,
  Hash,
} from "lucide-react";
import { Order } from "@/constants/dashboardConstants";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface OrderReceiptProps {
  order: Order;
  onClose?: () => void;
}

export function OrderReceipt({ order, onClose }: OrderReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    // 🔌 In production: fetch PDF from /api/orders/:id/receipt and trigger download
    window.print();
  };

  const handleDownload = async () => {
    // 🔌 REPLACE WITH:
    // const res = await fetch(`/api/orders/${order.id}/receipt`);
    // const blob = await res.blob();
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement("a");
    // a.href = url; a.download = `QuarryLink-${order.id}.pdf`; a.click();

    // Stub: trigger print dialog as download proxy
    handlePrint();
  };

  const completedDate = new Date(order.createdAt);
  completedDate.setDate(completedDate.getDate() + 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      {/* Action buttons */}
      <div className="flex gap-3 print:hidden">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-zinc-200 bg-white text-zinc-600 font-bold text-[13px] hover:border-zinc-300 hover:bg-zinc-50 transition-all"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-[#121212] text-white font-bold text-[13px] hover:bg-zinc-800 transition-all"
        >
          <Printer className="w-4 h-4" />
          Print Receipt
        </button>
      </div>

      {/* Receipt card */}
      <div
        ref={receiptRef}
        className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden print:shadow-none print:border-none"
      >
        {/* Header stripe */}
        <div className="bg-[#121212] px-6 py-5 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#ffc107]/15 blur-[40px] rounded-full pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-[4px] bg-[#ffc107] flex items-center justify-center">
                  <span className="text-[10px] font-extrabold text-[#121212]">QL</span>
                </div>
                <span className="font-bold text-[15px] text-white">QuarryLink</span>
              </div>
              <p className="text-[11px] text-white/40">Official Delivery Receipt</p>
            </div>
            <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[11px] font-bold text-green-400">Completed</span>
            </div>
          </div>
        </div>

        {/* Order ID + date */}
        <div className="px-6 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Hash className="w-4 h-4 text-zinc-400 shrink-0" />
            <div>
              <p className="font-extrabold text-[17px] text-[#121212]">{order.id}</p>
              <p className="text-[11px] text-zinc-400">Order Reference</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
            <div>
              <p className="font-bold text-[13px] text-[#121212]">
                {formatDateTime(completedDate.toISOString())}
              </p>
              <p className="text-[11px] text-zinc-400">Delivery confirmed</p>
            </div>
          </div>
        </div>

        {/* Material details */}
        <div className="px-6 py-4 border-b border-zinc-100">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide mb-3">
            Order Details
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Package className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[14px] text-[#121212]">{order.material}</p>
                <p className="text-[12px] text-zinc-400">
                  {order.quantity} tons · {order.category}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[14px] text-[#121212]">{order.supplier}</p>
                <p className="text-[12px] text-zinc-400">Verified Supplier</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-[13px] text-zinc-500">{order.deliveryAddress}</p>
            </div>
            {order.driver && (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                  <span className="text-[8px] font-bold text-zinc-500">D</span>
                </div>
                <p className="text-[13px] text-zinc-500">
                  {order.driver.name} · {order.driver.truckPlate}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="px-6 py-4 border-b border-zinc-100">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide mb-3">
            Payment Breakdown
          </p>
          <div className="flex flex-col gap-2.5">
            {[
              {
                label: `${order.quantity} tons × ${formatNaira(Math.round(order.materialCost / order.quantity))}/ton`,
                value: formatNaira(order.materialCost),
              },
              { label: "Delivery fee", value: formatNaira(order.deliveryFee) },
              { label: "Platform fee (2.5%)", value: formatNaira(order.platformFee) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center text-[13px]">
                <span className="text-zinc-500">{label}</span>
                <span className="font-semibold text-[#121212]">{value}</span>
              </div>
            ))}

            {/* Total */}
            <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-zinc-100">
              <span className="font-extrabold text-[15px] text-[#121212]">Total Paid</span>
              <span className="font-extrabold text-[18px] text-[#121212]">
                {formatNaira(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Escrow release confirmation */}
        <div className="px-6 py-4 border-b border-zinc-100">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide mb-3">
            Escrow Release
          </p>
          <div className="flex flex-col gap-2">
            {[
              { label: "Supplier", value: order.materialCost, pct: "~85%" },
              { label: "Driver", value: order.deliveryFee, pct: "~12%" },
              { label: "Platform", value: order.platformFee, pct: "~3%" },
            ].map(({ label, value, pct }) => (
              <div key={label} className="flex items-center gap-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <span className="flex-1 text-[12px] text-zinc-500">{label}</span>
                <span className="text-[12px] text-zinc-400">{pct}</span>
                <span className="font-bold text-[12px] text-[#121212]">
                  {formatNaira(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
            <p className="text-[11px] text-zinc-400 leading-snug">
              Protected by QuarryLink Escrow · NDPR compliant
            </p>
          </div>
          <p className="text-[11px] text-zinc-300">quarrylink.com</p>
        </div>

        {/* Barcode / receipt number strip */}
        <div className="bg-zinc-50 border-t border-zinc-100 px-6 py-3 flex items-center justify-between">
          <div className="flex gap-0.5">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="bg-zinc-300"
                style={{
                  width: i % 3 === 0 ? "3px" : "1.5px",
                  height: "28px",
                  opacity: 0.6 + Math.random() * 0.4,
                }}
              />
            ))}
          </div>
          <p className="text-[10px] text-zinc-400 font-mono ml-3 shrink-0">
            {order.id}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
