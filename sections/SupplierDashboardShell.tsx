"use client";

/**
 * SupplierDashboardShell
 * Full supplier (quarry operator) dashboard UI.
 * 🔌 All data is from supplierDashboardConstants.ts — replace with API calls.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Package,
  Wallet,
  Star,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Phone,
  ArrowRight,
  LogOut,
  Edit3,
  BarChart2,
  ShieldCheck,
  X,
  Plus,
  Minus,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MOCK_SUPPLIER_ORDERS,
  MOCK_INVENTORY,
  MOCK_SUPPLIER_STATS,
  SUPPLIER_ORDER_STATUS,
  SupplierOrder,
} from "@/constants/supplierDashboardConstants";
import { clearSession } from "@/constants/dummyUsers";
import { useRouter } from "next/navigation";
import { SupplierOrderActionsBar } from "./SupplierOrderActions";

type SupplierTab = "overview" | "orders" | "inventory" | "earnings";

function formatNaira(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Order action modal ───────────────────────────────────────────

function OrderActionModal({
  order,
  onClose,
  onAccept,
  onReject,
}: {
  order: SupplierOrder;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  const cfg = SUPPLIER_ORDER_STATUS[order.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-[440px] overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-extrabold text-[17px] text-[#121212]">Order Details</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-bold text-zinc-400">{order.id}</span>
            <span className="text-[12px] font-bold px-2.5 py-1 rounded-full"
              style={{ color: cfg.color, background: cfg.bg }}>
              {cfg.label}
            </span>
          </div>
          {[
            { label: "Material", value: `${order.material} · ${order.quantity} tons` },
            { label: "Customer", value: `${order.customerName} · ${order.customerCompany}` },
            { label: "Deliver to", value: order.deliveryAddress },
            { label: "Amount (escrow)", value: formatNaira(order.total) },
            { label: "Order date", value: formatDate(order.createdAt) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start gap-4">
              <span className="text-[13px] text-zinc-400 shrink-0">{label}</span>
              <span className="font-semibold text-[13px] text-[#121212] text-right">{value}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
            <p className="text-[12px] text-green-700">Payment is secured in escrow. Released after delivery confirmation.</p>
          </div>
        </div>
        {order.status === "new" && (
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onReject}
              className="flex-1 h-11 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 font-bold text-[14px] hover:bg-red-100 transition-all">
              Reject
            </button>
            <button onClick={onAccept}
              className="flex-1 h-11 rounded-xl bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold text-[14px] transition-all hover:scale-[1.01]">
              Accept Order
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────

function SupplierSidebar({ activeTab, setActiveTab }: { activeTab: SupplierTab; setActiveTab: (t: SupplierTab) => void }) {
  const router = useRouter();
  const nav = [
    { id: "overview" as SupplierTab, label: "Overview", icon: LayoutGrid },
    { id: "orders" as SupplierTab, label: "Orders", icon: Package, badge: MOCK_SUPPLIER_ORDERS.filter(o => o.status === "new").length },
    { id: "inventory" as SupplierTab, label: "Inventory", icon: BarChart2 },
    { id: "earnings" as SupplierTab, label: "Earnings", icon: Wallet },
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
            <p className="text-[10px] text-white/40">Supplier Portal</p>
          </div>
        </div>
      </div>

      {/* Supplier badge */}
      <div className="mx-4 mb-5 px-3 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
        <span className="text-[18px]">⛏️</span>
        <div>
          <p className="text-[11px] font-bold text-green-400">Abeokuta Stone Works</p>
          <p className="text-[10px] text-white/40">Verified Supplier</p>
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
                  isActive ? "bg-[#121212]/20 text-[#121212]" : "bg-[#ffc107] text-[#121212]")}>
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
            <span className="font-bold text-[13px] text-[#ffc107]">CO</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[13px] text-white truncate">Chukwuemeka Obi</p>
            <p className="text-[11px] text-white/40">Supplier</p>
          </div>
          <button onClick={() => { clearSession(); router.push("/dev-login"); }}
            className="text-white/30 hover:text-white/70 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ── Overview tab ─────────────────────────────────────────────────

function SupplierOverview({ setActiveTab }: { setActiveTab: (t: SupplierTab) => void }) {
  const s = MOCK_SUPPLIER_STATS;
  const newOrders = MOCK_SUPPLIER_ORDERS.filter(o => o.status === "new");

  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatNaira(s.totalRevenue), icon: Wallet, color: "#10b981", bg: "#d1fae5" },
          { label: "In Escrow", value: formatNaira(s.escrowHeld), icon: ShieldCheck, color: "#f59e0b", bg: "#fef3c7" },
          { label: "Avg Rating", value: `${s.avgRating} ★`, icon: Star, color: "#ffc107", bg: "#fef9c3" },
          { label: "Total Orders", value: s.totalOrders.toString(), icon: Package, color: "#3b82f6", bg: "#dbeafe" },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: card.bg }}>
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <p className="font-extrabold text-[20px] text-[#121212]">{card.value}</p>
              <p className="font-semibold text-[13px] text-zinc-500 mt-0.5">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* New orders alert */}
      {newOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[14px] text-blue-800">
              {newOrders.length} new order{newOrders.length > 1 ? "s" : ""} awaiting your response
            </p>
            <p className="text-[12px] text-blue-600 mt-0.5">
              Respond within 2 hours to maintain your acceptance rate
            </p>
          </div>
          <button onClick={() => setActiveTab("orders")}
            className="shrink-0 flex items-center gap-1 font-bold text-[13px] text-blue-700 hover:gap-2 transition-all">
            View <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h3 className="font-bold text-[15px] text-[#121212]">Recent Orders</h3>
          <button onClick={() => setActiveTab("orders")}
            className="text-[12px] font-bold text-[#ffc107] flex items-center gap-1">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="divide-y divide-zinc-50">
          {MOCK_SUPPLIER_ORDERS.slice(0, 4).map(order => {
            const cfg = SUPPLIER_ORDER_STATUS[order.status];
            return (
              <div key={order.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                  <Package className="w-4.5 h-4.5 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] text-[#121212] truncate">{order.material}</p>
                  <p className="text-[11px] text-zinc-400">{order.id} · {order.customerCompany}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-[13px] text-[#121212]">{formatNaira(order.total)}</p>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color: cfg.color, background: cfg.bg }}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stock summary */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="font-bold text-[15px] text-[#121212]">Stock Summary</h3>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          {MOCK_INVENTORY.map(item => (
            <div key={item.id} className={cn("p-4 rounded-xl border", item.available ? "border-zinc-100 bg-zinc-50" : "border-red-100 bg-red-50")}>
              <p className="font-bold text-[13px] text-[#121212] truncate">{item.name}</p>
              <p className={cn("font-extrabold text-[17px] mt-1", item.available ? "text-[#121212]" : "text-red-500")}>
                {item.stockTons}t
              </p>
              <p className="text-[11px] text-zinc-400">{item.available ? `${item.reservedTons}t reserved` : "Out of stock"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Orders tab ───────────────────────────────────────────────────

function SupplierOrders() {
  const [orders, setOrders] = useState(MOCK_SUPPLIER_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);

  const handleStatusChange = (id: string, newStatus: any) => {
  setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
};

  const handleAccept = () => {
    if (!selectedOrder) return;
    setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: "accepted" as const } : o));
    setSelectedOrder(null);
  };

  const handleReject = () => {
    if (!selectedOrder) return;
    setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: "rejected" as const } : o));
    setSelectedOrder(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {orders.map(order => {
          const cfg = SUPPLIER_ORDER_STATUS[order.status];
          const isNew = order.status === "new";
          return (
            <motion.div key={order.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={cn("bg-white rounded-2xl border shadow-sm p-5",
                isNew ? "border-blue-200 ring-2 ring-blue-100" : "border-zinc-100")}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-[12px] text-zinc-400">{order.id}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: cfg.color, background: cfg.bg }}>
                      {cfg.label}
                    </span>
                    {isNew && <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full animate-pulse">NEW</span>}
                  </div>
                  <p className="font-bold text-[15px] text-[#121212]">{order.material} · {order.quantity} tons</p>
                  <p className="text-[12px] text-zinc-500 mt-0.5">{order.customerCompany} · {formatDate(order.createdAt)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-extrabold text-[15px] text-[#121212]">{formatNaira(order.total)}</span>
                    <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full",
                      order.paymentStatus === "in_escrow" ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700")}>
                      {order.paymentStatus === "in_escrow" ? "In Escrow" : "Released"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
  <SupplierOrderActionsBar
    order={order}
    onStatusChange={handleStatusChange}
  />
  <button onClick={() => setSelectedOrder(order)}
    className="shrink-0 px-4 py-2 rounded-xl font-bold text-[13px] bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-all">
    View
  </button>
</div>
            </motion.div>
          );
        })}
        
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderActionModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Inventory tab ────────────────────────────────────────────────

function SupplierInventory() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-zinc-400">{MOCK_INVENTORY.length} materials listed</p>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold text-[13px] transition-all">
          <Plus className="w-3.5 h-3.5" /> Add Material
        </button>
      </div>
      {MOCK_INVENTORY.map(item => (
        <div key={item.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-[15px] text-[#121212]">{item.name}</p>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                  item.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
                  {item.available ? "Available" : "Out of Stock"}
                </span>
              </div>
              <p className="text-[12px] text-zinc-400">{item.category} · Min {item.minOrder} tons</p>
              <div className="grid grid-cols-3 gap-3 mt-3">
                {[
                  { label: "Price/ton", value: formatNaira(item.pricePerTon) },
                  { label: "In stock", value: `${item.stockTons}t` },
                  { label: "Reserved", value: `${item.reservedTons}t` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-zinc-50 rounded-xl p-2.5 text-center">
                    <p className="font-extrabold text-[13px] text-[#121212]">{value}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <button className="shrink-0 w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
              <Edit3 className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Earnings tab ─────────────────────────────────────────────────

function SupplierEarnings() {
  const s = MOCK_SUPPLIER_STATS;
  const released = MOCK_SUPPLIER_ORDERS.filter(o => o.paymentStatus === "released").reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#121212] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#ffc107]/10 blur-[60px] rounded-full pointer-events-none" />
        <p className="text-[12px] font-bold text-[#ffc107] uppercase tracking-wider mb-1 z-10 relative">Total Earned</p>
        <p className="font-extrabold text-[34px] text-white z-10 relative">{formatNaira(s.totalRevenue)}</p>
        <p className="text-[13px] text-white/50 z-10 relative">Across {s.completedOrders} completed orders</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Released to You", value: formatNaira(released), color: "#10b981", bg: "#d1fae5" },
          { label: "In Escrow", value: formatNaira(s.escrowHeld), color: "#f59e0b", bg: "#fef3c7" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl mb-3" style={{ background: card.bg }} />
            <p className="font-extrabold text-[19px] text-[#121212]">{card.value}</p>
            <p className="font-semibold text-[13px] text-zinc-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="font-bold text-[15px] text-[#121212]">Payment History</h3>
        </div>
        <div className="divide-y divide-zinc-50">
          {MOCK_SUPPLIER_ORDERS.filter(o => o.paymentStatus !== "pending").map(order => (
            <div key={order.id} className="flex items-center gap-4 px-5 py-4">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                order.paymentStatus === "released" ? "bg-green-100" : "bg-amber-100")}>
                <Wallet className={cn("w-4.5 h-4.5", order.paymentStatus === "released" ? "text-green-500" : "text-amber-500")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[13px] text-[#121212] truncate">{order.material}</p>
                <p className="text-[11px] text-zinc-400">{order.id}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[14px] text-[#121212]">{formatNaira(order.total)}</p>
                <span className={cn("text-[11px] font-bold",
                  order.paymentStatus === "released" ? "text-green-500" : "text-amber-500")}>
                  {order.paymentStatus === "released" ? "Released" : "In Escrow"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main shell ───────────────────────────────────────────────────

export function SupplierDashboardShell() {
  const [activeTab, setActiveTab] = useState<SupplierTab>("overview");
  const tabTitles: Record<SupplierTab, string> = {
    overview: "Overview", orders: "Incoming Orders",
    inventory: "My Inventory", earnings: "Earnings",
  };

  return (
    <div className="flex h-screen bg-[#F4F4F7] overflow-hidden">
      <SupplierSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-zinc-100 flex items-center px-4 lg:px-8 sticky top-0 z-30">
          <h1 className="font-extrabold text-[18px] lg:text-[20px] text-[#121212]">
            {tabTitles[activeTab]}
          </h1>
          {activeTab === "orders" && MOCK_SUPPLIER_ORDERS.filter(o => o.status === "new").length > 0 && (
            <span className="ml-3 text-[11px] font-bold bg-blue-500 text-white px-2.5 py-1 rounded-full animate-pulse">
              {MOCK_SUPPLIER_ORDERS.filter(o => o.status === "new").length} New
            </span>
          )}
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {activeTab === "overview" && <SupplierOverview setActiveTab={setActiveTab} />}
              {activeTab === "orders" && <SupplierOrders />}
              {activeTab === "inventory" && <SupplierInventory />}
              {activeTab === "earnings" && <SupplierEarnings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
