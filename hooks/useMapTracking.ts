"use client";

/**
 * useMapTracking
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides live driver GPS coordinates for the tracking map.
 *
 * 🔌 BACKEND INTEGRATION POINTS:
 *   Replace the mock interval with your real GPS stream.
 *
 *   Option A — WebSocket:
 *     socket.on("driver:location", ({ lat, lng, heading, speed }) => setPosition(...))
 *
 *   Option B — REST polling:
 *     GET /api/orders/:id/driver-location  every 10s
 *     Returns: { lat: number, lng: number, heading: number, speed: number, eta: string }
 *
 *   Option C — Google Maps / Mapbox real-time layer:
 *     Use their SDK's live tracking APIs directly on the map instance.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef, useCallback } from "react";

export interface DriverPosition {
  lat: number;
  lng: number;
  heading: number; // degrees 0–360
  speed: number;   // km/h
  accuracy: number; // meters
  timestamp: number;
}

export interface TrackingState {
  driverPosition: DriverPosition | null;
  destinationLat: number;
  destinationLng: number;
  eta: string;
  distanceKm: number;
  isConnected: boolean;
  lastUpdated: Date | null;
}

// 🔌 STUB: Lagos area waypoints simulating a truck driving route
//    Replace with real coordinates from your backend
const STUB_ROUTE_WAYPOINTS: [number, number][] = [
  [6.5244, 3.3792],  // Start: Ikeja
  [6.5200, 3.3850],
  [6.5100, 3.3950],
  [6.4950, 3.4050],
  [6.4800, 3.4150],
  [6.4650, 3.4200],
  [6.4500, 3.4219],
  [6.4350, 3.4230],
  [6.4281, 3.4219],  // Destination: Victoria Island area
];

function calculateHeading(from: [number, number], to: [number, number]): number {
  const dLng = to[1] - from[1];
  const dLat = to[0] - from[0];
  return (Math.atan2(dLng, dLat) * 180) / Math.PI;
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) *
      Math.cos((b[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function useMapTracking(orderId: string | null): TrackingState {
  const DEST: [number, number] = [6.4281, 3.4219]; // 🔌 Replace with real delivery address coords

  const [driverPosition, setDriverPosition] = useState<DriverPosition | null>(null);
  const [eta, setEta] = useState("Calculating...");
  const [distanceKm, setDistanceKm] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const waypointIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updatePosition = useCallback((pos: [number, number], nextPos: [number, number]) => {
    const heading = calculateHeading(pos, nextPos);
    const dist = haversineKm(pos, DEST);
    const etaMins = Math.round((dist / 40) * 60); // assume 40 km/h avg

    setDriverPosition({
      lat: pos[0],
      lng: pos[1],
      heading,
      speed: 35 + Math.random() * 20,
      accuracy: 5,
      timestamp: Date.now(),
    });
    setDistanceKm(Math.round(dist * 10) / 10);
    setEta(
      etaMins < 2
        ? "Arriving now"
        : etaMins < 60
        ? `~${etaMins} min`
        : `~${Math.floor(etaMins / 60)}h ${etaMins % 60}m`
    );
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    if (!orderId) return;

    setIsConnected(true);

    // Set initial position
    const initial = STUB_ROUTE_WAYPOINTS[0];
    const next = STUB_ROUTE_WAYPOINTS[1];
    updatePosition(initial, next);

    // 🔌 REPLACE THIS BLOCK with real GPS subscription:
    //
    //   const socket = io(process.env.NEXT_PUBLIC_WS_URL!);
    //   socket.emit("track:order", orderId);
    //   socket.on("driver:gps", (data: DriverPosition) => {
    //     setDriverPosition(data);
    //     setLastUpdated(new Date());
    //     const dist = haversineKm([data.lat, data.lng], DEST);
    //     const etaMins = Math.round((dist / 40) * 60);
    //     setEta(etaMins < 2 ? "Arriving now" : `~${etaMins} min`);
    //     setDistanceKm(Math.round(dist * 10) / 10);
    //   });
    //   socket.on("connect_error", () => setIsConnected(false));
    //   return () => { socket.off("driver:gps"); socket.disconnect(); };

    // STUB: simulate movement every 4 seconds
    intervalRef.current = setInterval(() => {
      waypointIndexRef.current += 1;
      const idx = waypointIndexRef.current;
      if (idx >= STUB_ROUTE_WAYPOINTS.length - 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      const pos = STUB_ROUTE_WAYPOINTS[idx];
      const nextPos = STUB_ROUTE_WAYPOINTS[Math.min(idx + 1, STUB_ROUTE_WAYPOINTS.length - 1)];
      updatePosition(pos, nextPos);
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsConnected(false);
    };
  }, [orderId, updatePosition]);

  return {
    driverPosition,
    destinationLat: DEST[0],
    destinationLng: DEST[1],
    eta,
    distanceKm,
    isConnected,
    lastUpdated,
  };
}
