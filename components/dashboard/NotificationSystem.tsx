"use client";

/**
 * Notification System
 * ─────────────────────────────────────────────────────────────────────────────
 * Two parts:
 *   1. useNotifications hook  — manages notification state
 *   2. NotificationCenter    — dropdown panel from topbar bell
 *   3. ToastContainer        — floating toast stack (bottom-right)
 *
 * 🔌 BACKEND INTEGRATION:
 *   Push notifications via:
 *   - WebSocket: socket.on("notification", addNotification)
 *   - Firebase FCM: onMessage(messaging, (payload) => addNotification(...))
 *   - Polling: GET /api/notifications?since=lastFetchTime  every 15s
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  Info,
  ShieldCheck,
  CreditCard,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────

export type NotificationType =
  | "order_accepted"
  | "driver_assigned"
  | "in_transit"
  | "arriving_soon"
  | "delivered"
  | "completed"
  | "payment"
  | "info"
  | "warning";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  orderId?: string;
  timestamp: Date;
  read: boolean;
}

// ── Mock seeded notifications ─────────────────────────────────────

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "in_transit",
    title: "Driver En Route",
    message: "Emeka Okafor is on the way with your 25 tons of Granite. ETA: 2:45 PM.",
    orderId: "QL-2024-0089",
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    read: false,
  },
  {
    id: "n2",
    type: "order_accepted",
    title: "Order Accepted",
    message: "Abeokuta Stone Works accepted your order for Granite (3/4 Inch).",
    orderId: "QL-2024-0089",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    read: false,
  },
  {
    id: "n3",
    type: "payment",
    title: "Escrow Funded",
    message: "₦420,000 secured in escrow for order QL-2024-0089.",
    orderId: "QL-2024-0089",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
  },
  {
    id: "n4",
    type: "completed",
    title: "Delivery Confirmed",
    message: "Order QL-2024-0081 complete. Payment released to Lagos Quarry Ltd.",
    orderId: "QL-2024-0081",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    read: true,
  },
];

// ── Context ───────────────────────────────────────────────────────

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  toasts: ToastItem[];
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider");
  return ctx;
}

// ── Toast item ────────────────────────────────────────────────────

interface ToastItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

// ── Provider ──────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (n: Omit<AppNotification, "id" | "timestamp" | "read">) => {
      const newNotif: AppNotification = {
        ...n,
        id: `n-${Date.now()}`,
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      // Also show as toast
      setToasts((prev) => [
        { id: newNotif.id, type: n.type, title: n.title, message: n.message },
        ...prev.slice(0, 2), // max 3 toasts
      ]);
    },
    []
  );

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 🔌 REPLACE THIS with real subscription:
  // useEffect(() => {
  //   const socket = io(process.env.NEXT_PUBLIC_WS_URL!);
  //   socket.on("notification", addNotification);
  //   return () => { socket.off("notification"); socket.disconnect(); };
  // }, [addNotification]);

  // STUB: simulate a new notification after 15s for demo purposes
  useEffect(() => {
    const t = setTimeout(() => {
      addNotification({
        type: "arriving_soon",
        title: "Driver Arriving Soon!",
        message: "Emeka Okafor is 5 minutes away. Please prepare your site for delivery.",
        orderId: "QL-2024-0089",
      });
    }, 15000);
    return () => clearTimeout(t);
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markRead,
        markAllRead,
        dismiss,
        toasts,
        dismissToast,
      }}
    >
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  );
}

// ── Notification icon by type ─────────────────────────────────────

const NOTIF_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  order_accepted:  { icon: Package,      color: "#3b82f6", bg: "#dbeafe" },
  driver_assigned: { icon: Truck,        color: "#8b5cf6", bg: "#ede9fe" },
  in_transit:      { icon: Truck,        color: "#f97316", bg: "#ffedd5" },
  arriving_soon:   { icon: MapPin,       color: "#ef4444", bg: "#fee2e2" },
  delivered:       { icon: CheckCircle2, color: "#10b981", bg: "#d1fae5" },
  completed:       { icon: CheckCircle2, color: "#10b981", bg: "#d1fae5" },
  payment:         { icon: CreditCard,   color: "#ffc107", bg: "#fef9c3" },
  info:            { icon: Info,         color: "#6b7280", bg: "#f3f4f6" },
  warning:         { icon: AlertCircle,  color: "#f59e0b", bg: "#fef3c7" },
};

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return "Just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Notification Center (dropdown) ────────────────────────────────

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead, dismiss } =
    useNotifications();

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-4 h-4 bg-[#ffc107] rounded-full flex items-center justify-center"
          >
            <span className="text-[9px] font-extrabold text-[#121212]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-xl border border-zinc-100 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-[15px] text-[#121212]">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="bg-[#ffc107] text-[#121212] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[12px] font-bold text-zinc-400 hover:text-[#121212] transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[400px] overflow-y-auto divide-y divide-zinc-50">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Bell className="w-8 h-8 text-zinc-200 mb-2" />
                    <p className="text-[13px] text-zinc-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const cfg = NOTIF_CONFIG[notif.type];
                    const Icon = cfg.icon;
                    return (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        onClick={() => markRead(notif.id)}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-zinc-50 transition-colors relative",
                          !notif.read && "bg-[#fffdf0]"
                        )}
                      >
                        {!notif.read && (
                          <div className="absolute left-1.5 top-4 w-1.5 h-1.5 rounded-full bg-[#ffc107]" />
                        )}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: cfg.bg }}
                        >
                          <Icon className="w-4.5 h-4.5" style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[13px] text-[#121212]">
                            {notif.title}
                          </p>
                          <p className="text-[12px] text-zinc-500 leading-snug mt-0.5">
                            {notif.message}
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            {timeAgo(notif.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismiss(notif.id);
                          }}
                          className="shrink-0 text-zinc-300 hover:text-zinc-500 transition-colors mt-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-zinc-100 text-center">
                <button className="text-[12px] font-bold text-zinc-400 hover:text-[#121212] transition-colors">
                  View all notifications
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Toast container ───────────────────────────────────────────────

function ToastContainer() {
  const { toasts, dismissToast } = useNotifications();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const cfg = NOTIF_CONFIG[toast.type];
          const Icon = cfg.icon;

          // Auto-dismiss after 5s
          return (
            <AutoDismissToast
              key={toast.id}
              toast={toast}
              cfg={cfg}
              Icon={Icon}
              onDismiss={() => dismissToast(toast.id)}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function AutoDismissToast({
  toast,
  cfg,
  Icon,
  onDismiss,
}: {
  toast: ToastItem;
  cfg: { icon: React.ElementType; color: string; bg: string };
  Icon: React.ElementType;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.92 }}
      transition={{ duration: 0.25, type: "spring", damping: 22 }}
      className="pointer-events-auto w-[320px] bg-white border border-zinc-100 rounded-2xl shadow-xl flex items-start gap-3 px-4 py-3.5 overflow-hidden"
    >
      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 5, ease: "linear" }}
        className="absolute bottom-0 left-0 h-0.5 w-full origin-left"
        style={{ background: cfg.color }}
      />

      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: cfg.bg }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: cfg.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-[13px] text-[#121212]">{toast.title}</p>
        <p className="text-[12px] text-zinc-500 leading-snug mt-0.5 line-clamp-2">
          {toast.message}
        </p>
      </div>

      <button
        onClick={onDismiss}
        className="shrink-0 text-zinc-300 hover:text-zinc-500 transition-colors mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
