"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Package,
  Truck,
  X,
  ArrowRight,
  ChevronDown,
  Minus,
  Plus,
  CreditCard,
  Landmark,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Material,
  MATERIAL_CATEGORIES,
  OrderFormState,
} from "@/constants/dashboardConstants";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ── Order Modal ──────────────────────────────────────────────────

function OrderModal({
  form,
  setForm,
  onClose,
  onPlace,
}: {
  form: OrderFormState;
  setForm: React.Dispatch<React.SetStateAction<OrderFormState>>;
  onClose: () => void;
  onPlace: () => Promise<void>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const m = form.material!;

  const materialCost = m.pricePerTon * form.quantity;
  const deliveryFee = Math.round(materialCost * 0.12);
  const platformFee = Math.round(materialCost * 0.025);
  const total = materialCost + deliveryFee + platformFee;

  const handleSubmit = async () => {
    if (form.step === "details") {
      setForm((p) => ({ ...p, step: "payment" }));
      return;
    }
    if (form.step === "payment") {
      setForm((p) => ({ ...p, step: "confirm" }));
      return;
    }
    if (form.step === "confirm") {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 2000));
      setIsLoading(false);
      onPlace();
    }
  };

  const stepLabel =
    form.step === "details"
      ? "Order Details"
      : form.step === "payment"
      ? "Payment"
      : form.step === "confirm"
      ? "Confirm Order"
      : "Order Placed!";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={form.step !== "success" ? onClose : undefined} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, type: "spring", damping: 30 }}
        className="relative bg-white w-full sm:max-w-[500px] rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-zinc-100 flex items-center justify-between px-6 py-4 z-10">
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              {form.step === "success" ? "🎉 " : ""}
              {stepLabel}
            </p>
            <h3 className="font-extrabold text-[18px] text-[#121212] leading-tight">
              {m.name}
            </h3>
          </div>
          {form.step !== "success" && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          )}
        </div>

        <div className="p-6">
          {/* SUCCESS STATE */}
          {form.step === "success" && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center text-center py-4"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="font-extrabold text-[24px] text-[#121212] mb-2">
                Order Placed!
              </h3>
              <p className="text-[14px] text-zinc-500 leading-relaxed max-w-[280px] mb-6">
                Your order has been sent to {m.supplier.name}. They'll confirm shortly.
              </p>
              <div className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-left mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[13px] text-zinc-500">Order Total</span>
                  <span className="font-extrabold text-[16px] text-[#121212]">
                    {formatNaira(total)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-zinc-400">Held in escrow until delivery</span>
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full h-12 bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold rounded-xl transition-all"
              >
                Track My Order
              </button>
            </motion.div>
          )}

          {/* DETAILS STEP */}
          {form.step === "details" && (
            <div className="flex flex-col gap-5">
              {/* Material summary */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                <div className="flex-1">
                  <p className="font-bold text-[14px] text-[#121212]">{m.name}</p>
                  <p className="text-[12px] text-zinc-500">
                    {m.supplier.name} · {m.supplier.location}
                  </p>
                  <p className="font-bold text-[13px] text-[#ffc107] mt-1">
                    {formatNaira(m.pricePerTon)}/ton
                  </p>
                </div>
                {m.supplier.verified && (
                  <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                )}
              </div>

              {/* Quantity */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-[#121212]">
                  Quantity (tons) · Min {m.minOrder} tons
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        quantity: Math.max(m.minOrder, p.quantity - 1),
                      }))
                    }
                    className="w-11 h-11 rounded-xl border-2 border-zinc-200 flex items-center justify-center hover:border-zinc-300 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-zinc-500" />
                  </button>
                  <input
                    type="number"
                    min={m.minOrder}
                    value={form.quantity}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        quantity: Math.max(m.minOrder, parseInt(e.target.value) || m.minOrder),
                      }))
                    }
                    className="flex-1 h-11 rounded-xl border-2 border-zinc-200 text-center font-bold text-[16px] text-[#121212] outline-none focus:border-[#ffc107] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, quantity: p.quantity + 1 }))
                    }
                    className="w-11 h-11 rounded-xl border-2 border-zinc-200 flex items-center justify-center hover:border-zinc-300 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-zinc-500" />
                  </button>
                </div>
              </div>

              {/* Delivery address */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-[#121212]">
                  Delivery Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, address: e.target.value }))
                    }
                    className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 pl-10 pr-4 py-3 text-[14px] text-[#121212] outline-none focus:border-[#ffc107] focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                {[
                  { label: `${form.quantity} tons × ${formatNaira(m.pricePerTon)}`, value: formatNaira(materialCost) },
                  { label: "Delivery fee (est.)", value: formatNaira(deliveryFee) },
                  { label: "Platform fee (2.5%)", value: formatNaira(platformFee) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-[13px]">
                    <span className="text-zinc-500">{label}</span>
                    <span className="font-semibold text-[#121212]">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-zinc-200">
                  <span className="font-bold text-[14px] text-[#121212]">Total</span>
                  <span className="font-extrabold text-[16px] text-[#121212]">
                    {formatNaira(total)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT STEP */}
          {form.step === "payment" && (
            <div className="flex flex-col gap-4">
              <p className="text-[13px] text-zinc-500 leading-relaxed">
                Your payment goes to a secure escrow and is only released after you confirm delivery.
              </p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-100">
                <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-[12px] text-green-700 font-medium">
                  Protected by QuarryLink Escrow — pay with confidence
                </p>
              </div>
              {[
                { id: "card", label: "Pay with Card", sub: "Visa, Mastercard, Verve", Icon: CreditCard },
                { id: "bank_transfer", label: "Bank Transfer", sub: "USSD or direct transfer", Icon: Landmark },
              ].map(({ id, label, sub, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      paymentMethod: id as "card" | "bank_transfer",
                    }))
                  }
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                    form.paymentMethod === id
                      ? "border-[#ffc107] bg-[#fffdf0]"
                      : "border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    form.paymentMethod === id ? "bg-[#ffc107]/20" : "bg-zinc-100"
                  )}>
                    <Icon className={cn("w-5 h-5", form.paymentMethod === id ? "text-[#ffc107]" : "text-zinc-400")} />
                  </div>
                  <div>
                    <p className="font-bold text-[14px] text-[#121212]">{label}</p>
                    <p className="text-[12px] text-zinc-400">{sub}</p>
                  </div>
                  {form.paymentMethod === id && (
                    <CheckCircle2 className="w-5 h-5 text-[#ffc107] ml-auto" />
                  )}
                </button>
              ))}
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="flex justify-between font-bold text-[15px]">
                  <span>Total to pay</span>
                  <span className="text-[#121212]">{formatNaira(total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* CONFIRM STEP */}
          {form.step === "confirm" && (
            <div className="flex flex-col gap-4">
              {[
                { label: "Material", value: m.name },
                { label: "Quantity", value: `${form.quantity} tons` },
                { label: "Supplier", value: m.supplier.name },
                { label: "Delivery to", value: form.address },
                { label: "Payment", value: form.paymentMethod === "card" ? "Card Payment" : "Bank Transfer" },
                { label: "Total (escrow)", value: formatNaira(total) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-start gap-4 pb-3 border-b border-zinc-100 last:border-none"
                >
                  <span className="text-[13px] text-zinc-400 shrink-0">{label}</span>
                  <span className="font-semibold text-[13px] text-[#121212] text-right">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        {form.step !== "success" && (
          <div className="sticky bottom-0 bg-white border-t border-zinc-100 px-6 py-4">
            <button
              onClick={handleSubmit}
              disabled={form.step === "payment" && !form.paymentMethod || isLoading}
              className={cn(
                "w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all duration-200",
                form.step === "payment" && !form.paymentMethod
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                  : "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] shadow-[0_4px_14px_rgba(255,193,7,0.35)] hover:scale-[1.01] active:scale-[0.99]",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Processing...</>
              ) : form.step === "details" ? (
                <>Continue to Payment <ArrowRight className="w-4.5 h-4.5" /></>
              ) : form.step === "payment" ? (
                <>Review Order <ArrowRight className="w-4.5 h-4.5" /></>
              ) : (
                <>Place Order — {formatNaira(total)}</>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Material card ─────────────────────────────────────────────────

function MaterialCard({
  material,
  onOrder,
}: {
  material: Material;
  onOrder: (m: Material) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image placeholder */}
      <div className="relative w-full aspect-[16/9] bg-zinc-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center">
          <Package className="w-10 h-10 text-zinc-400" />
        </div>
        {!material.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="font-bold text-white text-[13px]">Out of Stock</span>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1">
          <span className="font-bold text-[11px] text-zinc-700">{material.category}</span>
        </div>
        {material.supplier.verified && (
          <div className="absolute top-3 right-3 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-[15px] text-[#121212] mb-1">{material.name}</h3>
        <p className="text-[12px] text-zinc-400 leading-snug mb-3">
          {material.description}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="text-[12px] text-zinc-500 truncate">
            {material.supplier.name} · {material.supplier.location}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Star className="w-3.5 h-3.5 text-[#ffc107] fill-[#ffc107] shrink-0" />
          <span className="text-[12px] font-bold text-[#121212]">
            {material.supplier.rating}
          </span>
          <span className="text-[12px] text-zinc-400">
            ({material.supplier.totalOrders} orders)
          </span>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-zinc-400">
            <Truck className="w-3 h-3" />
            {material.deliveryDays}d
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-extrabold text-[17px] text-[#121212]">
              {formatNaira(material.pricePerTon)}
            </p>
            <p className="text-[11px] text-zinc-400">per ton · min {material.minOrder}t</p>
          </div>
          <button
            onClick={() => material.available && onOrder(material)}
            disabled={!material.available}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-[13px] transition-all",
              material.available
                ? "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] shadow-[0_4px_14px_rgba(255,193,7,0.25)] hover:scale-[1.02]"
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            )}
          >
            Order
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Browse Tab ────────────────────────────────────────────────────

interface BrowseTabProps {
  materials: Material[];
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (v: string) => void;
  setSelectedCategory: (v: string) => void;
  isOrderModalOpen: boolean;
  orderForm: OrderFormState;
  setOrderForm: React.Dispatch<React.SetStateAction<OrderFormState>>;
  openOrderModal: (m: Material) => void;
  closeOrderModal: () => void;
  placeOrder: () => Promise<void>;
}

export function BrowseTab({
  materials,
  searchQuery,
  selectedCategory,
  setSearchQuery,
  setSelectedCategory,
  isOrderModalOpen,
  orderForm,
  setOrderForm,
  openOrderModal,
  closeOrderModal,
  placeOrder,
}: BrowseTabProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search materials, suppliers, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-xl border-2 border-zinc-200 bg-white pl-10 pr-4 text-[14px] text-[#121212] placeholder:text-zinc-400 outline-none focus:border-[#ffc107] transition-colors"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {MATERIAL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-xl font-semibold text-[13px] transition-all",
              selectedCategory === cat
                ? "bg-[#121212] text-white"
                : "bg-white border-2 border-zinc-200 text-zinc-500 hover:border-zinc-300"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-[13px] text-zinc-400">
        {materials.length} material{materials.length !== 1 ? "s" : ""} available
      </p>

      {/* Grid */}
      {materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="w-12 h-12 text-zinc-200 mb-4" />
          <p className="font-bold text-[15px] text-zinc-400">No materials found</p>
          <p className="text-[13px] text-zinc-300 mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {materials.map((m) => (
            <MaterialCard key={m.id} material={m} onOrder={openOrderModal} />
          ))}
        </div>
      )}

      {/* Order modal */}
      <AnimatePresence>
        {isOrderModalOpen && orderForm.material && (
          <OrderModal
            form={orderForm}
            setForm={setOrderForm}
            onClose={closeOrderModal}
            onPlace={placeOrder}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
