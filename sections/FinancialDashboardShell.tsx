"use client";

/**
 * FinancialDashboardShell
 * Full financial institution dashboard UI.
 * 🔌 All data is mocked — replace with API calls.
 *
 * Financial institution sees:
 *   - Platform-wide escrow flow overview
 *   - Trade financing opportunities
 *   - Risk assessment data per order/customer
 *   - Transaction analytics
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Wallet,
  TrendingUp,
  ShieldCheck,
  BarChart2,
  FileText,
  LogOut,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Users,
  Star,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearSession } from "@/constants/dummyUsers";
import { useRouter } from "next/navigation";

type FinancialTab = "overview" | "escrow" | "financing" | "analytics";

function formatNaira(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Mock data ─────────────────────────────────────────────────────

const FINANCIAL_STATS = {
  totalEscrowValue: 284750000,
  activeEscrowCount: 1247,
  totalFinanced: 89400000,
  activeLoans: 23,
  defaultRate: 0.8,
  avgOrderValue: 385000,
  platformVolume30d: 1240000000,
  supplierCount: 89,
  customerCount: 412,
};

interface EscrowRecord {
  id: string;
  orderId: string;
  customer: string;
  supplier: string;
  amount: number;
  status: "held" | "released" | "disputed";
  createdAt: string;
  releaseDate?: string;
}

interface FinancingOpportunity {
  id: string;
  customer: string;
  company: string;
  requestedAmount: number;
  purpose: string;
  creditScore: number;
  orderHistory: number;
  status: "pending" | "approved" | "declined";
}

const MOCK_ESCROW: EscrowRecord[] = [
  {
    id: "ESC-001",
    orderId: "QL-2024-0089",
    customer: "Adebayo Okonkwo",
    supplier: "Abeokuta Stone Works",
    amount: 420000,
    status: "held",
    createdAt: "2024-05-07T09:22:00Z",
  },
  {
    id: "ESC-002",
    orderId: "QL-2024-0091",
    customer: "Fatima Bello",
    supplier: "Abeokuta Stone Works",
    amount: 852000,
    status: "held",
    createdAt: "2024-05-08T11:00:00Z",
  },
  {
    id: "ESC-003",
    orderId: "QL-2024-0081",
    customer: "Adebayo Okonkwo",
    supplier: "Lagos Quarry Ltd",
    amount: 156975,
    status: "released",
    createdAt: "2024-05-04T14:10:00Z",
    releaseDate: "2024-05-05T16:30:00Z",
  },
  {
    id: "ESC-004",
    orderId: "QL-2024-0075",
    customer: "Chisom Eze",
    supplier: "Ewekoro Cement Quarry",
    amount: 267750,
    status: "released",
    createdAt: "2024-05-01T11:00:00Z",
    releaseDate: "2024-05-03T14:00:00Z",
  },
  {
    id: "ESC-005",
    orderId: "QL-2024-0068",
    customer: "Musa Ibrahim",
    supplier: "Delta Minerals Co.",
    amount: 195000,
    status: "disputed",
    createdAt: "2024-04-28T09:00:00Z",
  },
];

const MOCK_FINANCING: FinancingOpportunity[] = [
  {
    id: "FIN-001",
    customer: "Skyline Construction Ltd",
    company: "Adebayo Okonkwo",
    requestedAmount: 5000000,
    purpose: "Bulk material procurement for Lekki housing project",
    creditScore: 87,
    orderHistory: 12,
    status: "pending",
  },
  {
    id: "FIN-002",
    customer: "Bello Constructions",
    company: "Fatima Bello",
    requestedAmount: 2500000,
    purpose: "Working capital for ongoing contracts",
    creditScore: 74,
    orderHistory: 6,
    status: "approved",
  },
  {
    id: "FIN-003",
    customer: "Musa Builders",
    company: "Ibrahim Musa",
    requestedAmount: 1200000,
    purpose: "Materials for Abuja road project",
    creditScore: 61,
    orderHistory: 3,
    status: "declined",
  },
];

const ESCROW_STATUS_CONFIG = {
  held:      { label: "Held",      color: "#f59e0b", bg: "#fef3c7" },
  released:  { label: "Released",  color: "#10b981", bg: "#d1fae5" },
  disputed:  { label: "Disputed",  color: "#ef4444", bg: "#fee2e2" },
};

const FINANCING_STATUS_CONFIG = {
  pending:  { label: "Pending Review", color: "#3b82f6", bg: "#dbeafe" },
  approved: { label: "Approved",       color: "#10b981", bg: "#d1fae5" },
  declined: { label: "Declined",       color: "#ef4444", bg: "#fee2e2" },
};

// ── Sidebar ───────────────────────────────────────────────────────

function FinancialSidebar({
  activeTab,
  setActiveTab,
}: {
  activeTab: FinancialTab;
  setActiveTab: (t: FinancialTab) => void;
}) {
  const router = useRouter();
  const nav = [
    { id: "overview"   as FinancialTab, label: "Overview",     icon: LayoutGrid },
    { id: "escrow"     as FinancialTab, label: "Escrow Flow",  icon: ShieldCheck },
    { id: "financing"  as FinancialTab, label: "Trade Finance",icon: Wallet,
      badge: MOCK_FINANCING.filter(f => f.status === "pending").length },
    { id: "analytics"  as FinancialTab, label: "Analytics",    icon: BarChart2 },
  ];

  return (
    <aside className="hidden lg:flex lg:w-[240px] bg-[#121212] flex-col h-full">
      <div className="px-6 pt-6 pb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ffc107] flex items-center justify-center">
            <span className="font-extrabold text-[13px] text-[#121212]">QL</span>
          </div>
          <div>
            <p className="font-bold text-[14px] text-white">QuarryLink</p>
            <p className="text-[10px] text-white/40">Finance Portal</p>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-5 px-3 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2">
        <span className="text-[18px]">🏦</span>
        <div>
          <p className="text-[11px] font-bold text-purple-400">First Continental Bank</p>
          <p className="text-[10px] text-white/40">Partner Institution</p>
        </div>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-1">
        {nav.map(({ id, label, icon: Icon, badge }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                isActive
                  ? "bg-[#ffc107] text-[#121212]"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-4.5 h-4.5 shrink-0",
                  isActive ? "text-[#121212]" : "text-white/40"
                )}
              />
              <span className="font-semibold text-[14px] flex-1">{label}</span>
              {badge ? (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    isActive
                      ? "bg-[#121212]/20 text-[#121212]"
                      : "bg-[#ffc107] text-[#121212]"
                  )}
                >
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-[#ffc107]/20 border-2 border-[#ffc107]/40 flex items-center justify-center shrink-0">
            <span className="font-bold text-[13px] text-[#ffc107]">NA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[13px] text-white truncate">Ngozi Adeyemi</p>
            <p className="text-[11px] text-white/40">Financial Analyst</p>
          </div>
          <button
            onClick={() => { clearSession(); router.push("/dev-login"); }}
            className="text-white/30 hover:text-white/70 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────

function FinancialOverview({ setActiveTab }: { setActiveTab: (t: FinancialTab) => void }) {
  const s = FINANCIAL_STATS;

  const statCards = [
    {
      label: "Total Escrow Value",
      value: formatNaira(s.totalEscrowValue),
      sub: `${s.activeEscrowCount} active transactions`,
      icon: ShieldCheck,
      color: "#f59e0b",
      bg: "#fef3c7",
      trend: "+12.4%",
      up: true,
    },
    {
      label: "Trade Finance Deployed",
      value: formatNaira(s.totalFinanced),
      sub: `${s.activeLoans} active facilities`,
      icon: Wallet,
      color: "#8b5cf6",
      bg: "#ede9fe",
      trend: "+8.1%",
      up: true,
    },
    {
      label: "Platform Volume (30d)",
      value: formatNaira(s.platformVolume30d),
      sub: `Avg ${formatNaira(s.avgOrderValue)}/order`,
      icon: TrendingUp,
      color: "#10b981",
      bg: "#d1fae5",
      trend: "+23.7%",
      up: true,
    },
    {
      label: "Default Rate",
      value: `${s.defaultRate}%`,
      sub: "Below industry avg of 3.2%",
      icon: AlertCircle,
      color: "#3b82f6",
      bg: "#dbeafe",
      trend: "-0.2%",
      up: false,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Welcome banner */}
      <div className="bg-[#121212] rounded-2xl px-6 py-5 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="z-10 relative">
          <p className="text-[12px] font-bold text-purple-400 uppercase tracking-wider mb-1">
            First Continental Bank
          </p>
          <h2 className="font-extrabold text-[22px] text-white leading-tight">
            Financial Overview
          </h2>
          <p className="text-[13px] text-white/50 mt-0.5">
            QuarryLink platform — {new Date().toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: card.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full",
                    card.up
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                  )}
                >
                  {card.up
                    ? <ArrowUpRight className="w-3 h-3" />
                    : <ArrowDownRight className="w-3 h-3" />
                  }
                  {card.trend}
                </div>
              </div>
              <p className="font-extrabold text-[17px] lg:text-[19px] text-[#121212] leading-tight">
                {card.value}
              </p>
              <p className="font-semibold text-[12px] text-zinc-500 mt-0.5">{card.label}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{card.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Platform participants */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Verified Suppliers", value: s.supplierCount, icon: Package, color: "#10b981" },
          { label: "Active Customers", value: s.customerCount, icon: Users, color: "#3b82f6" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: color + "20" }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="font-extrabold text-[22px] text-[#121212]">{value}</p>
              <p className="text-[12px] text-zinc-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending financing alert */}
      {MOCK_FINANCING.filter(f => f.status === "pending").length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3">
          <FileText className="w-5 h-5 text-purple-500 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-[13px] text-purple-700">
              {MOCK_FINANCING.filter(f => f.status === "pending").length} trade finance
              {MOCK_FINANCING.filter(f => f.status === "pending").length > 1 ? " requests" : " request"} pending review
            </p>
            <p className="text-[11px] text-purple-500">
              Total: {formatNaira(MOCK_FINANCING.filter(f => f.status === "pending").reduce((s, f) => s + f.requestedAmount, 0))}
            </p>
          </div>
          <button
            onClick={() => setActiveTab("financing")}
            className="shrink-0 flex items-center gap-1 font-bold text-[12px] text-purple-700"
          >
            Review <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Recent escrow */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h3 className="font-bold text-[15px] text-[#121212]">Recent Escrow Transactions</h3>
          <button
            onClick={() => setActiveTab("escrow")}
            className="text-[12px] font-bold text-[#ffc107] flex items-center gap-1"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="divide-y divide-zinc-50">
          {MOCK_ESCROW.slice(0, 4).map((rec) => {
            const cfg = ESCROW_STATUS_CONFIG[rec.status];
            return (
              <div key={rec.id} className="flex items-center gap-4 px-5 py-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: cfg.bg }}
                >
                  <ShieldCheck className="w-4.5 h-4.5" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] text-[#121212] truncate">
                    {rec.orderId} — {rec.customer}
                  </p>
                  <p className="text-[11px] text-zinc-400">{rec.supplier} · {formatDate(rec.createdAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-[13px] text-[#121212]">{formatNaira(rec.amount)}</p>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color: cfg.color, background: cfg.bg }}
                  >
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Escrow Tab ────────────────────────────────────────────────────

function EscrowTab() {
  const [filter, setFilter] = useState<"all" | "held" | "released" | "disputed">("all");

  const filtered = MOCK_ESCROW.filter(r =>
    filter === "all" ? true : r.status === filter
  );

  const totals = {
    held: MOCK_ESCROW.filter(r => r.status === "held").reduce((s, r) => s + r.amount, 0),
    released: MOCK_ESCROW.filter(r => r.status === "released").reduce((s, r) => s + r.amount, 0),
    disputed: MOCK_ESCROW.filter(r => r.status === "disputed").reduce((s, r) => s + r.amount, 0),
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "In Escrow", value: formatNaira(totals.held), color: "#f59e0b", bg: "#fef3c7" },
          { label: "Released", value: formatNaira(totals.released), color: "#10b981", bg: "#d1fae5" },
          { label: "Disputed", value: formatNaira(totals.disputed), color: "#ef4444", bg: "#fee2e2" },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg mb-2" style={{ background: bg }} />
            <p className="font-extrabold text-[14px] text-[#121212]">{value}</p>
            <p className="text-[11px] text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "held", "released", "disputed"] as const).map(f => (
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

      {/* Records */}
      <div className="flex flex-col gap-3">
        {filtered.map(rec => {
          const cfg = ESCROW_STATUS_CONFIG[rec.status];
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: cfg.bg }}
                >
                  <ShieldCheck className="w-5 h-5" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-[12px] text-zinc-400">{rec.id}</span>
                    <span className="font-bold text-[12px] text-zinc-400">·</span>
                    <span className="font-bold text-[12px] text-zinc-400">{rec.orderId}</span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="font-bold text-[14px] text-[#121212]">{rec.customer}</p>
                  <p className="text-[12px] text-zinc-400">Supplier: {rec.supplier}</p>
                  <div className="flex items-center gap-3 mt-2 text-[12px] text-zinc-400">
                    <span>Created: {formatDate(rec.createdAt)}</span>
                    {rec.releaseDate && (
                      <span>Released: {formatDate(rec.releaseDate)}</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-extrabold text-[16px] text-[#121212]">
                    {formatNaira(rec.amount)}
                  </p>
                  {rec.status === "disputed" && (
                    <button className="mt-1 text-[11px] font-bold text-red-600 hover:text-red-800 transition-colors">
                      Investigate →
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Trade Financing Tab ───────────────────────────────────────────

function TradeFinancingTab() {
  const [opportunities, setOpportunities] = useState(MOCK_FINANCING);

  const handleDecision = (id: string, decision: "approved" | "declined") => {
    // 🔌 POST /api/financing/:id/decision { decision }
    setOpportunities(prev =>
      prev.map(o => o.id === id ? { ...o, status: decision } : o)
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Info banner */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex items-start gap-3">
        <Building2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
        <p className="text-[13px] text-purple-700 leading-snug">
          <strong>Trade Finance on QuarryLink</strong> — Customers with verified order history
          can apply for credit facilities backed by their escrow track record.
          {/* 🔌 Connect to your credit scoring API for real risk assessment */}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {opportunities.map(opp => {
          const cfg = FINANCING_STATUS_CONFIG[opp.status];
          const riskColor = opp.creditScore >= 80 ? "#10b981" : opp.creditScore >= 65 ? "#f59e0b" : "#ef4444";
          const riskLabel = opp.creditScore >= 80 ? "Low Risk" : opp.creditScore >= 65 ? "Medium Risk" : "High Risk";

          return (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-bold text-[15px] text-[#121212]">{opp.customer}</p>
                  <p className="text-[12px] text-zinc-400">{opp.company}</p>
                </div>
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
                  style={{ color: cfg.color, background: cfg.bg }}
                >
                  {cfg.label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-zinc-50 rounded-xl p-3 text-center">
                  <p className="font-extrabold text-[15px] text-[#121212]">
                    {formatNaira(opp.requestedAmount)}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Requested</p>
                </div>
                <div className="bg-zinc-50 rounded-xl p-3 text-center">
                  <p className="font-extrabold text-[15px]" style={{ color: riskColor }}>
                    {opp.creditScore}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Credit Score</p>
                </div>
                <div className="bg-zinc-50 rounded-xl p-3 text-center">
                  <p className="font-extrabold text-[15px] text-[#121212]">{opp.orderHistory}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Past Orders</p>
                </div>
              </div>

              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-[12px] font-bold"
                style={{ background: riskColor + "15", color: riskColor }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: riskColor }} />
                {riskLabel} — Credit Score {opp.creditScore}/100
              </div>

              <p className="text-[12px] text-zinc-500 mb-4 leading-snug">{opp.purpose}</p>

              {opp.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDecision(opp.id, "declined")}
                    className="flex-1 h-10 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 font-bold text-[13px] hover:bg-red-100 transition-all"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleDecision(opp.id, "approved")}
                    className="flex-1 h-10 rounded-xl bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold text-[13px] transition-all hover:scale-[1.01]"
                  >
                    Approve Facility
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Analytics Tab ─────────────────────────────────────────────────

function AnalyticsTab() {
  const s = FINANCIAL_STATS;

  // Simple bar chart data (mock monthly volumes in millions)
  const monthlyData = [
    { month: "Jan", volume: 420 },
    { month: "Feb", volume: 580 },
    { month: "Mar", volume: 710 },
    { month: "Apr", volume: 890 },
    { month: "May", volume: 1240 },
  ];
  const maxVolume = Math.max(...monthlyData.map(d => d.volume));

  return (
    <div className="flex flex-col gap-5">
      {/* Volume chart */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <h3 className="font-bold text-[15px] text-[#121212] mb-5">Monthly Transaction Volume</h3>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map(d => {
            const heightPct = (d.volume / maxVolume) * 100;
            const isLatest = d.month === "May";
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-zinc-500">
                  ₦{d.volume}M
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="w-full rounded-t-lg"
                  style={{
                    background: isLatest ? "#ffc107" : "#e5e7eb",
                    minHeight: "8px",
                  }}
                />
                <span className="text-[11px] text-zinc-400">{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key metrics */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="font-bold text-[15px] text-[#121212]">Key Platform Metrics</h3>
        </div>
        <div className="divide-y divide-zinc-50">
          {[
            { label: "Total Escrow Volume", value: formatNaira(s.totalEscrowValue), trend: "+12.4%" },
            { label: "Active Escrow Transactions", value: s.activeEscrowCount.toLocaleString(), trend: "+8.3%" },
            { label: "Avg Order Value", value: formatNaira(s.avgOrderValue), trend: "+4.1%" },
            { label: "Supplier Count", value: s.supplierCount.toString(), trend: "+6.7%" },
            { label: "Customer Count", value: s.customerCount.toString(), trend: "+18.2%" },
            { label: "Default Rate", value: `${s.defaultRate}%`, trend: "-0.2%" },
            { label: "Platform 30d Volume", value: formatNaira(s.platformVolume30d), trend: "+23.7%" },
          ].map(({ label, value, trend }) => {
            const isPositive = trend.startsWith("+");
            return (
              <div key={label} className="flex items-center justify-between px-5 py-4">
                <span className="text-[13px] text-zinc-500">{label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[13px] text-[#121212]">{value}</span>
                  <span
                    className={cn(
                      "text-[11px] font-bold px-2 py-0.5 rounded-full",
                      isPositive
                        ? "bg-green-100 text-green-600"
                        : "bg-blue-100 text-blue-600"
                    )}
                  >
                    {trend}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-[11px] text-zinc-300">
        🔌 Connect to /api/analytics for real-time platform data
      </p>
    </div>
  );
}

// ── Main shell ───────────────────────────────────────────────────

export function FinancialDashboardShell() {
  const [activeTab, setActiveTab] = useState<FinancialTab>("overview");

  const tabTitles: Record<FinancialTab, string> = {
    overview:   "Financial Overview",
    escrow:     "Escrow Flow",
    financing:  "Trade Finance",
    analytics:  "Platform Analytics",
  };

  return (
    <div className="flex h-screen bg-[#F4F4F7] overflow-hidden">
      <FinancialSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-zinc-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <h1 className="font-extrabold text-[18px] lg:text-[20px] text-[#121212]">
            {tabTitles[activeTab]}
          </h1>
          <div className="flex items-center gap-2 text-[12px] text-zinc-400">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Live data
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview"  && <FinancialOverview setActiveTab={setActiveTab} />}
              {activeTab === "escrow"    && <EscrowTab />}
              {activeTab === "financing" && <TradeFinancingTab />}
              {activeTab === "analytics" && <AnalyticsTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
