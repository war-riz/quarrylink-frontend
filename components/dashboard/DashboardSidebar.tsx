"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Search,
  Package,
  MapPin,
  CreditCard,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV, DashboardTab } from "@/constants/dashboardConstants";
import { siteConfig } from "@/constants/navigation";
import { clearSession } from "@/constants/dummyUsers";

const iconMap: Record<string, React.ElementType> = {
  grid: LayoutGrid,
  search: Search,
  package: Package,
  "map-pin": MapPin,
  "credit-card": CreditCard,
  user: User,
};

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  isMobileOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  isMobileOpen,
  onClose,
}: DashboardSidebarProps) {
  const router = useRouter();

  const handleSignOut = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[260px] bg-[#121212] flex flex-col z-50 transition-transform duration-300",
          "lg:translate-x-0 lg:static lg:z-auto",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 pt-6 pb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-[52px] h-8 rounded-[6px] bg-[#ffc107] overflow-hidden">
              <Image
                src="/images/logo.png"
                alt={siteConfig.name}
                fill
                sizes="52px"
                className="object-contain p-1"
              />
            </div>
            <span className="font-bold text-[18px] text-white">
              {siteConfig.name}
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KYC Badge */}
        <div className="mx-4 mb-6 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
          <div>
            <p className="text-[11px] font-bold text-green-400">
              Identity Verified
            </p>
            <p className="text-[10px] text-white/40">Full access unlocked</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 flex flex-col gap-1">
          {DASHBOARD_NAV.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group",
                  isActive
                    ? "bg-[#ffc107] text-[#121212]"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "w-4.5 h-4.5 shrink-0",
                      isActive ? "text-[#121212]" : "text-white/40 group-hover:text-white"
                    )}
                  />
                )}
                <span className="font-semibold text-[14px]">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto text-[#121212]/50" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User profile bottom */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-[#ffc107]/20 border-2 border-[#ffc107]/40 flex items-center justify-center shrink-0">
              <span className="font-bold text-[13px] text-[#ffc107]">AO</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[13px] text-white truncate">
                Adebayo Okonkwo
              </p>
              <p className="text-[11px] text-white/40 truncate">Customer</p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="text-white/30 hover:text-white/70 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}