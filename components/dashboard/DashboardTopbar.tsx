"use client";

import { Menu } from "lucide-react";
import { DashboardTab } from "@/constants/dashboardConstants";
import { NotificationCenter } from "@/components/dashboard/NotificationSystem";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNotifications } from "@/hooks/useNotifications";

const TAB_TITLES: Record<DashboardTab, string> = {
  overview: "Dashboard",
  browse: "Browse Materials",
  orders: "My Orders",
  tracking: "Live Tracking",
  payments: "Payments",
  profile: "Profile",
};



interface DashboardTopbarProps {
  activeTab: DashboardTab;
  onMenuClick: () => void;
}

export function DashboardTopbar({ activeTab, onMenuClick }: DashboardTopbarProps) {
  const { initials } = useCurrentUser();
const { unreadCount } = useNotifications();
  return (
    <header className="h-16 bg-white border-b border-zinc-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 text-zinc-600 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-extrabold text-[18px] lg:text-[20px] text-[#121212]">
            {TAB_TITLES[activeTab]}
          </h1>
          <p className="hidden sm:block text-[12px] text-zinc-400 font-normal">
            {new Date().toLocaleDateString("en-NG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Real notification center with bell + dropdown + toasts */}
        <NotificationCenter />

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[#ffc107]/20 border-2 border-[#ffc107]/40 flex items-center justify-center">
  <span className="font-bold text-[12px] text-[#ffc107]">{initials}</span>
</div>
      </div>
    </header>
  );
}
