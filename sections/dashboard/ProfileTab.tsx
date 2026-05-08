"use client";

import { motion } from "framer-motion";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Bell,
  Lock,
  ChevronRight,
  Edit3,
  Badge,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_STATS } from "@/constants/dashboardConstants";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

const PROFILE = {
  name: "Adebayo Okonkwo",
  company: "Skyline Construction Ltd",
  email: "adebayo@skylineconstruction.ng",
  phone: "+234 802 345 6789",
  address: "24 Adeola Odeku Street, Victoria Island, Lagos",
  role: "Customer",
  kycStatus: "verified",
  memberSince: "January 2024",
};

export function ProfileTab() {
  const settings = [
    { label: "Notification Preferences", sub: "Email, SMS, push alerts", icon: Bell, color: "#3b82f6" },
    { label: "Change Password", sub: "Update your login credentials", icon: Lock, color: "#8b5cf6" },
    { label: "KYC & Verification", sub: "Identity verified ✓", icon: ShieldCheck, color: "#10b981" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#121212] rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#ffc107]/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex items-start gap-5 z-10 relative">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[#ffc107]/20 border-2 border-[#ffc107]/40 flex items-center justify-center shrink-0">
              <span className="font-extrabold text-[22px] text-[#ffc107]">AO</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#121212] flex items-center justify-center">
              <ShieldCheck className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="font-extrabold text-[20px] text-white">
              {PROFILE.name}
            </h2>
            <p className="text-[13px] text-white/50">{PROFILE.company}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 bg-[#ffc107]/20 border border-[#ffc107]/40 text-[#ffc107] text-[11px] font-bold px-2.5 py-1 rounded-full">
                <Star className="w-2.5 h-2.5" />
                {PROFILE.role}
              </span>
              <span className="inline-flex items-center gap-1 bg-green-500/20 border border-green-500/30 text-green-400 text-[11px] font-bold px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-2.5 h-2.5" />
                KYC Verified
              </span>
            </div>
          </div>
          <button className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors z-10">
            <Edit3 className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </motion.div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Orders", value: MOCK_STATS.totalOrders.toString() },
          { label: "Total Spent", value: formatNaira(MOCK_STATS.totalSpent) },
          { label: "Completed", value: MOCK_STATS.completedOrders.toString() },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className="bg-white rounded-2xl border border-zinc-100 p-4 text-center shadow-sm"
          >
            <p className="font-extrabold text-[17px] text-[#121212]">{s.value}</p>
            <p className="text-[12px] text-zinc-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Contact details */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-zinc-50">
          <h3 className="font-bold text-[14px] text-zinc-400 uppercase tracking-wide">
            Contact Information
          </h3>
        </div>
        {[
          { icon: Building2, label: "Company", value: PROFILE.company },
          { icon: Mail, label: "Email", value: PROFILE.email },
          { icon: Phone, label: "Phone", value: PROFILE.phone },
          { icon: MapPin, label: "Address", value: PROFILE.address },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-4 px-5 py-4 border-b border-zinc-50 last:border-none">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                {label}
              </p>
              <p className="font-semibold text-[14px] text-[#121212] mt-0.5 break-all">
                {value}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-zinc-50">
          <h3 className="font-bold text-[14px] text-zinc-400 uppercase tracking-wide">
            Account Settings
          </h3>
        </div>
        {settings.map(({ label, sub, icon: Icon, color }) => (
          <button
            key={label}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-none text-left"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: color + "20" }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[14px] text-[#121212]">{label}</p>
              <p className="text-[12px] text-zinc-400">{sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-300" />
          </button>
        ))}
      </motion.div>

      <p className="text-center text-[12px] text-zinc-300 pb-4">
        Member since {PROFILE.memberSince}
      </p>
    </div>
  );
}
