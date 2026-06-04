"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import {
  DashboardTab,
  Material,
  Order,
  OrderStatus,
  MATERIAL_CATEGORIES,
} from "@/constants/dashboardConstants";

export interface OrderFormState {
  material: Material | null;
  quantity: number;
  address: string;
  paymentMethod: "card" | "bank_transfer" | "";
  step: "details" | "payment" | "confirm" | "success";
}

// ── Shape mappers ─────────────────────────────────────────────────
// Maps backend API responses to the frontend Material / Order types

function mapInventoryToMaterial(item: any): Material {
  return {
    id: item.id,
    name: item.material?.name ?? item.name ?? "Unknown",
    category: item.material?.category?.name ?? item.category ?? "Other",
    pricePerTon: parseFloat(item.price_per_unit ?? item.price ?? 0),
    minOrder: item.minimum_order_quantity ?? 1,
    supplier: {
      name: item.supplier?.business_name ?? item.supplier?.name ?? "Unknown Supplier",
      location: item.supplier?.city
        ? `${item.supplier.city}, ${item.supplier.state ?? ""}`
        : "Nigeria",
      rating: parseFloat(item.supplier?.rating ?? 4.5),
      totalOrders: item.supplier?.total_orders ?? 0,
      verified: item.supplier?.is_verified ?? false,
    },
    image: item.images?.[0]?.url ?? "/images/service/service-1.png",
    description: item.description ?? item.material?.description ?? "",
    available: item.is_available ?? true,
    deliveryDays: item.delivery_days ?? 2,
    // keep raw supplier_id for order creation
    _supplierId: item.supplier?.id ?? null,
    _inventoryId: item.id,
  } as Material & { _supplierId: string | null; _inventoryId: string };
}

function mapOrderFromBackend(o: any): Order {
  const items = o.items ?? [];
  const firstItem = items[0] ?? {};
  return {
    id: o.order_number ?? o.id,
    material: firstItem.inventory?.material?.name ?? firstItem.material_name ?? "Materials",
    category: firstItem.inventory?.material?.category?.name ?? "Other",
    supplier: firstItem.inventory?.supplier?.business_name ?? o.supplier_name ?? "Supplier",
    quantity: parseFloat(firstItem.quantity ?? o.quantity ?? 0),
    unit: firstItem.unit ?? "tons",
    materialCost: parseFloat(o.subtotal ?? o.material_cost ?? 0),
    deliveryFee: parseFloat(o.delivery_fee ?? 0),
    platformFee: parseFloat(o.platform_fee ?? 0),
    total: parseFloat(o.total_amount ?? o.total ?? 0),
    status: mapStatus(o.status),
    createdAt: o.created_at ?? new Date().toISOString(),
    deliveryAddress: o.delivery_address ?? "",
    driver: o.driver
      ? {
          name: `${o.driver.first_name ?? ""} ${o.driver.last_name ?? ""}`.trim(),
          phone: o.driver.phone_number ?? "",
          rating: parseFloat(o.driver.rating ?? 4.5),
          truckPlate: o.driver.truck_plate ?? "",
          photo: o.driver.profile_picture ?? "",
        }
      : undefined,
    eta: o.estimated_arrival ?? undefined,
    trackingLat: o.delivery_lat ? parseFloat(o.delivery_lat) : undefined,
    trackingLng: o.delivery_lng ? parseFloat(o.delivery_lng) : undefined,
  };
}

function mapStatus(s: string): OrderStatus {
  const map: Record<string, OrderStatus> = {
    PENDING:           "pending_acceptance",
    ACCEPTED:          "accepted",
    READY_FOR_PICKUP:  "ready_for_pickup",
    DRIVER_ASSIGNED:   "driver_assigned",
    IN_TRANSIT:        "in_transit",
    DELIVERED:         "delivered",
    COMPLETED:         "completed",
    CANCELLED:         "cancelled",
    // lowercase variants
    pending:           "pending_acceptance",
    accepted:          "accepted",
    ready_for_pickup:  "ready_for_pickup",
    driver_assigned:   "driver_assigned",
    in_transit:        "in_transit",
    delivered:         "delivered",
    completed:         "completed",
    cancelled:         "cancelled",
  };
  return map[s] ?? "pending_acceptance";
}

// ── Hook ──────────────────────────────────────────────────────────

export function useDashboard() {
  const [activeTab, setActiveTab]               = useState<DashboardTab>("overview");
  const [searchQuery, setSearchQuery]           = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedOrder, setSelectedOrder]       = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen]       = useState(false);

  // ── Materials (from /api/suppliers/browse/) ───────────────────
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchMaterials() {
      setMaterialsLoading(true);
      try {
        const res  = await api("/suppliers/browse/");
        const data = await res.json();
        if (cancelled) return;
        const results = data?.data?.results ?? data?.results ?? data?.data ?? [];
        setAllMaterials(Array.isArray(results) ? results.map(mapInventoryToMaterial) : []);
      } catch {
        // keep empty on network error
      } finally {
        if (!cancelled) setMaterialsLoading(false);
      }
    }
    fetchMaterials();
    return () => { cancelled = true; };
  }, []);

  // ── Orders (from /api/orders/) ────────────────────────────────
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res  = await api("/orders/");
      const data = await res.json();
      const results = data?.data?.results ?? data?.results ?? data?.data ?? [];
      setAllOrders(Array.isArray(results) ? results.map(mapOrderFromBackend) : []);
    } catch {
      // keep empty
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Derived stats ─────────────────────────────────────────────
  const stats = {
    totalOrders:       allOrders.length,
    activeOrders:      allOrders.filter(o => !["completed","cancelled"].includes(o.status)).length,
    totalSpent:        allOrders.filter(o => o.status === "completed").reduce((s, o) => s + o.total, 0),
    savedAmount:       0,
    pendingDeliveries: allOrders.filter(o => o.status === "in_transit").length,
    completedOrders:   allOrders.filter(o => o.status === "completed").length,
  };

  // ── Filtered materials ────────────────────────────────────────
  const filteredMaterials = allMaterials.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(q) ||
      m.supplier.name.toLowerCase().includes(q) ||
      m.supplier.location.toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory === "All" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ── Order form ────────────────────────────────────────────────
  const [orderForm, setOrderForm] = useState<OrderFormState>({
    material: null,
    quantity: 1,
    address: "",
    paymentMethod: "",
    step: "details",
  });

  const openOrderModal = useCallback((material: Material) => {
    setOrderForm({
      material,
      quantity: material.minOrder,
      address: "",
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

  // ── Place order (POST /api/orders/create/) ────────────────────
  const placeOrder = useCallback(async () => {
    const { material, quantity, address, paymentMethod } = orderForm;
    if (!material) return;

    try {
      const m = material as Material & { _supplierId?: string; _inventoryId?: string };
      const payload = {
        delivery_address: address,
        payment_method:   paymentMethod === "card" ? "CARD" : "BANK_TRANSFER",
        items: [
          {
            inventory_id: m._inventoryId ?? m.id,
            quantity:     quantity,
          },
        ],
      };

      const res  = await api("/orders/create/", {
        method: "POST",
        body:   JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        setOrderForm((prev) => ({ ...prev, step: "success" }));
        // Refresh orders list so the new order appears immediately
        fetchOrders();
      } else {
        // Surface first error message
        const msg = data?.message ?? data?.errors
          ? Object.values(data.errors as Record<string, string[]>).flat()[0]
          : "Order failed. Please try again.";
        console.error("Order error:", msg);
      }
    } catch (err) {
      console.error("Network error placing order:", err);
    }
  }, [orderForm, fetchOrders]);

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
    materials:       filteredMaterials,
    materialsLoading,
    orders:          allOrders,
    ordersLoading,
    stats,
    activeOrder:     allOrders.find((o) => o.status === "in_transit") ?? null,

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
    refreshOrders: fetchOrders,
  };
}