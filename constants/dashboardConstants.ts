// ── Dashboard navigation ──────────────────────────────────────────

export type DashboardTab =
  | "overview"
  | "browse"
  | "orders"
  | "tracking"
  | "payments"
  | "profile";

export const DASHBOARD_NAV: { id: DashboardTab; label: string; icon: string }[] = [
  { id: "overview",  label: "Overview",      icon: "grid" },
  { id: "browse",    label: "Browse",        icon: "search" },
  { id: "orders",    label: "My Orders",     icon: "package" },
  { id: "tracking",  label: "Live Tracking", icon: "map-pin" },
  { id: "payments",  label: "Payments",      icon: "credit-card" },
  { id: "profile",   label: "Profile",       icon: "user" },
];

// ── Order statuses ────────────────────────────────────────────────

export type OrderStatus =
  | "pending_acceptance"
  | "accepted"
  | "ready_for_pickup"
  | "driver_assigned"
  | "in_transit"
  | "delivered"
  | "completed"
  | "cancelled";

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; step: number }
> = {
  pending_acceptance: { label: "Pending Acceptance", color: "#f59e0b", bg: "#fef3c7", step: 1 },
  accepted:           { label: "Accepted",           color: "#3b82f6", bg: "#dbeafe", step: 2 },
  ready_for_pickup:   { label: "Ready for Pickup",   color: "#8b5cf6", bg: "#ede9fe", step: 3 },
  driver_assigned:    { label: "Driver Assigned",    color: "#06b6d4", bg: "#cffafe", step: 4 },
  in_transit:         { label: "In Transit",         color: "#f97316", bg: "#ffedd5", step: 5 },
  delivered:          { label: "Delivered",          color: "#10b981", bg: "#d1fae5", step: 6 },
  completed:          { label: "Completed",          color: "#10b981", bg: "#d1fae5", step: 7 },
  cancelled:          { label: "Cancelled",          color: "#ef4444", bg: "#fee2e2", step: 0 },
};

export const ORDER_STEPS = [
  { key: "pending_acceptance", label: "Order Placed" },
  { key: "accepted",           label: "Supplier Accepted" },
  { key: "ready_for_pickup",   label: "Ready for Pickup" },
  { key: "driver_assigned",    label: "Driver Assigned" },
  { key: "in_transit",         label: "In Transit" },
  { key: "delivered",          label: "Delivered" },
  { key: "completed",          label: "Completed" },
];

// ── Mock materials ────────────────────────────────────────────────

export interface Material {
  id: string;
  name: string;
  category: string;
  pricePerTon: number;
  minOrder: number;
  supplier: {
    name: string;
    location: string;
    rating: number;
    totalOrders: number;
    verified: boolean;
  };
  image: string;
  description: string;
  available: boolean;
  deliveryDays: number;
}

export const MATERIAL_CATEGORIES = [
  "All",
  "Granite",
  "Sand",
  "Gravel",
  "Limestone",
  "Laterite",
  "Ballast",
];

export const MOCK_MATERIALS: Material[] = [
  {
    id: "m1",
    name: "Sharp Sand",
    category: "Sand",
    pricePerTon: 8500,
    minOrder: 5,
    supplier: { name: "Lagos Quarry Ltd", location: "Ikorodu, Lagos", rating: 4.8, totalOrders: 342, verified: true },
    image: "/images/service/service-1.png",
    description: "Fine-grained sharp sand ideal for concrete mixing and plastering.",
    available: true,
    deliveryDays: 1,
  },
  {
    id: "m2",
    name: "Granite (3/4 Inch)",
    category: "Granite",
    pricePerTon: 14200,
    minOrder: 10,
    supplier: { name: "Abeokuta Stone Works", location: "Abeokuta, Ogun", rating: 4.6, totalOrders: 218, verified: true },
    image: "/images/service/service-2.png",
    description: "Crushed granite aggregate for concrete foundations and road base.",
    available: true,
    deliveryDays: 2,
  },
  {
    id: "m3",
    name: "Gravel (Mixed)",
    category: "Gravel",
    pricePerTon: 9800,
    minOrder: 5,
    supplier: { name: "Delta Minerals Co.", location: "Asaba, Delta", rating: 4.5, totalOrders: 189, verified: true },
    image: "/images/service/service-3.png",
    description: "Mixed gravel for drainage systems and landscaping.",
    available: true,
    deliveryDays: 3,
  },
  {
    id: "m4",
    name: "Limestone Powder",
    category: "Limestone",
    pricePerTon: 11000,
    minOrder: 8,
    supplier: { name: "Ewekoro Cement Quarry", location: "Ewekoro, Ogun", rating: 4.9, totalOrders: 501, verified: true },
    image: "/images/service/service-4.png",
    description: "High-purity limestone powder for cement and industrial use.",
    available: true,
    deliveryDays: 2,
  },
  {
    id: "m5",
    name: "Laterite Fill",
    category: "Laterite",
    pricePerTon: 6200,
    minOrder: 10,
    supplier: { name: "Ogun Earth Materials", location: "Sagamu, Ogun", rating: 4.3, totalOrders: 127, verified: false },
    image: "/images/service/service-5.png",
    description: "Red laterite earth for land filling and road construction.",
    available: true,
    deliveryDays: 1,
  },
  {
    id: "m6",
    name: "Railway Ballast",
    category: "Ballast",
    pricePerTon: 16500,
    minOrder: 20,
    supplier: { name: "FCT Quarries", location: "Abuja, FCT", rating: 4.7, totalOrders: 94, verified: true },
    image: "/images/service/service-1.png",
    description: "Crushed stone ballast for railway track beds and heavy-duty applications.",
    available: false,
    deliveryDays: 4,
  },
];

// ── Mock orders ────────────────────────────────────────────────────

export interface Order {
  id: string;
  material: string;
  category: string;
  supplier: string;
  quantity: number;
  unit: string;
  materialCost: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  deliveryAddress: string;
  driver?: {
    name: string;
    phone: string;
    rating: number;
    truckPlate: string;
    photo: string;
  };
  eta?: string;
  trackingLat?: number;
  trackingLng?: number;
}

export const MOCK_ORDERS: Order[] = [
  {
    id: "QL-2024-0089",
    material: "Granite (3/4 Inch)",
    category: "Granite",
    supplier: "Abeokuta Stone Works",
    quantity: 25,
    unit: "tons",
    materialCost: 355000,
    deliveryFee: 45000,
    platformFee: 20000,
    total: 420000,
    status: "in_transit",
    createdAt: "2024-05-07T09:22:00Z",
    deliveryAddress: "24 Adeola Odeku Street, Victoria Island, Lagos",
    driver: {
      name: "Emeka Okafor",
      phone: "+234 812 345 6789",
      rating: 4.7,
      truckPlate: "LND 742 MU",
      photo: "",
    },
    eta: "2:45 PM",
    trackingLat: 6.4281,
    trackingLng: 3.4219,
  },
  {
    id: "QL-2024-0081",
    material: "Sharp Sand",
    category: "Sand",
    supplier: "Lagos Quarry Ltd",
    quantity: 15,
    unit: "tons",
    materialCost: 127500,
    deliveryFee: 22000,
    platformFee: 7475,
    total: 156975,
    status: "completed",
    createdAt: "2024-05-04T14:10:00Z",
    deliveryAddress: "24 Adeola Odeku Street, Victoria Island, Lagos",
  },
  {
    id: "QL-2024-0075",
    material: "Limestone Powder",
    category: "Limestone",
    supplier: "Ewekoro Cement Quarry",
    quantity: 20,
    unit: "tons",
    materialCost: 220000,
    deliveryFee: 35000,
    platformFee: 12750,
    total: 267750,
    status: "completed",
    createdAt: "2024-05-01T11:00:00Z",
    deliveryAddress: "Km 12, Lekki-Epe Expressway, Lagos",
  },
  {
    id: "QL-2024-0092",
    material: "Laterite Fill",
    category: "Laterite",
    supplier: "Ogun Earth Materials",
    quantity: 30,
    unit: "tons",
    materialCost: 186000,
    deliveryFee: 40000,
    platformFee: 11300,
    total: 237300,
    status: "pending_acceptance",
    createdAt: "2024-05-08T08:00:00Z",
    deliveryAddress: "Block 5, Chevron Drive, Lekki Phase 2, Lagos",
  },
];

// ── Dashboard stats ─────────────────────────────────────────────

export const MOCK_STATS = {
  totalOrders: 12,
  activeOrders: 2,
  totalSpent: 2847500,
  savedAmount: 145200,
  pendingDeliveries: 1,
  completedOrders: 9,
};


export function formatRating(value: number): string {
  return value.toFixed(2) + "★";
}