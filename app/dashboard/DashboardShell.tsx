"use client";

import { AnimatePresence, motion } from "framer-motion";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { NotificationProvider } from "@/components/dashboard/NotificationSystem";
import { OverviewTab } from "@/sections/dashboard/OverviewTab";
import { BrowseTab } from "@/sections/dashboard/BrowseTab";
import { OrdersTab } from "@/sections/dashboard/OrdersTab";
import { TrackingTab } from "@/sections/dashboard/TrackingTab";
import { PaymentsTab } from "@/sections/dashboard/PaymentsTab";
import { ProfileTab } from "@/sections/dashboard/ProfileTab";
import { useDashboard } from "@/hooks/useDashboard";

export function DashboardShell() {
  const dash = useDashboard();

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-[#F4F4F7] overflow-hidden">
        {/* Sidebar */}
        <DashboardSidebar
          activeTab={dash.activeTab}
          setActiveTab={dash.setActiveTab}
          isMobileOpen={dash.isSidebarOpen}
          onClose={() => dash.setIsSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopbar
            activeTab={dash.activeTab}
            onMenuClick={() => dash.setIsSidebarOpen(true)}
          />

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={dash.activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {dash.activeTab === "overview" && (
                  <OverviewTab
                    setActiveTab={dash.setActiveTab}
                    setSelectedOrder={dash.setSelectedOrder}
                    stats={dash.stats}
                    orders={dash.orders}
                    activeOrder={dash.activeOrder}
                  />
                )}
                {dash.activeTab === "browse" && (
                  <BrowseTab
                    materials={dash.materials}
                    searchQuery={dash.searchQuery}
                    selectedCategory={dash.selectedCategory}
                    setSearchQuery={dash.setSearchQuery}
                    setSelectedCategory={dash.setSelectedCategory}
                    isOrderModalOpen={dash.isOrderModalOpen}
                    orderForm={dash.orderForm}
                    setOrderForm={dash.setOrderForm}
                    openOrderModal={dash.openOrderModal}
                    closeOrderModal={dash.closeOrderModal}
                    placeOrder={dash.placeOrder}
                  />
                )}
                {dash.activeTab === "orders" && (
                  <OrdersTab
                    orders={dash.orders}
                    selectedOrder={dash.selectedOrder}
                    setSelectedOrder={dash.setSelectedOrder}
                  />
                )}
                {dash.activeTab === "tracking" && (
                  <TrackingTab activeOrder={dash.activeOrder} />
                )}
                {dash.activeTab === "payments" && <PaymentsTab orders={dash.orders} />}
                {dash.activeTab === "profile" && <ProfileTab stats={dash.stats} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
