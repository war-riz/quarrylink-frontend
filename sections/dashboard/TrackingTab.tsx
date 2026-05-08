"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Navigation,
  Phone,
  Star,
  Clock,
  Truck,
  Package,
  CheckCircle2,
  Radio,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Order } from "@/constants/dashboardConstants";

interface TrackingTabProps {
  activeOrder: Order | null;
}

export function TrackingTab({ activeOrder }: TrackingTabProps) {
  if (!activeOrder) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-5">
          <Navigation className="w-9 h-9 text-zinc-300" />
        </div>
        <p className="font-bold text-[17px] text-zinc-400">No Active Delivery</p>
        <p className="text-[13px] text-zinc-300 mt-1 max-w-xs">
          Live tracking will appear here when you have an order in transit.
        </p>
      </div>
    );
  }

  const driver = activeOrder.driver!;

  return (
    <div className="flex flex-col gap-5">
      {/* Live indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="font-bold text-[13px] text-orange-700">Live Tracking Active</span>
        </div>
        <p className="text-[12px] text-zinc-400">Updates every 30s</p>
      </div>

      {/* Map placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100"
      >
        {/* Simulated map background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8f4ea] to-[#d4eadf]">
          {/* Grid lines to suggest map */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            {Array.from({ length: 10 }).map((_, i) => (
              <g key={i}>
                <line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="#4a9a5c" strokeWidth="0.3" />
                <line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#4a9a5c" strokeWidth="0.3" />
              </g>
            ))}
          </svg>

          {/* Simulated roads */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
            <path d="M 0 150 Q 100 130 200 150 T 400 160" fill="none" stroke="white" strokeWidth="8" opacity="0.8" />
            <path d="M 0 150 Q 100 130 200 150 T 400 160" fill="none" stroke="#ccc" strokeWidth="4" strokeDasharray="8 4" opacity="0.6" />
            <path d="M 150 0 Q 160 100 150 150 T 170 300" fill="none" stroke="white" strokeWidth="6" opacity="0.6" />
            <path d="M 250 50 Q 200 100 180 150 T 240 250" fill="none" stroke="white" strokeWidth="5" opacity="0.5" />
          </svg>

          {/* Destination pin */}
          <div className="absolute right-16 top-10 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#121212] border-2 border-white shadow-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-[#ffc107]" />
            </div>
            <div className="w-1.5 h-3 bg-[#121212] rounded-b-full" />
            <div className="mt-1 bg-[#121212] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap shadow">
              Your Site
            </div>
          </div>

          {/* Dashed route line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
            <path
              d="M 80 200 Q 180 150 310 60"
              fill="none"
              stroke="#ffc107"
              strokeWidth="3"
              strokeDasharray="8 4"
              opacity="0.9"
            />
          </svg>

          {/* Truck pin (animated) */}
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-16 bottom-16 flex flex-col items-center"
          >
            <div className="w-10 h-10 rounded-full bg-[#ffc107] border-3 border-white shadow-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-[#121212]" />
            </div>
            {/* Pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 w-10 h-10 rounded-full bg-[#ffc107]/40"
            />
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-[#ffc107]" />
          </motion.div>
        </div>

        {/* ETA overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="font-extrabold text-[15px] text-[#121212]">
                  ETA {activeOrder.eta}
                </p>
                <p className="text-[11px] text-zinc-400">About 45 min away</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[12px] font-bold text-orange-600">
              <Radio className="w-3.5 h-3.5" />
              Live
            </div>
          </div>
        </div>
      </motion.div>

      {/* Driver info */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <h3 className="font-bold text-[13px] text-zinc-400 uppercase tracking-wide mb-4">
          Your Driver
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-[#ffc107]/20 border-2 border-[#ffc107]/40 flex items-center justify-center shrink-0">
            <span className="font-extrabold text-[18px] text-[#ffc107]">
              {driver.name.split(" ").map((n) => n[0]).join("")}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-[17px] text-[#121212]">{driver.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Star className="w-3.5 h-3.5 text-[#ffc107] fill-[#ffc107]" />
              <span className="font-bold text-[13px] text-[#121212]">{driver.rating}</span>
              <span className="text-[12px] text-zinc-400">· {driver.truckPlate}</span>
            </div>
          </div>
          <a
            href={`tel:${driver.phone}`}
            className="w-11 h-11 rounded-xl bg-[#ffc107] flex items-center justify-center shadow-[0_4px_14px_rgba(255,193,7,0.3)] hover:bg-[#e0a800] transition-colors"
          >
            <Phone className="w-5 h-5 text-[#121212]" />
          </a>
        </div>

        {/* Order summary */}
        <div className="flex items-start gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
          <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[13px] text-[#121212]">
              {activeOrder.material} · {activeOrder.quantity} tons
            </p>
            <p className="text-[12px] text-zinc-400 mt-0.5">
              {activeOrder.deliveryAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Delivery instructions */}
      <div className="bg-[#ffc107]/10 border border-[#ffc107]/30 rounded-2xl p-5">
        <h3 className="font-bold text-[13px] text-[#121212] mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#ffc107]" />
          When Your Delivery Arrives
        </h3>
        <div className="flex flex-col gap-2">
          {[
            "Verify quantity before signing",
            "Check material quality",
            "Enter your OTP code or sign digitally",
            "Take photos of delivery site",
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#ffc107] flex items-center justify-center shrink-0">
                <span className="font-bold text-[10px] text-[#121212]">{i + 1}</span>
              </div>
              <p className="text-[13px] text-zinc-600">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
