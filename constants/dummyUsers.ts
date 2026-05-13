/**
 * dummyUsers.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Dummy credentials for testing all 4 user types.
 * 🔌 Replace with real auth (NextAuth, Supabase, JWT, etc.)
 *
 * TEST ACCOUNTS:
 *   Customer:     customer@test.com     / Test1234!
 *   Supplier:     supplier@test.com     / Test1234!
 *   Driver:       driver@test.com       / Test1234!
 *   Financial:    financial@test.com    / Test1234!
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type UserRole = "customer" | "supplier" | "driver" | "financial" | "pm";

export interface DummyUser {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  company: string;
  phone: string;
  avatar: string; // initials
  kycVerified: boolean;
  location: string;
}

export const DUMMY_USERS: DummyUser[] = [
  {
    id: "usr_001",
    email: "customer@test.com",
    password: "Test1234!",
    role: "customer",
    name: "Adebayo Okonkwo",
    company: "Skyline Construction Ltd",
    phone: "+234 802 345 6789",
    avatar: "AO",
    kycVerified: true,
    location: "Victoria Island, Lagos",
  },
  {
    id: "usr_002",
    email: "supplier@test.com",
    password: "Test1234!",
    role: "supplier",
    name: "Chukwuemeka Obi",
    company: "Abeokuta Stone Works",
    phone: "+234 803 456 7890",
    avatar: "CO",
    kycVerified: true,
    location: "Abeokuta, Ogun State",
  },
  {
    id: "usr_003",
    email: "driver@test.com",
    password: "Test1234!",
    role: "driver",
    name: "Emeka Okafor",
    company: "QuarryLink Logistics",
    phone: "+234 812 345 6789",
    avatar: "EO",
    kycVerified: true,
    location: "Ikeja, Lagos",
  },
  {
    id: "usr_004",
    email: "financial@test.com",
    password: "Test1234!",
    role: "financial",
    name: "Ngozi Adeyemi",
    company: "First Continental Bank",
    phone: "+234 801 234 5678",
    avatar: "NA",
    kycVerified: true,
    location: "Marina, Lagos",
  },

  {
    id: "usr_005",
    email: "pm@quarrylink.ng",
    password: "Test1234!",
    role: "pm",
    name: "Adaeze Nwosu",
    company: "QuarryLink Operations",
    phone: "+234 801 111 2222",
    avatar: "AN",
    kycVerified: true,
    location: "Victoria Island, Lagos",
  },
];

export const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    description: string;
    color: string;
    bg: string;
    icon: string;
    dashboardPath: string;
  }
> = {
  customer: {
    label: "Customer / Contractor",
    description: "Order materials, track deliveries, manage payments",
    color: "#3b82f6",
    bg: "#dbeafe",
    icon: "🏗️",
    dashboardPath: "/dashboard",
  },
  supplier: {
    label: "Quarry Supplier",
    description: "Manage inventory, receive orders, track revenue",
    color: "#10b981",
    bg: "#d1fae5",
    icon: "⛏️",
    dashboardPath: "/supplier/dashboard",
  },
  driver: {
    label: "Logistics Driver",
    description: "View deliveries, navigate routes, earn per trip",
    color: "#f97316",
    bg: "#ffedd5",
    icon: "🚛",
    dashboardPath: "/driver/dashboard",
  },
  financial: {
    label: "Financial Institution",
    description: "Monitor escrow, manage trade financing, risk data",
    color: "#8b5cf6",
    bg: "#ede9fe",
    icon: "🏦",
    dashboardPath: "/financial/dashboard",
  },

  pm: {
    label: "Project Manager",
    description: "KYC approvals, dispute resolution, platform monitoring",
    color: "#8b5cf6",
    bg: "#ede9fe",
    icon: "🛡️",
    dashboardPath: "/pm/dashboard",
  },
};

/** Simple client-side auth — 🔌 replace with real auth */
export function authenticateUser(
  email: string,
  password: string
): DummyUser | null {
  return (
    DUMMY_USERS.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    ) ?? null
  );
}

/** Save session to localStorage — 🔌 replace with JWT/cookie/session */
export function saveSession(user: DummyUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem("ql_session", JSON.stringify({ userId: user.id, role: user.role }));
}

export function getSession(): { userId: string; role: UserRole } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ql_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("ql_session");
}

export function getUserFromSession(): DummyUser | null {
  const session = getSession();
  if (!session) return null;
  return DUMMY_USERS.find((u) => u.id === session.userId) ?? null;
}
