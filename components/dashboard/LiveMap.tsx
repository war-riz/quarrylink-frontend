"use client";

/**
 * LiveMap
 * ─────────────────────────────────────────────────────────────────────────────
 * Real interactive map using Leaflet (open-source, no API key required).
 * Uses OpenStreetMap tiles by default.
 *
 * 🔌 BACKEND INTEGRATION:
 *   - driverPosition comes from useMapTracking hook
 *   - To switch to Google Maps: swap tile URL for Google Maps tile endpoint
 *     (requires Google Maps API key set in NEXT_PUBLIC_GOOGLE_MAPS_KEY)
 *   - For Mapbox: swap tiles to https://api.mapbox.com/styles/v1/...
 *     (requires NEXT_PUBLIC_MAPBOX_TOKEN)
 *
 * INSTALL:  npm install leaflet react-leaflet @types/leaflet
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from "react";
import { DriverPosition } from "@/hooks/useMapTracking";

interface LiveMapProps {
  driverPosition: DriverPosition | null;
  destinationLat: number;
  destinationLng: number;
  className?: string;
}

// Leaflet must only load on the client (no SSR)
let L: typeof import("leaflet") | null = null;

export function LiveMap({
  driverPosition,
  destinationLat,
  destinationLng,
  className = "",
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const driverMarkerRef = useRef<import("leaflet").Marker | null>(null);
  const destMarkerRef = useRef<import("leaflet").Marker | null>(null);
  const routeLineRef = useRef<import("leaflet").Polyline | null>(null);
  const isInitialized = useRef(false);

  // ── Initialize map ──────────────────────────────────────────────
  useEffect(() => {
    if (isInitialized.current || !mapContainerRef.current) return;

    const initMap = async () => {
      // 🔌 Dynamic import keeps Leaflet out of SSR bundle
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      L = leaflet.default ?? leaflet;

      // Fix Leaflet default icon path issue with Next.js
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const initialLat = driverPosition?.lat ?? destinationLat;
      const initialLng = driverPosition?.lng ?? destinationLng;

      const map = L.map(mapContainerRef.current!, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
      });

      // 🔌 TILE LAYER — swap URL to use Google Maps or Mapbox:
      //
      // OpenStreetMap (default, free, no key):
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      //
      // 🔌 Google Maps (uncomment + set NEXT_PUBLIC_GOOGLE_MAPS_KEY):
      // L.tileLayer(
      //   `https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`,
      //   { subdomains: ["0", "1", "2", "3"], maxZoom: 20 }
      // ).addTo(map);
      //
      // 🔌 Mapbox (uncomment + set NEXT_PUBLIC_MAPBOX_TOKEN):
      // L.tileLayer(
      //   `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
      //   { tileSize: 512, zoomOffset: -1, maxZoom: 20 }
      // ).addTo(map);

      mapRef.current = map;

      // Destination marker — styled
      const destIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            width:36px;height:36px;background:#121212;border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);border:3px solid #ffc107;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 4px 12px rgba(0,0,0,0.3)
          ">
            <div style="transform:rotate(45deg);color:#ffc107;font-size:14px;">📦</div>
          </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      destMarkerRef.current = L.marker([destinationLat, destinationLng], {
        icon: destIcon,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;font-size:13px;font-weight:700;">
            Delivery Location
          </div>`
        );

      // Driver marker
      if (driverPosition) {
        const truckIcon = L.divIcon({
          className: "",
          html: `
            <div style="position:relative;width:44px;height:44px">
              <div style="
                width:44px;height:44px;background:#ffc107;border-radius:50%;
                display:flex;align-items:center;justify-content:center;
                border:3px solid white;box-shadow:0 4px 16px rgba(255,193,7,0.5)
              ">
                <span style="font-size:20px">🚛</span>
              </div>
            </div>`,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        driverMarkerRef.current = L.marker(
          [driverPosition.lat, driverPosition.lng],
          { icon: truckIcon }
        )
          .addTo(map)
          .bindPopup(
            `<div style="font-family:sans-serif;font-size:13px;">
              <strong>Driver is on the way</strong><br/>
              Speed: ${Math.round(driverPosition.speed)} km/h
            </div>`
          );

        // Route line
        routeLineRef.current = L.polyline(
          [
            [driverPosition.lat, driverPosition.lng],
            [destinationLat, destinationLng],
          ],
          {
            color: "#ffc107",
            weight: 4,
            opacity: 0.8,
            dashArray: "10 6",
          }
        ).addTo(map);

        // Fit bounds to show both markers
        const bounds = L.latLngBounds(
          [driverPosition.lat, driverPosition.lng],
          [destinationLat, destinationLng]
        );
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      isInitialized.current = true;
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        isInitialized.current = false;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally only on mount

  // ── Update driver marker position ────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !driverPosition || !L) return;

    const newLatLng: [number, number] = [driverPosition.lat, driverPosition.lng];

    if (driverMarkerRef.current) {
      // Smooth pan to new position
      driverMarkerRef.current.setLatLng(newLatLng);

      // Update route line
      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs([
          newLatLng,
          [destinationLat, destinationLng],
        ]);
      }

      // Auto-pan to keep driver in view
      const mapBounds = mapRef.current.getBounds();
      if (!mapBounds.contains(newLatLng)) {
        mapRef.current.panTo(newLatLng, { animate: true, duration: 0.8 });
      }
    } else if (L) {
      // Create driver marker if it didn't exist yet
      const truckIcon = L.divIcon({
        className: "",
        html: `<div style="width:44px;height:44px;background:#ffc107;border-radius:50%;
          display:flex;align-items:center;justify-content:center;border:3px solid white;
          box-shadow:0 4px 16px rgba(255,193,7,0.5)"><span style="font-size:20px">🚛</span></div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      driverMarkerRef.current = L.marker(newLatLng, { icon: truckIcon }).addTo(
        mapRef.current
      );

      routeLineRef.current = L.polyline(
        [newLatLng, [destinationLat, destinationLng]],
        { color: "#ffc107", weight: 4, opacity: 0.8, dashArray: "10 6" }
      ).addTo(mapRef.current);
    }
  }, [driverPosition, destinationLat, destinationLng]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full rounded-2xl overflow-hidden border border-zinc-200 ${className}`}
      style={{ minHeight: "360px" }}
    />
  );
}
