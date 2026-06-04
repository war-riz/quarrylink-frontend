"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Bell,
  Lock,
  ChevronRight,
  Edit3,
  Star,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface ProfileTabProps {
  stats: {
    totalOrders: number;
    totalSpent: number;
    completedOrders: number;
  };
}

export function ProfileTab({ stats }: ProfileTabProps) {
  const { user, profile, initials, displayName } = useCurrentUser();

  const companyName  = (profile as any)?.company_name  || "";
  const city         = (profile as any)?.city          || "";
  const state        = (profile as any)?.state         || "";
  const address      = city ? `${city}${state ? `, ${state}` : ""}` : "";
  const memberSince  = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-NG", { month: "long", year: "numeric" })
    : "—";

  const settings = [
    { label: "Notification Preferences", sub: "Email, SMS, push alerts",   icon: Bell,        color: "#3b82f6" },
    { label: "Change Password",           sub: "Update your credentials",   icon: Lock,        color: "#8b5cf6" },
    { label: "KYC & Verification",        sub: user?.is_verified ? "Identity verified ✓" : "Not yet verified", icon: ShieldCheck, color: "#10b981" },
  ];

  const contactRows = [
    companyName && { icon: Building2, label: "Company",  value: companyName },
    user?.email       && { icon: Mail,      label: "Email",    value: user.email },
    user?.phone_number && { icon: Phone,    label: "Phone",    value: user.phone_number },
    address           && { icon: MapPin,    label: "Location", value: address },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[];

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
              <span className="font-extrabold text-[22px] text-[#ffc107]">{initials}</span>
            </div>
            {user?.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#121212] flex items-center justify-center">
                <ShieldCheck className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-extrabold text-[20px] text-white">{displayName || "—"}</h2>
            {companyName && <p className="text-[13px] text-white/50">{companyName}</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-[#ffc107]/20 border border-[#ffc107]/40 text-[#ffc107] text-[11px] font-bold px-2.5 py-1 rounded-full">
                <Star className="w-2.5 h-2.5" />
                Customer
              </span>
              {user?.is_verified && (
                <span className="inline-flex items-center gap-1 bg-green-500/20 border border-green-500/30 text-green-400 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  KYC Verified
                </span>
              )}
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
          { label: "Orders",    value: stats.totalOrders.toString() },
          { label: "Total Spent", value: formatNaira(stats.totalSpent) },
          { label: "Completed", value: stats.completedOrders.toString() },
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
      {contactRows.length > 0 && (
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
          {contactRows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4 px-5 py-4 border-b border-zinc-50 last:border-none">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">{label}</p>
                <p className="font-semibold text-[14px] text-[#121212] mt-0.5 break-all">{value}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

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
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "20" }}>
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

      <p className="text-center text-[12px] text-zinc-300 pb-4">Member since {memberSince}</p>
    </div>
  );
}