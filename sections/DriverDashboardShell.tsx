"use client";

/**
 * DriverDashboardShell
 * Full driver (logistics provider) dashboard UI.
 * 🔌 All data is mocked — replace with API calls.
 *
 * Driver flow:
 *   1. See available delivery jobs
 *   2. Accept a job
 *   3. Navigate to pickup → confirm loading
 *   4. Navigate to delivery site → generate OTP for customer
 *   5. Customer enters OTP → delivery confirmed → driver paid
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Navigation,
  Wallet,
  Clock,
  MapPin,
  Phone,
  Truck,
  CheckCircle2,
  Star,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Package,
  Radio,
  Copy,
  ArrowRight,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearSession } from "@/constants/dummyUsers";
import { useRouter } from "next/navigation";
import { NavigateButton, ProofOfDelivery } from "./DriverDeliveryExtras";

type DriverTab = "overview" | "active" | "trips" | "earnings";

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

type TripStatus = "available" | "accepted" | "loading" | "in_transit" | "completed";

interface DriverTrip {
  id: string;
  orderId: string;
  material: string;
  quantity: number;
  pickupAddress: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  distanceKm: number;
  estimatedMinutes: number;
  driverPay: number;
  status: TripStatus;
  completedAt?: string;
  otp?: string;
}

const MOCK_ACTIVE_TRIP: DriverTrip = {
  id: "trip_001",
  orderId: "QL-2024-0089",
  material: "Granite (3/4 Inch)",
  quantity: 25,
  pickupAddress: "Abeokuta Stone Works, Sapon, Abeokuta",
  deliveryAddress: "24 Adeola Odeku Street, Victoria Island, Lagos",
  customerName: "Adebayo Okonkwo",
  customerPhone: "+234 802 345 6789",
  distanceKm: 87,
  estimatedMinutes: 95,
  driverPay: 45000,
  status: "in_transit",
  otp: "847291",
};

const MOCK_AVAILABLE_TRIPS: DriverTrip[] = [
  {
    id: "trip_002",
    orderId: "QL-2024-0091",
    material: "Granite (3/4 Inch)",
    quantity: 50,
    pickupAddress: "Abeokuta Stone Works, Sapon, Abeokuta",
    deliveryAddress: "Lekki Phase 1, Lagos",
    customerName: "Fatima Bello",
    customerPhone: "+234 803 111 2222",
    distanceKm: 102,
    estimatedMinutes: 110,
    driverPay: 62000,
    status: "available",
  },
];

const MOCK_COMPLETED_TRIPS: DriverTrip[] = [
  {
    id: "trip_00a",
    orderId: "QL-2024-0081",
    material: "Sharp Sand",
    quantity: 15,
    pickupAddress: "Lagos Quarry Ltd, Ikorodu",
    deliveryAddress: "24 Adeola Odeku, Victoria Island",
    customerName: "Adebayo Okonkwo",
    customerPhone: "+234 802 345 6789",
    distanceKm: 45,
    estimatedMinutes: 55,
    driverPay: 22000,
    status: "completed",
    completedAt: "2024-05-04T16:30:00Z",
  },
  {
    id: "trip_00b",
    orderId: "QL-2024-0075",
    material: "Limestone Powder",
    quantity: 20,
    pickupAddress: "Ewekoro Cement Quarry, Ogun",
    deliveryAddress: "Km 12, Lekki-Epe Expressway",
    customerName: "Chisom Eze",
    customerPhone: "+234 805 333 4444",
    distanceKm: 68,
    estimatedMinutes: 75,
    driverPay: 35000,
    status: "completed",
    completedAt: "2024-05-01T14:00:00Z",
  },
];

const DRIVER_STATS = {
  totalEarnings: 312000,
  thisWeek: 107000,
  totalTrips: 28,
  rating: 4.7,
  completionRate: 97,
  truckPlate: "LND 742 MU",
};

// ── Trip status config ────────────────────────────────────────────

const TRIP_STATUS_CONFIG: Record<TripStatus, { label: string; color: string; bg: string }> = {
  available:  { label: "Available",  color: "#3b82f6", bg: "#dbeafe" },
  accepted:   { label: "Accepted",   color: "#8b5cf6", bg: "#ede9fe" },
  loading:    { label: "Loading",    color: "#f59e0b", bg: "#fef3c7" },
  in_transit: { label: "En Route",   color: "#f97316", bg: "#ffedd5" },
  completed:  { label: "Completed",  color: "#10b981", bg: "#d1fae5" },
};

// ── Active delivery flow ──────────────────────────────────────────

function ActiveDeliveryTab() {
  const [tripStatus, setTripStatus] = useState<TripStatus>(MOCK_ACTIVE_TRIP.status);
  const [otpCopied, setOtpCopied] = useState(false);
  const trip = MOCK_ACTIVE_TRIP;

  const copyOtp = () => {
    navigator.clipboard.writeText(trip.otp!);
    setOtpCopied(true);
    setTimeout(() => setOtpCopied(false), 2000);
  };

  const statusSteps: { key: TripStatus; label: string }[] = [
    { key: "accepted",   label: "Accepted" },
    { key: "loading",    label: "Loading at Quarry" },
    { key: "in_transit", label: "En Route" },
    { key: "completed",  label: "Delivered" },
  ];
  const currentStepIdx = statusSteps.findIndex(s => s.key === tripStatus);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="bg-[#121212] rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#ffc107]/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-2 mb-2 z-10 relative">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
          <span className="text-[12px] font-bold text-orange-400 uppercase tracking-wide">Active Delivery</span>
        </div>
        <p className="font-extrabold text-[20px] text-white z-10 relative">{trip.material}</p>
        <p className="text-[13px] text-white/50 z-10 relative">{trip.orderId} · {trip.quantity} tons</p>
        <div className="flex items-center gap-4 mt-4 z-10 relative">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#ffc107]" />
            <span className="font-bold text-[14px] text-white">{trip.distanceKm} km</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ffc107]" />
            <span className="font-bold text-[14px] text-white">~{trip.estimatedMinutes} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#ffc107]" />
            <span className="font-bold text-[14px] text-white">{formatNaira(trip.driverPay)}</span>
          </div>
        </div>
      </div>

      {/* Progress timeline */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm px-5 py-4">
        <div className="flex items-center gap-1">
          {statusSteps.map((step, i) => {
            const isDone = i < currentStepIdx;
            const isActive = i === currentStepIdx;
            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all",
                    isDone ? "bg-[#ffc107] text-[#121212]"
                      : isActive ? "bg-[#121212] text-white ring-4 ring-[#121212]/10"
                      : "bg-zinc-100 text-zinc-400"
                  )}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <span className={cn(
                    "text-[9px] font-medium text-center leading-tight hidden sm:block max-w-[60px]",
                    isActive ? "text-[#121212] font-bold" : isDone ? "text-zinc-400" : "text-zinc-300"
                  )}>
                    {step.label}
                  </span>
                </div>
                {i < statusSteps.length - 1 && (
                  <div className="flex-1 h-[2px] mx-1 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-[#ffc107]"
                      initial={{ width: "0%" }}
                      animate={{ width: isDone ? "100%" : "0%" }}
                      transition={{ duration: 0.6 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pickup → Delivery route */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-0.5">
            <div className="w-3 h-3 rounded-full bg-[#ffc107] border-2 border-[#121212]" />
            <div className="w-0.5 h-8 bg-zinc-200" />
            <div className="w-3 h-3 rounded-full bg-[#121212]" />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Pickup</p>
              <p className="font-semibold text-[13px] text-[#121212]">{trip.pickupAddress}</p>
              <p className="font-semibold text-[13px] text-[#121212]">{trip.pickupAddress}</p>
<NavigateButton address={trip.pickupAddress} label="Navigate to Pickup" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Delivery</p>
              <p className="font-semibold text-[13px] text-[#121212]">{trip.deliveryAddress}</p>
            </div>
            <p className="font-semibold text-[13px] text-[#121212]">{trip.deliveryAddress}</p>
<NavigateButton address={trip.deliveryAddress} label="Navigate to Delivery" />
          </div>
        </div>
      </div>

      {/* Customer contact */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-wide mb-3">Customer</p>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-[#ffc107]/20 border-2 border-[#ffc107]/40 flex items-center justify-center">
            <span className="font-bold text-[13px] text-[#ffc107]">
              {trip.customerName.split(" ").map(n => n[0]).join("")}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-[14px] text-[#121212]">{trip.customerName}</p>
            <p className="text-[12px] text-zinc-400">{trip.customerPhone}</p>
          </div>
          <a href={`tel:${trip.customerPhone}`}
            className="w-10 h-10 rounded-xl bg-[#ffc107] flex items-center justify-center shadow-[0_4px_14px_rgba(255,193,7,0.3)] hover:bg-[#e0a800] transition-all">
            <Phone className="w-4.5 h-4.5 text-[#121212]" />
          </a>
        </div>
      </div>

      {/* OTP card — shown when in transit */}
      {tripStatus === "in_transit" && trip.otp && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-5"
        >
          <div className="flex items-start gap-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[14px] text-amber-800">Your Delivery OTP</p>
              <p className="text-[12px] text-amber-600 leading-snug mt-0.5">
                Share this code with the customer after they inspect the delivery.
                {/* 🔌 OTP is generated server-side when driver clicks "Arrived" */}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white border-2 border-amber-300 rounded-xl p-3 text-center">
              <span className="font-extrabold text-[28px] tracking-[0.3em] text-[#121212] font-mono">
                {trip.otp}
              </span>
            </div>
            <button
              onClick={copyOtp}
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
                otpCopied ? "bg-green-500" : "bg-amber-100 hover:bg-amber-200"
              )}
            >
              {otpCopied
                ? <CheckCircle2 className="w-5 h-5 text-white" />
                : <Copy className="w-4.5 h-4.5 text-amber-700" />
              }
            </button>
          </div>
          <p className="text-[11px] text-amber-600 text-center mt-2">
            Customer enters this on their app to release your payment
          </p>
        </motion.div>
      )}

      {/* CTA buttons */}
      <div className="flex gap-3">
        {tripStatus === "accepted" && (
          <button
            onClick={() => setTripStatus("loading")}
            className="flex-1 h-12 rounded-xl bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold text-[14px] flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            Arrived at Quarry — Start Loading
          </button>
        )}
        {tripStatus === "loading" && (
          <button
            onClick={() => setTripStatus("in_transit")}
            className="flex-1 h-12 rounded-xl bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] font-bold text-[14px] flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <Truck className="w-4.5 h-4.5" /> Loading Complete — Depart
          </button>
        )}
       {tripStatus === "in_transit" && (
  <ProofOfDelivery
    orderId={trip.orderId}
    onSubmit={(photos) => {
      setTripStatus("completed");
    }}
  />
)}
        {tripStatus === "completed" && (
          <div className="flex-1 flex flex-col items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <p className="font-bold text-[14px] text-green-700">Delivery Complete!</p>
            <p className="text-[12px] text-green-600">Awaiting customer confirmation to release {formatNaira(trip.driverPay)}</p>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-zinc-300">
        🔌 Status updates sync with the customer's app in real-time via WebSocket
      </p>
    </div>
  );
}

// ── Available jobs tab (overview for drivers without active trip) ──

function AvailableJobs() {
  const [acceptedId, setAcceptedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <Radio className="w-4 h-4 text-blue-500 shrink-0" />
        <p className="text-[13px] text-blue-700 font-medium">
          {MOCK_AVAILABLE_TRIPS.length} delivery job{MOCK_AVAILABLE_TRIPS.length !== 1 ? "s" : ""} available near you
        </p>
      </div>

      {MOCK_AVAILABLE_TRIPS.map(trip => (
        <motion.div key={trip.id}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="font-bold text-[15px] text-[#121212]">{trip.material}</p>
              <p className="text-[12px] text-zinc-400">{trip.quantity} tons · {trip.orderId}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-extrabold text-[16px] text-[#121212]">{formatNaira(trip.driverPay)}</p>
              <p className="text-[11px] text-zinc-400">your pay</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ffc107] mt-1.5 shrink-0" />
              <p className="text-[12px] text-zinc-500">{trip.pickupAddress}</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-[#121212] mt-1.5 shrink-0" />
              <p className="text-[12px] text-zinc-500">{trip.deliveryAddress}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4 text-[12px] text-zinc-400">
            <span className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5" />{trip.distanceKm} km</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />~{trip.estimatedMinutes} min</span>
          </div>
          <button
            onClick={() => setAcceptedId(trip.id)}
            className={cn(
              "w-full h-11 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all",
              acceptedId === trip.id
                ? "bg-green-100 text-green-700 cursor-default"
                : "bg-[#ffc107] hover:bg-[#e0a800] text-[#121212] hover:scale-[1.01]"
            )}
          >
            {acceptedId === trip.id
              ? <><CheckCircle2 className="w-4.5 h-4.5" /> Accepted!</>
              : <>Accept Job <ArrowRight className="w-4.5 h-4.5" /></>
            }
          </button>
        </motion.div>
      ))}
    </div>
  );
}

// ── Trip history tab ──────────────────────────────────────────────

function TripHistory() {
  return (
    <div className="flex flex-col gap-3">
      {MOCK_COMPLETED_TRIPS.map(trip => (
        <div key={trip.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-bold text-[14px] text-[#121212]">{trip.material}</p>
              <p className="text-[12px] text-zinc-400">{trip.orderId} · {trip.quantity} tons</p>
              <div className="flex items-center gap-2 mt-1.5 text-[12px] text-zinc-400">
                <Navigation className="w-3.5 h-3.5" />
                <span>{trip.distanceKm} km</span>
                <span>·</span>
                <span>{formatDate(trip.completedAt!)}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-extrabold text-[15px] text-green-600">{formatNaira(trip.driverPay)}</p>
              <span className="text-[11px] font-bold text-green-500">Paid</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Earnings tab ──────────────────────────────────────────────────

function DriverEarnings() {
  const s = DRIVER_STATS;
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#121212] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#ffc107]/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-2 mb-1">
          {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3.5 h-3.5 text-[#ffc107] fill-[#ffc107]" />)}
          <span className="text-[13px] font-bold text-[#ffc107]">{DRIVER_STATS.rating}</span>
        </div>
        <p className="font-extrabold text-[34px] text-white">{formatNaira(s.totalEarnings)}</p>
        <p className="text-[13px] text-white/50">Total earned · {s.totalTrips} trips</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "This Week", value: formatNaira(s.thisWeek), color: "#10b981", bg: "#d1fae5" },
          { label: "Completion Rate", value: `${s.completionRate}%`, color: "#3b82f6", bg: "#dbeafe" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl mb-3" style={{ background: card.bg }} />
            <p className="font-extrabold text-[19px]" style={{ color: card.color }}>{card.value}</p>
            <p className="text-[13px] text-zinc-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="font-bold text-[15px] text-[#121212]">Recent Earnings</h3>
        </div>
        <div className="divide-y divide-zinc-50">
          {MOCK_COMPLETED_TRIPS.map(trip => (
            <div key={trip.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <Truck className="w-4.5 h-4.5 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[13px] text-[#121212] truncate">{trip.material}</p>
                <p className="text-[11px] text-zinc-400">{trip.distanceKm} km · {formatDate(trip.completedAt!)}</p>
              </div>
              <p className="font-extrabold text-[14px] text-green-600 shrink-0">{formatNaira(trip.driverPay)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────

function DriverSidebar({ activeTab, setActiveTab }: { activeTab: DriverTab; setActiveTab: (t: DriverTab) => void }) {
  const router = useRouter();
  const nav = [
    { id: "overview" as DriverTab, label: "Overview", icon: LayoutGrid },
    { id: "active" as DriverTab, label: "Active Delivery", icon: Truck, badge: 1 },
    { id: "trips" as DriverTab, label: "Trip History", icon: Clock },
    { id: "earnings" as DriverTab, label: "Earnings", icon: Wallet },
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
            <p className="text-[10px] text-white/40">Driver Portal</p>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-5 px-3 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
        <span className="text-[18px]">🚛</span>
        <div>
          <p className="text-[11px] font-bold text-orange-400">Emeka Okafor</p>
          <p className="text-[10px] text-white/40">{DRIVER_STATS.truckPlate}</p>
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
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse",
                  isActive ? "bg-[#121212]/20 text-[#121212]" : "bg-orange-500 text-white")}>
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
            <span className="font-bold text-[13px] text-[#ffc107]">EO</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[13px] text-white truncate">Emeka Okafor</p>
            <p className="text-[11px] text-white/40">Driver · ⭐ {DRIVER_STATS.rating}</p>
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

// ── Driver overview ───────────────────────────────────────────────

function DriverOverview({ setActiveTab }: { setActiveTab: (t: DriverTab) => void }) {
  const s = DRIVER_STATS;
  return (
    <div className="flex flex-col gap-5">
      {/* Active trip banner */}
      <div className="bg-[#121212] rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0 z-10">
          <Truck className="w-6 h-6 text-orange-400" />
        </div>
        <div className="flex-1 z-10">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-[11px] font-bold text-orange-400 uppercase">Active Delivery</span>
          </div>
          <p className="font-bold text-[14px] text-white">En route to Victoria Island</p>
          <p className="text-[12px] text-white/50">{MOCK_ACTIVE_TRIP.material} · {MOCK_ACTIVE_TRIP.quantity} tons</p>
        </div>
        <button onClick={() => setActiveTab("active")}
          className="shrink-0 z-10 flex items-center gap-1 font-bold text-[13px] text-[#ffc107]">
          View <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Total Earnings", value: formatNaira(s.totalEarnings), icon: Wallet, color: "#10b981", bg: "#d1fae5" },
          { label: "This Week", value: formatNaira(s.thisWeek), icon: TrendingUp, color: "#3b82f6", bg: "#dbeafe" },
          { label: "Total Trips", value: s.totalTrips.toString(), icon: Truck, color: "#f97316", bg: "#ffedd5" },
          { label: "Rating", value: `${s.rating} ★`, icon: Star, color: "#ffc107", bg: "#fef9c3" },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: card.bg }}>
                <Icon className="w-4.5 h-4.5" style={{ color: card.color }} />
              </div>
              <p className="font-extrabold text-[19px] text-[#121212]">{card.value}</p>
              <p className="text-[12px] text-zinc-500 mt-0.5">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Available jobs */}
      {MOCK_AVAILABLE_TRIPS.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-[13px] text-blue-700">
              {MOCK_AVAILABLE_TRIPS.length} new job available nearby
            </p>
            <p className="text-[11px] text-blue-500">Earn {formatNaira(MOCK_AVAILABLE_TRIPS[0].driverPay)} · {MOCK_AVAILABLE_TRIPS[0].distanceKm} km</p>
          </div>
          <button onClick={() => setActiveTab("overview")}
            className="shrink-0 px-3 py-1.5 bg-blue-500 text-white font-bold text-[12px] rounded-lg hover:bg-blue-600 transition-colors">
            View Job
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main shell ───────────────────────────────────────────────────

export function DriverDashboardShell() {
  const [activeTab, setActiveTab] = useState<DriverTab>("overview");
  const tabTitles: Record<DriverTab, string> = {
    overview: "Driver Dashboard", active: "Active Delivery",
    trips: "Trip History", earnings: "Earnings",
  };

  return (
    <div className="flex h-screen bg-[#F4F4F7] overflow-hidden">
      <DriverSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-zinc-100 flex items-center px-4 lg:px-8 sticky top-0 z-30">
          <h1 className="font-extrabold text-[18px] lg:text-[20px] text-[#121212]">
            {tabTitles[activeTab]}
          </h1>
          {activeTab === "active" && (
            <div className="ml-3 flex items-center gap-1.5 text-[12px] font-bold text-orange-600">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              Live
            </div>
          )}
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {activeTab === "overview" && <DriverOverview setActiveTab={setActiveTab} />}
              {activeTab === "active" && <ActiveDeliveryTab />}
              {activeTab === "trips" && <TripHistory />}
              {activeTab === "earnings" && <DriverEarnings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
