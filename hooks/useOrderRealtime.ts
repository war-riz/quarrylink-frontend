"use client";

/**
 * useOrderRealtime
 * ─────────────────────────────────────────────────────────────────────────────
 * Simulates live order-status updates.
 *
 * 🔌 BACKEND INTEGRATION POINTS (search "🔌" throughout):
 *   1. Replace the mock interval with a WebSocket subscription OR a polling call.
 *   2. Replace MOCK_STATUS_PROGRESSION with real API responses.
 *
 * When backend is ready:
 *   - Socket.io:   socket.on("order:status", (data) => setOrder(data))
 *   - REST poll:   GET /api/orders/:id  every N seconds
 *   - SWR:         useSWR(`/api/orders/${id}`, fetcher, { refreshInterval: 5000 })
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Order, OrderStatus, MOCK_ORDERS } from "@/constants/dashboardConstants";

// 🔌 STUB: progression sequence used only while backend is not connected
const MOCK_STATUS_PROGRESSION: OrderStatus[] = [
  "pending_acceptance",
  "accepted",
  "ready_for_pickup",
  "driver_assigned",
  "in_transit",
  "delivered",
];

export interface RealtimeOrderState {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
  /** Call this when the customer confirms delivery with OTP */
  confirmDelivery: (otp: string, photos: string[]) => Promise<void>;
  /** True once confirmDelivery resolves successfully */
  isConfirmed: boolean;
  isConfirming: boolean;
  confirmError: string | null;
}

export function useOrderRealtime(orderId: string | null): RealtimeOrderState {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Used only in stub mode to track progression index
  const mockStepRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch initial order ──────────────────────────────────────────
  const fetchOrder = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 🔌 REPLACE WITH: const res = await fetch(`/api/orders/${id}`);
      //                  const data = await res.json();
      //                  setOrder(data);
      await new Promise((r) => setTimeout(r, 400)); // simulate network
      const found = MOCK_ORDERS.find((o) => o.id === id) ?? MOCK_ORDERS[0];
      setOrder({ ...found });

      // Find the starting mock step index
      const idx = MOCK_STATUS_PROGRESSION.indexOf(found.status);
      mockStepRef.current = idx >= 0 ? idx : 0;
    } catch (e) {
      setError("Failed to load order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Subscribe to live updates ────────────────────────────────────
  const subscribe = useCallback((id: string) => {
    // 🔌 REPLACE THIS ENTIRE BLOCK WITH REAL SUBSCRIPTION:
    //
    // Option A — WebSocket (Socket.io):
    //   const socket = io(process.env.NEXT_PUBLIC_WS_URL!);
    //   socket.emit("subscribe:order", id);
    //   socket.on("order:update", (updated: Order) => setOrder(updated));
    //   return () => { socket.off("order:update"); socket.disconnect(); };
    //
    // Option B — SWR polling (simplest):
    //   // Just use useSWR at component level, no subscription needed here.
    //
    // Option C — EventSource (SSE):
    //   const es = new EventSource(`/api/orders/${id}/stream`);
    //   es.onmessage = (e) => setOrder(JSON.parse(e.data));
    //   return () => es.close();

    // STUB: advance status every 8 seconds to demo the UI
    intervalRef.current = setInterval(() => {
      setOrder((prev) => {
        if (!prev) return prev;
        const currentIdx = MOCK_STATUS_PROGRESSION.indexOf(prev.status);
        const nextIdx = currentIdx + 1;
        if (nextIdx >= MOCK_STATUS_PROGRESSION.length) {
          // Reached the end — stop polling
          if (intervalRef.current) clearInterval(intervalRef.current);
          return prev;
        }
        return { ...prev, status: MOCK_STATUS_PROGRESSION[nextIdx] };
      });
    }, 8000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!orderId) return;
    fetchOrder(orderId);
    const unsub = subscribe(orderId);
    return unsub;
  }, [orderId, fetchOrder, subscribe]);

  // ── Confirm delivery ─────────────────────────────────────────────
  const confirmDelivery = useCallback(
    async (otp: string, photos: string[]) => {
      if (!order) return;
      setIsConfirming(true);
      setConfirmError(null);
      try {
        // 🔌 REPLACE WITH:
        //   await fetch(`/api/orders/${order.id}/confirm`, {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ otp, deliveryPhotos: photos }),
        //   });
        await new Promise((r) => setTimeout(r, 2000)); // simulate API call

        // Validate OTP stub — backend will do real validation
        if (otp !== "123456" && otp.length === 6) {
          // Accept any 6-digit code in stub mode
        }

        setOrder((prev) =>
          prev ? { ...prev, status: "completed" } : prev
        );
        setIsConfirmed(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } catch (e) {
        setConfirmError("Confirmation failed. Please check your OTP and try again.");
      } finally {
        setIsConfirming(false);
      }
    },
    [order]
  );

  return {
    order,
    isLoading,
    error,
    confirmDelivery,
    isConfirmed,
    isConfirming,
    confirmError,
  };
}
