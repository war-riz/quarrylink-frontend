"use client";

/**
 * PMDashboardShell
 * Project Manager dashboard — KYC approvals, dispute resolution, platform monitoring.
 * 🔌 All data mocked — replace with API calls.
 *
 * Routes:  app/pm/dashboard/page.tsx  →  import { PMDashboardShell }
 *
 * Add to constants/dummyUsers.ts:
 *   - Add "pm" to UserRole type
 *   - Add PM user to DUMMY_USERS array
 *   - Add pm entry to ROLE_CONFIG with dashboardPath: "/pm/dashboard"
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  ShieldCheck,
  AlertTriangle,
  BarChart2,
  LogOut,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Users,
  Package,
  ChevronRight,
  X,
  Loader2,
  FileText,
  Truck,
  Building2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { logout } from "@/lib/api";
import { useRouter } from "next/navigation";

type PMTab = "overview" | "kyc" | "disputes" | "monitoring";

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
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Types ─────────────────────────────────────────────────────────

type KycStatus = "pending" | "approved" | "rejected";
type UserRoleKyc = "customer" | "supplier" | "driver";

interface KycSubmission {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRoleKyc;
  idType: string;
  docType: string;
  submittedAt: string;
  status: KycStatus;
  rejectionReason?: string;
}

type DisputeStatus = "open" | "investigating" | "resolved";
type DisputeOutcome = "full_refund" | "partial_refund" | "release_to_supplier" | null;

interface Dispute {
  id: string;
  orderId: string;
  customer: string;
  supplier: string;
  amount: number;
  reason: string;
  raisedAt: string;
  status: DisputeStatus;
  outcome?: DisputeOutcome;
}

// ── Mock data ─────────────────────────────────────────────────────

const MOCK_KYC: KycSubmission[] = [
  {
    id: "kyc_001", userId: "usr_101", name: "Chidi Nwosu", email: "chidi@buildco.ng",
    role: "customer", idType: "NIN", docType: "National ID Card",
    submittedAt: "2026-05-12T08:30:00Z", status: "pending",
  },
  {
    id: "kyc_002", userId: "usr_102", name: "Amaka Quarries Ltd", email: "amaka@quarry.ng",
    role: "supplier", idType: "BVN", docType: "Driver's Licence",
    submittedAt: "2026-05-11T14:00:00Z", status: "pending",
  },
  {
    id: "kyc_003", userId: "usr_103", name: "Bola Adeyemi", email: "bola@logistics.ng",
    role: "driver", idType: "NIN", docType: "Driver's Licence",
    submittedAt: "2026-05-11T09:15:00Z", status: "pending",
  },
  {
    id: "kyc_004", userId: "usr_104", name: "Funke Ojo", email: "funke@dev.ng",
    role: "customer", idType: "NIN", docType: "International Passport",
    submittedAt: "2026-05-10T16:45:00Z", status: "approved",
  },
  {
    id: "kyc_005", userId: "usr_105", name: "Emeka Rocks", email: "emeka@rocks.ng",
    role: "supplier", idType: "BVN", docType: "National ID Card",
    submittedAt: "2026-05-09T11:00:00Z", status: "rejected",
    rejectionReason: "Document image too blurry — please resubmit a clearer photo.",
  },
];

const MOCK_DISPUTES: Dispute[] = [
  {
    id: "DSP-001", orderId: "QL-2024-0068",
    customer: "Musa Ibrahim", supplier: "Delta Minerals Co.",
    amount: 195000,
    reason: "Received 12 tons instead of 15 tons ordered. Supplier denies shortage.",
    raisedAt: "2026-05-11T10:00:00Z", status: "open",
  },
  {
    id: "DSP-002", orderId: "QL-2024-0055",
    customer: "Grace Obi", supplier: "Lagos Quarry Ltd",
    amount: 320000,
    reason: "Material quality significantly below description — excessive clay content in sharp sand.",
    raisedAt: "2026-05-09T08:30:00Z", status: "investigating",
  },
  {
    id: "DSP-003", orderId: "QL-2024-0041",
    customer: "Tunde Bakare", supplier: "Ewekoro Cement Quarry",
    amount: 267750,
    reason: "Delivery arrived 4 days late, causing construction delays.",
    raisedAt: "2026-05-05T12:00:00Z", status: "resolved",
    outcome: "partial_refund",
  },
];

const PM_STATS = {
  pendingKyc: MOCK_KYC.filter(k => k.status === "pending").length,
  openDisputes: MOCK_DISPUTES.filter(d => d.status !== "resolved").length,
  totalUsers: 412,
  activeOrders: 89,
  totalVolume30d: 1240000000,
  flaggedAccounts: 3,
};

// ── Status configs ────────────────────────────────────────────────

const KYC_STATUS: Record<KycStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: "Pending",  color: "#f59e0b", bg: "#fef3c7" },
  approved: { label: "Approved", color: "#10b981", bg: "#d1fae5" },
  rejected: { label: "Rejected", color: "#ef4444", bg: "#fee2e2" },
};

const ROLE_ICON: Record<UserRoleKyc, React.ElementType> = {
  customer: User,
  supplier: Building2,
  driver: Truck,
};

const ROLE_COLOR: Record<UserRoleKyc, string> = {
  customer: "#3b82f6",
  supplier: "#10b981",
  driver: "#f97316",
};

const DISPUTE_STATUS: Record<DisputeStatus, { label: string; color: string; bg: string }> = {
  open:         { label: "Open",         color: "#ef4444", bg: "#fee2e2" },
  investigating:{ label: "Investigating",color: "#f59e0b", bg: "#fef3c7" },
  resolved:     { label: "Resolved",     color: "#10b981", bg: "#d1fae5" },
};

const OUTCOME_LABELS: Record<NonNullable<DisputeOutcome>, string> = {
  full_refund:          "Full refund to customer",
  partial_refund:       "Partial refund to customer",
  release_to_supplier:  "Release funds to supplier",
};

// ── KYC Review Modal ──────────────────────────────────────────────

function KycReviewModal({
  submission,
  onClose,
  onDecision,
}: {
  submission: KycSubmission;
  onClose: () => void;
  onDecision: (id: string, decision: "approved" | "rejected", reason?: string) => void;
}) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approved" | "rejected" | null>(null);

  const RoleIcon = ROLE_ICON[submission.role];

  const handleDecision = async (decision: "approved" | "rejected") => {
    if (decision === "rejected" && !rejectionReason.trim()) return;
    setIsSubmitting(true);
    // 🔌 REPLACE WITH:
    // await fetch(`/api/kyc/${submission.id}/decision`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ decision, rejectionReason }),
    // });
    await new Promise(r => setTimeout(r, 1200));
    onDecision(submission.id, decision, rejectionReason);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-[480px] overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-extrabold text-[17px] text-[#121212]">Review KYC Submission</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Applicant */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: ROLE_COLOR[submission.role] + "20" }}>
              <RoleIcon className="w-6 h-6" style={{ color: ROLE_COLOR[submission.role] }} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[15px] text-[#121212]">{submission.name}</p>
              <p className="text-[12px] text-zinc-400">{submission.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                style={{ color: ROLE_COLOR[submission.role], background: ROLE_COLOR[submission.role] + "20" }}>
                {submission.role}
              </span>
            </div>
          </div>

          {/* Submitted docs */}
          {[
            { label: "ID Type", value: submission.idType },
            { label: "Document Type", value: submission.docType },
            { label: "Submitted", value: formatDate(submission.submittedAt) },
            { label: "User ID", value: submission.userId },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center text-[13px] border-b border-zinc-50 pb-2">
              <span className="text-zinc-400">{label}</span>
              <span className="font-semibold text-[#121212]">{value}</span>
            </div>
          ))}

          {/* 🔌 In production: show actual uploaded document images from Cloudinary URLs */}
          <div className="flex gap-3">
            {["ID Document (Front)", "Selfie with ID"].map(label => (
              <div key={label} className="flex-1 h-24 rounded-xl bg-zinc-100 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-1">
                <FileText className="w-5 h-5 text-zinc-300" />
                <span className="text-[10px] text-zinc-400 text-center leading-tight px-2">{label}</span>
                <span className="text-[9px] text-zinc-300">🔌 Load from Cloudinary URL</span>
              </div>
            ))}
          </div>

          {/* Rejection reason (shown when rejecting) */}
          {confirmAction === "rejected" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <label className="block text-[12px] font-bold text-[#121212] mb-1.5">
                Rejection reason (sent to applicant)
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Document image too blurry — please resubmit a clearer photo."
                className="w-full rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-[#121212] outline-none focus:border-red-400 resize-none transition-colors"
              />
            </motion.div>
          )}

          {/* Actions */}
          {submission.status === "pending" && (
            <div className="flex gap-3 mt-1">
              {confirmAction !== "approved" && (
                <button
                  onClick={() => { if (confirmAction === "rejected") handleDecision("rejected"); else setConfirmAction("rejected"); }}
                  disabled={isSubmitting || (confirmAction === "rejected" && !rejectionReason.trim())}
                  className={cn(
                    "flex-1 h-11 rounded-xl border-2 font-bold text-[13px] flex items-center justify-center gap-2 transition-all",
                    confirmAction === "rejected"
                      ? rejectionReason.trim() ? "border-red-400 bg-red-500 text-white hover:bg-red-600" : "border-red-200 bg-red-50 text-red-300 cursor-not-allowed"
                      : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  )}
                >
                  {isSubmitting && confirmAction === "rejected" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  {confirmAction === "rejected" ? "Confirm Reject" : "Reject"}
                </button>
              )}
              {confirmAction !== "rejected" && (
                <button
                  onClick={() => { if (confirmAction === "approved") handleDecision("approved"); else setConfirmAction("approved"); }}
                  disabled={isSubmitting}
                  className={cn(
                    "flex-1 h-11 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all",
                    confirmAction === "approved"
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212]"
                  )}
                >
                  {isSubmitting && confirmAction === "approved" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {confirmAction === "approved" ? "Confirm Approve" : "Approve"}
                </button>
              )}
              {confirmAction && (
                <button onClick={() => setConfirmAction(null)}
                  className="h-11 px-4 rounded-xl border-2 border-zinc-200 text-zinc-500 font-bold text-[13px] hover:border-zinc-300">
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Dispute Resolution Modal ──────────────────────────────────────

function DisputeModal({
  dispute,
  onClose,
  onResolve,
}: {
  dispute: Dispute;
  onClose: () => void;
  onResolve: (id: string, outcome: DisputeOutcome) => void;
}) {
  const [selectedOutcome, setSelectedOutcome] = useState<DisputeOutcome>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResolve = async () => {
    if (!selectedOutcome) return;
    setIsSubmitting(true);
    // 🔌 REPLACE WITH:
    // await fetch(`/api/disputes/${dispute.id}/resolve`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ outcome: selectedOutcome, notes }),
    // });
    await new Promise(r => setTimeout(r, 1500));
    onResolve(dispute.id, selectedOutcome);
    setIsSubmitting(false);
    onClose();
  };

  const cfg = DISPUTE_STATUS[dispute.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto"
      >
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-extrabold text-[17px] text-[#121212]">Dispute Resolution</h3>
            <p className="text-[12px] text-zinc-400">{dispute.id} · {dispute.orderId}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-zinc-400">Status</span>
            <span className="text-[12px] font-bold px-3 py-1 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
              {cfg.label}
            </span>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-1">Customer</p>
              <p className="font-bold text-[13px] text-[#121212]">{dispute.customer}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50 border border-green-100">
              <p className="text-[10px] font-bold text-green-500 uppercase tracking-wide mb-1">Supplier</p>
              <p className="font-bold text-[13px] text-[#121212]">{dispute.supplier}</p>
            </div>
          </div>

          {/* Escrow amount */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <span className="text-[13px] font-bold text-amber-700">Amount in Escrow</span>
            <span className="font-extrabold text-[18px] text-amber-800">{formatNaira(dispute.amount)}</span>
          </div>

          {/* Reason */}
          <div className="p-4 rounded-xl bg-red-50 border border-red-100">
            <p className="text-[11px] font-bold text-red-500 uppercase tracking-wide mb-1">Dispute Reason</p>
            <p className="text-[13px] text-red-700 leading-snug">{dispute.reason}</p>
          </div>

          <p className="text-[12px] text-zinc-400">Raised: {formatDate(dispute.raisedAt)}</p>

          {/* PM notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#121212]">Investigation notes</label>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Document your findings here..."
              className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[13px] text-[#121212] outline-none focus:border-[#ffc107] resize-none transition-colors" />
          </div>

          {/* Resolution options */}
          {dispute.status !== "resolved" && (
            <div className="flex flex-col gap-2">
              <p className="text-[12px] font-bold text-[#121212]">Resolution decision</p>
              {(Object.entries(OUTCOME_LABELS) as [NonNullable<DisputeOutcome>, string][]).map(([key, label]) => (
                <button key={key} type="button" onClick={() => setSelectedOutcome(key)}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                    selectedOutcome === key ? "border-[#ffc107] bg-[#fffdf0]" : "border-zinc-200 bg-zinc-50 hover:border-zinc-300"
                  )}>
                  <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                    selectedOutcome === key ? "border-[#ffc107] bg-[#ffc107]" : "border-zinc-300")}>
                    {selectedOutcome === key && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="font-semibold text-[13px] text-[#121212]">{label}</span>
                </button>
              ))}
            </div>
          )}

          {dispute.status === "resolved" && dispute.outcome && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <div>
                <p className="font-bold text-[13px] text-green-700">Resolved</p>
                <p className="text-[12px] text-green-600">{OUTCOME_LABELS[dispute.outcome]}</p>
              </div>
            </div>
          )}

          {dispute.status !== "resolved" && (
            <button onClick={handleResolve} disabled={!selectedOutcome || isSubmitting}
              className={cn(
                "w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all",
                selectedOutcome && !isSubmitting
                  ? "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] shadow-[0_4px_14px_rgba(255,193,7,0.35)] hover:scale-[1.01]"
                  : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              )}>
              {isSubmitting ? <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Resolving...</> : "Apply Resolution"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────

function PMSidebar({ activeTab, setActiveTab }: { activeTab: PMTab; setActiveTab: (t: PMTab) => void }) {
  const { initials, displayName } = useCurrentUser();
  const nav = [
    { id: "overview" as PMTab, label: "Overview", icon: LayoutGrid },
    { id: "kyc" as PMTab, label: "KYC Queue", icon: ShieldCheck, badge: PM_STATS.pendingKyc },
    { id: "disputes" as PMTab, label: "Disputes", icon: AlertTriangle, badge: PM_STATS.openDisputes },
    { id: "monitoring" as PMTab, label: "Monitoring", icon: BarChart2 },
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
            <p className="text-[10px] text-white/40">Admin Portal</p>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-5 px-3 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2">
        <span className="text-[18px]">🛡️</span>
        <div>
          <p className="text-[11px] font-bold text-purple-400">Project Manager</p>
          <p className="text-[10px] text-white/40">Full platform access</p>
        </div>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-1">
        {nav.map(({ id, label, icon: Icon, badge }) => {
          const isActive = activeTab === id;
          return (
            <button key={id} onClick={() => setActiveTab(id)}
              className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                isActive ? "bg-[#ffc107] text-[#121212]" : "text-white/50 hover:bg-white/5 hover:text-white")}>
              <Icon className={cn("w-4.5 h-4.5 shrink-0", isActive ? "text-[#121212]" : "text-white/40")} />
              <span className="font-semibold text-[14px] flex-1">{label}</span>
              {badge ? (
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-[#121212]/20 text-[#121212]" : "bg-red-500 text-white animate-pulse")}>
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
  <span className="font-bold text-[13px] text-[#ffc107]">{initials}</span>
</div>
<div className="flex-1 min-w-0">
  <p className="font-bold text-[13px] text-white truncate">{displayName}</p>
  <p className="text-[11px] text-white/40">Admin</p>
</div>
          <button onClick={() => logout()}
  className="text-white/30 hover:text-white/70 transition-colors">
  <LogOut className="w-4 h-4" />
</button>
        </div>
      </div>
    </aside>
  );
}

// ── Overview tab ──────────────────────────────────────────────────

function PMOverview({ setActiveTab }: { setActiveTab: (t: PMTab) => void }) {
  const s = PM_STATS;
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#121212] rounded-2xl px-6 py-5 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
        <p className="text-[12px] font-bold text-purple-400 uppercase tracking-wider mb-1 z-10 relative">Platform Control</p>
        <h2 className="font-extrabold text-[22px] text-white z-10 relative">Good morning, PM 👋</h2>
        <p className="text-[13px] text-white/50 z-10 relative">
          {s.pendingKyc} KYC submissions · {s.openDisputes} open disputes need your attention
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Pending KYC", value: s.pendingKyc.toString(), icon: ShieldCheck, color: "#f59e0b", bg: "#fef3c7", action: () => setActiveTab("kyc") },
          { label: "Open Disputes", value: s.openDisputes.toString(), icon: AlertTriangle, color: "#ef4444", bg: "#fee2e2", action: () => setActiveTab("disputes") },
          { label: "Total Users", value: s.totalUsers.toLocaleString(), icon: Users, color: "#3b82f6", bg: "#dbeafe", action: () => setActiveTab("monitoring") },
          { label: "Active Orders", value: s.activeOrders.toString(), icon: Package, color: "#10b981", bg: "#d1fae5", action: () => setActiveTab("monitoring") },
          { label: "Platform Volume (30d)", value: `₦${(s.totalVolume30d/1e9).toFixed(1)}B`, icon: BarChart2, color: "#8b5cf6", bg: "#ede9fe", action: () => setActiveTab("monitoring") },
          { label: "Flagged Accounts", value: s.flaggedAccounts.toString(), icon: AlertTriangle, color: "#f97316", bg: "#ffedd5", action: () => setActiveTab("monitoring") },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              onClick={card.action}
              className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm text-left hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: card.bg }}>
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <p className="font-extrabold text-[20px] text-[#121212]">{card.value}</p>
              <p className="font-semibold text-[13px] text-zinc-500 mt-0.5">{card.label}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Quick action alerts */}
      {s.pendingKyc > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-[13px] text-amber-800">{s.pendingKyc} KYC submissions awaiting review</p>
            <p className="text-[11px] text-amber-600">Users cannot access the platform until verified</p>
          </div>
          <button onClick={() => setActiveTab("kyc")} className="shrink-0 flex items-center gap-1 font-bold text-[12px] text-amber-700">
            Review <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {s.openDisputes > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-[13px] text-red-800">{s.openDisputes} disputes holding escrow funds</p>
            <p className="text-[11px] text-red-600">Funds cannot be released until resolved</p>
          </div>
          <button onClick={() => setActiveTab("disputes")} className="shrink-0 flex items-center gap-1 font-bold text-[12px] text-red-700">
            Resolve <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── KYC Queue tab ─────────────────────────────────────────────────

function KycQueueTab() {
  const [submissions, setSubmissions] = useState(MOCK_KYC);
  const [selected, setSelected] = useState<KycSubmission | null>(null);
  const [filter, setFilter] = useState<KycStatus | "all">("pending");

  const filtered = submissions.filter(k => filter === "all" ? true : k.status === filter);

  const handleDecision = (id: string, decision: "approved" | "rejected", reason?: string) => {
    setSubmissions(prev => prev.map(k =>
      k.id === id ? { ...k, status: decision, rejectionReason: reason } : k
    ));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["pending", "approved", "rejected", "all"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("shrink-0 px-4 py-2 rounded-xl font-semibold text-[13px] capitalize transition-all",
              filter === f ? "bg-[#121212] text-white" : "bg-white border-2 border-zinc-200 text-zinc-500 hover:border-zinc-300")}>
            {f} {f !== "all" && `(${submissions.filter(k => k.status === f).length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {filtered.map(sub => {
          const cfg = KYC_STATUS[sub.status];
          const RoleIcon = ROLE_ICON[sub.role];
          return (
            <motion.div key={sub.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: ROLE_COLOR[sub.role] + "20" }}>
                  <RoleIcon className="w-5 h-5" style={{ color: ROLE_COLOR[sub.role] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-bold text-[15px] text-[#121212]">{sub.name}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                      style={{ color: ROLE_COLOR[sub.role], background: ROLE_COLOR[sub.role] + "20" }}>
                      {sub.role}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: cfg.color, background: cfg.bg }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[12px] text-zinc-400">{sub.email}</p>
                  <p className="text-[11px] text-zinc-300 mt-0.5">{sub.idType} · {sub.docType} · {formatDate(sub.submittedAt)}</p>
                  {sub.rejectionReason && (
                    <p className="text-[11px] text-red-500 mt-1 leading-snug">Rejected: {sub.rejectionReason}</p>
                  )}
                </div>
                {sub.status === "pending" && (
                  <button onClick={() => setSelected(sub)}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold text-[12px] transition-all">
                    <Eye className="w-3.5 h-3.5" /> Review
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <KycReviewModal submission={selected} onClose={() => setSelected(null)} onDecision={handleDecision} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Disputes tab ──────────────────────────────────────────────────

function DisputesTab() {
  const [disputes, setDisputes] = useState(MOCK_DISPUTES);
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [filter, setFilter] = useState<DisputeStatus | "all">("open");

  const filtered = disputes.filter(d => filter === "all" ? true : d.status === filter);

  const handleResolve = (id: string, outcome: DisputeOutcome) => {
    setDisputes(prev => prev.map(d =>
      d.id === id ? { ...d, status: "resolved" as DisputeStatus, outcome } : d
    ));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["open", "investigating", "resolved", "all"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("shrink-0 px-4 py-2 rounded-xl font-semibold text-[13px] capitalize transition-all",
              filter === f ? "bg-[#121212] text-white" : "bg-white border-2 border-zinc-200 text-zinc-500 hover:border-zinc-300")}>
            {f} {f !== "all" && `(${disputes.filter(d => d.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map(dispute => {
          const cfg = DISPUTE_STATUS[dispute.status];
          return (
            <motion.div key={dispute.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: cfg.bg }}>
                  <AlertTriangle className="w-5 h-5" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-[12px] text-zinc-400">{dispute.id}</span>
                    <span className="font-bold text-[12px] text-zinc-400">·</span>
                    <span className="font-bold text-[12px] text-zinc-400">{dispute.orderId}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                  </div>
                  <p className="font-bold text-[14px] text-[#121212]">{dispute.customer} vs {dispute.supplier}</p>
                  <p className="text-[12px] text-zinc-500 leading-snug mt-0.5 line-clamp-2">{dispute.reason}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-bold text-[13px] text-amber-700">{formatNaira(dispute.amount)}</span>
                    <span className="text-[11px] text-zinc-400">{formatDate(dispute.raisedAt)}</span>
                    {dispute.outcome && (
                      <span className="text-[11px] font-bold text-green-600">{OUTCOME_LABELS[dispute.outcome]}</span>
                    )}
                  </div>
                </div>
                {dispute.status !== "resolved" && (
                  <button onClick={() => setSelected(dispute)}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold text-[12px] transition-all">
                    <Eye className="w-3.5 h-3.5" /> Resolve
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <DisputeModal dispute={selected} onClose={() => setSelected(null)} onResolve={handleResolve} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Monitoring tab ────────────────────────────────────────────────

function MonitoringTab() {
  const s = PM_STATS;
  const monthlyData = [
    { month: "Jan", orders: 312 }, { month: "Feb", orders: 428 },
    { month: "Mar", orders: 519 }, { month: "Apr", orders: 687 },
    { month: "May", orders: 891 },
  ];
  const maxOrders = Math.max(...monthlyData.map(d => d.orders));

  return (
    <div className="flex flex-col gap-5">
      {/* Platform health */}
      <div className="bg-[#121212] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-2 mb-1 z-10 relative">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[12px] font-bold text-green-400 uppercase tracking-wide">All systems operational</span>
        </div>
        <p className="font-extrabold text-[28px] text-white z-10 relative">{formatNaira(s.totalVolume30d)}</p>
        <p className="text-[13px] text-white/50 z-10 relative">Platform transaction volume — last 30 days</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Total Users", value: s.totalUsers.toLocaleString(), note: "Across all roles" },
          { label: "Active Orders", value: s.activeOrders.toString(), note: "In-progress now" },
          { label: "Flagged Accounts", value: s.flaggedAccounts.toString(), note: "Needs review" },
          { label: "KYC Approval Rate", value: "94%", note: "Last 30 days" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
            <p className="font-extrabold text-[22px] text-[#121212]">{card.value}</p>
            <p className="font-semibold text-[13px] text-zinc-500">{card.label}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{card.note}</p>
          </div>
        ))}
      </div>

      {/* Order volume chart */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <h3 className="font-bold text-[15px] text-[#121212] mb-5">Monthly Order Volume</h3>
        <div className="flex items-end gap-3 h-32">
          {monthlyData.map(d => {
            const h = (d.orders / maxOrders) * 100;
            const isLatest = d.month === "May";
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-zinc-500">{d.orders}</span>
                <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.6 }}
                  className="w-full rounded-t-lg" style={{ background: isLatest ? "#ffc107" : "#e5e7eb", minHeight: "8px" }} />
                <span className="text-[11px] text-zinc-400">{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* User breakdown */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="font-bold text-[15px] text-[#121212]">User Breakdown</h3>
        </div>
        {[
          { role: "Customers", count: 412, color: "#3b82f6", bg: "#dbeafe" },
          { role: "Suppliers (Agents)", count: 89, color: "#10b981", bg: "#d1fae5" },
          { role: "Drivers (Logistics)", count: 234, color: "#f97316", bg: "#ffedd5" },
          { role: "Finance Partners", count: 7, color: "#8b5cf6", bg: "#ede9fe" },
        ].map(row => (
          <div key={row.role} className="flex items-center gap-4 px-5 py-3 border-b border-zinc-50 last:border-none">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: row.color }} />
            <span className="flex-1 text-[13px] text-zinc-500">{row.role}</span>
            <span className="font-bold text-[14px] text-[#121212]">{row.count.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-zinc-300">
        🔌 Connect to /api/admin/stats for live platform data
      </p>
    </div>
  );
}

// ── Main shell ────────────────────────────────────────────────────

export function PMDashboardShell() {
  const [activeTab, setActiveTab] = useState<PMTab>("overview");

  const tabTitles: Record<PMTab, string> = {
    overview: "Platform Overview",
    kyc: "KYC Approval Queue",
    disputes: "Dispute Resolution",
    monitoring: "Platform Monitoring",
  };

  return (
    <div className="flex h-screen bg-[#F4F4F7] overflow-hidden">
      <PMSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-zinc-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <h1 className="font-extrabold text-[18px] lg:text-[20px] text-[#121212]">
            {tabTitles[activeTab]}
          </h1>
          <div className="flex items-center gap-2 text-[12px] text-zinc-400">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Live
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {activeTab === "overview"   && <PMOverview setActiveTab={setActiveTab} />}
              {activeTab === "kyc"        && <KycQueueTab />}
              {activeTab === "disputes"   && <DisputesTab />}
              {activeTab === "monitoring" && <MonitoringTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
