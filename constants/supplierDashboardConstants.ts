/**
 * supplierDashboardConstants.ts
 * Mock data for the Supplier (Quarry Operator) dashboard.
 * 🔌 Replace all MOCK_ data with real API responses.
 */

export type SupplierOrderStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "dispatched"
  | "delivered"
  | "completed"
  | "rejected";

export interface SupplierOrder {
  id: string;
  material: string;
  quantity: number;
  customerName: string;
  customerCompany: string;
  deliveryAddress: string;
  total: number;
  status: SupplierOrderStatus;
  createdAt: string;
  paymentStatus: "in_escrow" | "released" | "pending";
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  pricePerTon: number;
  stockTons: number;
  reservedTons: number;
  minOrder: number;
  available: boolean;
}

export const SUPPLIER_ORDER_STATUS: Record<
  SupplierOrderStatus,
  { label: string; color: string; bg: string }
> = {
  new:        { label: "New Order",   color: "#3b82f6", bg: "#dbeafe" },
  accepted:   { label: "Accepted",    color: "#06b6d4", bg: "#cffafe" },
  preparing:  { label: "Preparing",   color: "#8b5cf6", bg: "#ede9fe" },
  ready:      { label: "Ready",       color: "#f59e0b", bg: "#fef3c7" },
  dispatched: { label: "Dispatched",  color: "#f97316", bg: "#ffedd5" },
  delivered:  { label: "Delivered",   color: "#10b981", bg: "#d1fae5" },
  completed:  { label: "Completed",   color: "#10b981", bg: "#d1fae5" },
  rejected:   { label: "Rejected",    color: "#ef4444", bg: "#fee2e2" },
};

export const MOCK_SUPPLIER_ORDERS: SupplierOrder[] = [
  {
    id: "QL-2024-0089",
    material: "Granite (3/4 Inch)",
    quantity: 25,
    customerName: "Adebayo Okonkwo",
    customerCompany: "Skyline Construction",
    deliveryAddress: "24 Adeola Odeku, Victoria Island, Lagos",
    total: 355000,
    status: "dispatched",
    createdAt: "2024-05-07T09:22:00Z",
    paymentStatus: "in_escrow",
  },
  {
    id: "QL-2024-0091",
    material: "Granite (3/4 Inch)",
    quantity: 50,
    customerName: "Fatima Bello",
    customerCompany: "Bello Constructions",
    deliveryAddress: "Lekki Phase 1, Lagos",
    total: 710000,
    status: "new",
    createdAt: "2024-05-08T11:00:00Z",
    paymentStatus: "in_escrow",
  },
  {
    id: "QL-2024-0082",
    material: "Granite (3/4 Inch)",
    quantity: 30,
    customerName: "Ibrahim Musa",
    customerCompany: "Musa Builders",
    deliveryAddress: "Ikeja GRA, Lagos",
    total: 426000,
    status: "completed",
    createdAt: "2024-05-05T08:00:00Z",
    paymentStatus: "released",
  },
  {
    id: "QL-2024-0079",
    material: "Limestone Dust",
    quantity: 15,
    customerName: "Chisom Eze",
    customerCompany: "Eze & Sons Dev.",
    deliveryAddress: "Abuja, FCT",
    total: 195000,
    status: "completed",
    createdAt: "2024-05-03T14:30:00Z",
    paymentStatus: "released",
  },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: "inv1",
    name: "Granite (3/4 Inch)",
    category: "Granite",
    pricePerTon: 14200,
    stockTons: 850,
    reservedTons: 75,
    minOrder: 10,
    available: true,
  },
  {
    id: "inv2",
    name: "Granite (1/2 Inch)",
    category: "Granite",
    pricePerTon: 13500,
    stockTons: 320,
    reservedTons: 0,
    minOrder: 10,
    available: true,
  },
  {
    id: "inv3",
    name: "Limestone Dust",
    category: "Limestone",
    pricePerTon: 9800,
    stockTons: 180,
    reservedTons: 15,
    minOrder: 5,
    available: true,
  },
  {
    id: "inv4",
    name: "Crushed Stone (Base Course)",
    category: "Gravel",
    pricePerTon: 11200,
    stockTons: 0,
    reservedTons: 0,
    minOrder: 20,
    available: false,
  },
];

export const MOCK_SUPPLIER_STATS = {
  totalRevenue: 4280000,
  escrowHeld: 1065000,
  totalOrders: 47,
  pendingOrders: 2,
  completedOrders: 44,
  avgRating: 4.6,
  totalStockTons: 1350,
};
