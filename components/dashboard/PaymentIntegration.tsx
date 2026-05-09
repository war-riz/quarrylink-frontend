"use client";

/**
 * PaymentIntegration
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles payment initiation for two Nigerian payment gateways.
 * Both are stubbed — replace the 🔌 sections when backend is ready.
 *
 * INSTALL when ready:
 *   npm install @paystack/inline-js
 *   npm install flutterwave-react-v3
 *
 * ENV VARS needed:
 *   NEXT_PUBLIC_PAYSTACK_KEY=pk_live_...
 *   NEXT_PUBLIC_FLUTTERWAVE_KEY=FLWPUBK_...
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  ArrowRight,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────

export type PaymentProvider = "paystack" | "flutterwave" | "bank_transfer";

export interface PaymentConfig {
  orderId: string;
  amount: number; // in kobo for Paystack, naira for Flutterwave
  email: string;
  name: string;
  phone: string;
  meta?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  reference?: string;
  transactionId?: string;
  provider: PaymentProvider;
  error?: string;
}

// ── Hook ──────────────────────────────────────────────────────────

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initiatePaystack = useCallback(
    async (config: PaymentConfig): Promise<PaymentResult> => {
      // 🔌 REPLACE WITH REAL PAYSTACK:
      //
      // Step 1 — Create payment on your backend:
      //   const { reference, authUrl } = await fetch("/api/payments/init", {
      //     method: "POST",
      //     body: JSON.stringify({ orderId: config.orderId, amount: config.amount }),
      //   }).then(r => r.json());
      //
      // Step 2 — Open Paystack inline:
      //   const handler = window.PaystackPop.setup({
      //     key: process.env.NEXT_PUBLIC_PAYSTACK_KEY!,
      //     email: config.email,
      //     amount: config.amount * 100, // kobo
      //     currency: "NGN",
      //     ref: reference,
      //     metadata: { orderId: config.orderId, ...config.meta },
      //     callback: (response) => {
      //       // Verify on backend: POST /api/payments/verify { reference }
      //       resolve({ success: true, reference: response.reference, provider: "paystack" });
      //     },
      //     onClose: () => resolve({ success: false, provider: "paystack" }),
      //   });
      //   handler.openIframe();

      // STUB
      await new Promise((r) => setTimeout(r, 2500));
      const ref = `PSK-${Date.now()}`;
      return { success: true, reference: ref, provider: "paystack" };
    },
    []
  );

  const initiateFlutterwave = useCallback(
    async (config: PaymentConfig): Promise<PaymentResult> => {
      // 🔌 REPLACE WITH REAL FLUTTERWAVE:
      //
      // import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
      //
      // const flwConfig = {
      //   public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_KEY!,
      //   tx_ref: `QL-${config.orderId}-${Date.now()}`,
      //   amount: config.amount,
      //   currency: "NGN",
      //   payment_options: "card,banktransfer,ussd",
      //   customer: { email: config.email, name: config.name, phone_number: config.phone },
      //   customizations: {
      //     title: "QuarryLink",
      //     description: `Payment for order ${config.orderId}`,
      //     logo: "/images/logo.png",
      //   },
      // };
      //
      // const handleFlutterPayment = useFlutterwave(flwConfig);
      // handleFlutterPayment({
      //   callback: (response) => {
      //     closePaymentModal();
      //     resolve({ success: true, transactionId: response.transaction_id, provider: "flutterwave" });
      //   },
      //   onClose: () => resolve({ success: false, provider: "flutterwave" }),
      // });

      await new Promise((r) => setTimeout(r, 2500));
      const txId = `FLW-${Date.now()}`;
      return { success: true, transactionId: txId, provider: "flutterwave" };
    },
    []
  );

  const pay = useCallback(
    async (provider: PaymentProvider, config: PaymentConfig) => {
      setIsProcessing(true);
      setError(null);
      setResult(null);
      try {
        let res: PaymentResult;
        if (provider === "paystack") {
          res = await initiatePaystack(config);
        } else if (provider === "flutterwave") {
          res = await initiateFlutterwave(config);
        } else {
          // Bank transfer — just record intent, backend sends account details
          // 🔌 POST /api/payments/bank-transfer-init
          await new Promise((r) => setTimeout(r, 1000));
          res = { success: true, reference: `BNK-${Date.now()}`, provider: "bank_transfer" };
        }
        setResult(res);
        return res;
      } catch (e: any) {
        const errMsg = e?.message ?? "Payment failed. Please try again.";
        setError(errMsg);
        return { success: false, provider, error: errMsg };
      } finally {
        setIsProcessing(false);
      }
    },
    [initiatePaystack, initiateFlutterwave]
  );

  return { pay, isProcessing, result, error, reset: () => { setResult(null); setError(null); } };
}

// ── Payment selector UI ────────────────────────────────────────────

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface PaymentSelectorProps {
  amount: number;
  orderId: string;
  onSuccess: (result: PaymentResult) => void;
  onCancel: () => void;
}

export function PaymentSelector({
  amount,
  orderId,
  onSuccess,
  onCancel,
}: PaymentSelectorProps) {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [bankDetails, setBankDetails] = useState<{
    accountName: string;
    accountNumber: string;
    bankName: string;
  } | null>(null);

  const { pay, isProcessing, result, error } = usePayment();

  const handlePay = async () => {
    if (!selectedProvider) return;

    const config: PaymentConfig = {
      orderId,
      amount,
      email: "adebayo@skylineconstruction.ng",
      name: "Adebayo Okonkwo",
      phone: "+234 802 345 6789",
      meta: { orderType: "quarry_materials" },
    };

    const res = await pay(selectedProvider, config);

    if (res.success) {
      if (selectedProvider === "bank_transfer") {
        // 🔌 In production, backend returns dynamic virtual account
        setBankDetails({
          bankName: "Wema Bank (QuarryLink Escrow)",
          accountName: "QuarryLink Escrow — QL-2024-0089",
          accountNumber: "0123456789",
        });
      } else {
        onSuccess(res);
      }
    }
  };

  // Bank transfer details shown after selection
  if (bankDetails) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Landmark className="w-5 h-5 text-[#3b82f6]" />
            <h3 className="font-bold text-[15px] text-[#121212]">
              Bank Transfer Details
            </h3>
          </div>
          <p className="text-[13px] text-zinc-500 mb-4">
            Transfer the exact amount below within <strong>30 minutes</strong> to this account:
          </p>
          {[
            { label: "Bank", value: bankDetails.bankName },
            { label: "Account Name", value: bankDetails.accountName },
            { label: "Account Number", value: bankDetails.accountNumber },
            { label: "Amount", value: formatNaira(amount) },
            { label: "Reference", value: orderId },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2.5 border-b border-zinc-100 last:border-none">
              <span className="text-[12px] text-zinc-400">{label}</span>
              <span className={cn(
                "font-bold text-[13px] text-[#121212]",
                label === "Amount" && "text-[#ffc107]",
                label === "Account Number" && "font-mono tracking-wider"
              )}>{value}</span>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-700 leading-snug">
            🔌 In production: We'll verify your transfer automatically and notify you. Your order activates immediately.
          </p>
        </div>
        <button
          onClick={() => onSuccess(result!)}
          className="w-full h-12 bg-[#121212] text-white font-bold rounded-xl hover:bg-zinc-800 transition-all"
        >
          I've Made the Transfer
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      {/* Escrow explainer */}
      <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
        <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
        <p className="text-[13px] text-green-700 leading-snug">
          <strong>100% Protected.</strong> Your payment goes to escrow and is only released after you confirm delivery.
        </p>
      </div>

      {/* Amount */}
      <div className="text-center py-2">
        <p className="text-[13px] text-zinc-400">Total to pay</p>
        <p className="font-extrabold text-[32px] text-[#121212]">
          {formatNaira(amount)}
        </p>
        <p className="text-[12px] text-zinc-400">Order {orderId}</p>
      </div>

      {/* Provider options */}
      <div className="flex flex-col gap-3">
        {[
          {
            id: "paystack" as PaymentProvider,
            label: "Pay with Paystack",
            sub: "Cards, USSD, bank, mobile money",
            color: "#00C3F7",
            icon: "💳",
          },
          {
            id: "flutterwave" as PaymentProvider,
            label: "Pay with Flutterwave",
            sub: "Cards, bank transfer, USSD, Mpesa",
            color: "#F5A623",
            icon: "⚡",
          },
          {
            id: "bank_transfer" as PaymentProvider,
            label: "Direct Bank Transfer",
            sub: "Transfer to dedicated escrow account",
            color: "#10b981",
            icon: "🏦",
          },
        ].map(({ id, label, sub, color, icon }) => (
          <button
            key={id}
            onClick={() => setSelectedProvider(id)}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
              selectedProvider === id
                ? "border-[#121212] bg-zinc-50"
                : "border-zinc-200 hover:border-zinc-300"
            )}
          >
            <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center text-[22px] shrink-0">
              {icon}
            </div>
            <div className="flex-1">
              <p className="font-bold text-[14px] text-[#121212]">{label}</p>
              <p className="text-[12px] text-zinc-400">{sub}</p>
            </div>
            {selectedProvider === id && (
              <CheckCircle2 className="w-5 h-5 text-[#121212] shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-[12px] text-red-700">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="h-12 px-5 rounded-xl border-2 border-zinc-200 bg-white text-zinc-600 font-bold text-[14px] hover:border-zinc-300 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handlePay}
          disabled={!selectedProvider || isProcessing}
          className={cn(
            "flex-1 h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all duration-200",
            selectedProvider && !isProcessing
              ? "bg-[#121212] hover:bg-zinc-800 text-white shadow-lg hover:scale-[1.01]"
              : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
          )}
        >
          {isProcessing ? (
            <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Processing...</>
          ) : (
            <><Lock className="w-4 h-4" /> Pay Securely</>
          )}
        </button>
      </div>

      <p className="text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5" />
        Secured by 256-bit SSL encryption
      </p>
    </motion.div>
  );
}
