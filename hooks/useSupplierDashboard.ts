"use client";

/**
 * useSupplierDashboard
 * ─────────────────────────────────────────────────────────────────
 * Wired to:
 *   GET  /api/suppliers/my-inventory/        → inventory items
 *   GET  /api/orders/?role=supplier          → supplier orders
 *   POST /api/orders/:id/accept/             → accept order
 *   POST /api/orders/:id/reject/             → reject order
 *   POST /api/orders/:id/ready/              → mark ready for pickup
 *   POST /api/orders/:id/confirm-pickup/     → confirm driver pickup
 *   PATCH /api/suppliers/inventory/:id/      → update inventory item
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  SupplierOrder,
  InventoryItem,
  SupplierOrderStatus,
} from "@/constants/supplierDashboardConstants";

// ── Backend → Frontend mappers ─────────────────────────────────────

function mapOrder(raw: Record<string, any>): SupplierOrder {
  return {
    id:              raw.order_number ?? raw.id,
    material:        raw.material_name ?? raw.items?.[0]?.material_name ?? "Unknown",
    quantity:        raw.quantity       ?? raw.items?.[0]?.quantity      ?? 0,
    customerName:    raw.customer_name  ?? raw.customer?.full_name       ?? "",
    customerCompany: raw.customer_company ?? raw.customer?.company_name  ?? "",
    deliveryAddress: raw.delivery_address ?? "",
    total:           parseFloat(raw.total_amount ?? raw.amount ?? "0"),
    status:          mapStatus(raw.status),
    createdAt:       raw.created_at ?? new Date().toISOString(),
    paymentStatus:   mapPaymentStatus(raw.payment_status ?? raw.escrow_status),
  };
}

function mapStatus(s: string): SupplierOrderStatus {
  const map: Record<string, SupplierOrderStatus> = {
    PENDING:    "new",
    ACCEPTED:   "accepted",
    PREPARING:  "preparing",
    READY:      "ready",
    DISPATCHED: "dispatched",
    IN_TRANSIT: "dispatched",
    DELIVERED:  "delivered",
    COMPLETED:  "completed",
    CANCELLED:  "rejected",
    REJECTED:   "rejected",
  };
  return map[s?.toUpperCase()] ?? "new";
}

function mapPaymentStatus(s: string): "in_escrow" | "released" | "pending" {
  if (!s) return "pending";
  const upper = s.toUpperCase();
  if (upper === "RELEASED") return "released";
  if (upper === "IN_ESCROW" || upper === "HELD") return "in_escrow";
  return "pending";
}

function mapInventory(raw: Record<string, any>): InventoryItem {
  return {
    id:           raw.id,
    name:         raw.name ?? raw.material_name ?? "",
    category:     raw.category ?? "",
    pricePerTon:  parseFloat(raw.price_per_ton ?? raw.price ?? "0"),
    stockTons:    parseFloat(raw.stock_tons ?? raw.available_quantity ?? "0"),
    reservedTons: parseFloat(raw.reserved_tons ?? raw.reserved_quantity ?? "0"),
    minOrder:     parseFloat(raw.min_order_tons ?? raw.minimum_order ?? "0"),
    available:    raw.is_available ?? raw.available ?? true,
  };
}

// ── Stats computed from live data ──────────────────────────────────

function computeStats(orders: SupplierOrder[], inventory: InventoryItem[]) {
  const completed = orders.filter(o => o.status === "completed" || o.status === "delivered");
  const pending   = orders.filter(o => o.status === "new" || o.status === "accepted");
  const escrow    = orders
    .filter(o => o.paymentStatus === "in_escrow")
    .reduce((s, o) => s + o.total, 0);
  const revenue   = completed.reduce((s, o) => s + o.total, 0);
  const totalStock = inventory.reduce((s, i) => s + i.stockTons, 0);

  return {
    totalRevenue:     revenue,
    escrowHeld:       escrow,
    totalOrders:      orders.length,
    pendingOrders:    pending.length,
    completedOrders:  completed.length,
    avgRating:        4.6, // 🔌 replace with GET /api/suppliers/me/ → rating field
    totalStockTons:   totalStock,
  };
}

// ── Hook ──────────────────────────────────────────────────────────

export function useSupplierDashboard() {
  const [orders,    setOrders]    = useState<SupplierOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // ── Fetch both in parallel ──────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, inventoryRes] = await Promise.all([
        api("/orders/?role=supplier"),
        api("/suppliers/my-inventory/"),
      ]);

      const [ordersData, inventoryData] = await Promise.all([
        ordersRes.json(),
        inventoryRes.json(),
      ]);

      if (ordersRes.ok) {
        const raw = ordersData?.data?.results ?? ordersData?.data ?? ordersData?.results ?? [];
        setOrders(Array.isArray(raw) ? raw.map(mapOrder) : []);
      }

      if (inventoryRes.ok) {
        const raw = inventoryData?.data?.results ?? inventoryData?.data ?? inventoryData?.results ?? [];
        setInventory(Array.isArray(raw) ? raw.map(mapInventory) : []);
      }
    } catch {
      setError("Failed to load dashboard data. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Order actions ───────────────────────────────────────────────

  const acceptOrder = useCallback(async (id: string) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "accepted" as const } : o));
    try {
      const res = await api(`/orders/${id}/accept/`, { method: "POST" });
      if (!res.ok) {
        // Rollback on failure
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "new" as const } : o));
      }
    } catch {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "new" as const } : o));
    }
  }, []);

  const rejectOrder = useCallback(async (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "rejected" as const } : o));
    try {
      const res = await api(`/orders/${id}/reject/`, { method: "POST" });
      if (!res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "new" as const } : o));
      }
    } catch {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "new" as const } : o));
    }
  }, []);

  const markReady = useCallback(async (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "ready" as const } : o));
    try {
      await api(`/orders/${id}/ready/`, { method: "POST" });
    } catch {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "accepted" as const } : o));
    }
  }, []);

  const confirmPickup = useCallback(async (id: string, driverId?: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "dispatched" as const } : o));
    try {
      await api(`/orders/${id}/confirm-pickup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: driverId ? JSON.stringify({ driver_id: driverId }) : undefined,
      });
    } catch {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "ready" as const } : o));
    }
  }, []);

  // Generic local status update (for SupplierOrderActionsBar)
  const handleStatusChange = useCallback((id: string, newStatus: SupplierOrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  }, []);

  const stats = computeStats(orders, inventory);
  const newOrderCount = orders.filter(o => o.status === "new").length;

  return {
    orders,
    inventory,
    stats,
    loading,
    error,
    newOrderCount,
    refresh:          fetchAll,
    acceptOrder,
    rejectOrder,
    markReady,
    confirmPickup,
    handleStatusChange,
  };
}
