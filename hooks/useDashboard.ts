"use client";

import { useState, useCallback } from "react";
import {
  DashboardTab,
  Material,
  Order,
  OrderStatus,
  MOCK_MATERIALS,
  MOCK_ORDERS,
  MOCK_STATS,
} from "@/constants/dashboardConstants";

export interface OrderFormState {
  material: Material | null;
  quantity: number;
  address: string;
  paymentMethod: "card" | "bank_transfer" | "";
  step: "details" | "payment" | "confirm" | "success";
}

export function useDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Order form state
  const [orderForm, setOrderForm] = useState<OrderFormState>({
    material: null,
    quantity: 1,
    address: "",
    paymentMethod: "",
    step: "details",
  });

  // Derived
  const filteredMaterials = MOCK_MATERIALS.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.supplier.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openOrderModal = useCallback((material: Material) => {
    setOrderForm({
      material,
      quantity: material.minOrder,
      address: "24 Adeola Odeku Street, Victoria Island, Lagos",
      paymentMethod: "",
      step: "details",
    });
    setIsOrderModalOpen(true);
  }, []);

  const closeOrderModal = useCallback(() => {
    setIsOrderModalOpen(false);
  }, []);

  const viewOrder = useCallback((order: Order) => {
    setSelectedOrder(order);
    setActiveTab("orders");
  }, []);

  const placeOrder = useCallback(async () => {
    setOrderForm((prev) => ({ ...prev, step: "success" }));
    // In real app: await createOrder(...)
  }, []);

  return {
    // State
    activeTab,
    searchQuery,
    selectedCategory,
    selectedOrder,
    isOrderModalOpen,
    isSidebarOpen,
    orderForm,

    // Data
    materials: filteredMaterials,
    orders: MOCK_ORDERS,
    stats: MOCK_STATS,
    activeOrder: MOCK_ORDERS.find((o) => o.status === "in_transit") ?? null,

    // Actions
    setActiveTab,
    setSearchQuery,
    setSelectedCategory,
    setSelectedOrder,
    setIsOrderModalOpen,
    setIsSidebarOpen,
    setOrderForm,
    openOrderModal,
    closeOrderModal,
    viewOrder,
    placeOrder,
  };
}
