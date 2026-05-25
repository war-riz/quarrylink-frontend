"use client";

/**
 * useNotifications
 * ─────────────────────────────────────────────────────────────────
 * Wired to:
 *   GET    /api/notifications/                  list
 *   GET    /api/notifications/unread-count/     badge count
 *   POST   /api/notifications/{id}/read/        mark one read
 *   POST   /api/notifications/mark-all-read/    mark all read
 *   DELETE /api/notifications/{id}/             delete one
 *   DELETE /api/notifications/clear-all/        clear all
 *
 * Backend notification shape:
 * {
 *   id, title, message, notification_type,
 *   notification_type_display, is_read, read_at,
 *   action_url, data, created_at, time_ago
 * }
 *
 * Polling pauses when the browser tab is hidden to avoid
 * unnecessary requests.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────

export interface Notification {
  id:                        string;
  title:                     string;
  message:                   string;
  notification_type:         string;
  notification_type_display: string;
  is_read:                   boolean;
  read_at:                   string | null;
  action_url:                string | null;
  data:                      Record<string, unknown> | null;
  created_at:                string;
  time_ago:                  string;
}

export interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount:   number;
  loading:       boolean;
  error:         string | null;
  markRead:      (id: string) => Promise<void>;
  markAllRead:   () => Promise<void>;
  remove:        (id: string) => Promise<void>;
  clearAll:      () => Promise<void>;
  refresh:       () => void;
  filterUnread:  () => void;
  filterAll:     () => void;
}

const POLL_INTERVAL_MS = 60_000; // 60 s

// ── Hook ───────────────────────────────────────────────────────────

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [unreadOnly,    setUnreadOnly]    = useState(false);
  const [tick,          setTick]          = useState(0);

  // Track in-flight optimistic removals so reverts work correctly
  const prevNotifications = useRef<Notification[]>([]);
  const prevUnreadCount   = useRef(0);

  // ── Fetch list + badge count ────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setError(null);

    try {
      const query = unreadOnly ? "?is_read=false" : "";

      const [listRes, countRes] = await Promise.all([
        api(`/notifications/${query}`),
        api("/notifications/unread-count/"),
      ]);

      const listData  = await listRes.json();
      const countData = await countRes.json();

      if (listRes.ok) {
        // Handle both paginated { results: [] } and flat { data: [] } shapes
        const items: Notification[] =
          listData?.results ??
          listData?.data    ??
          (Array.isArray(listData) ? listData : []);

        setNotifications(items);
      } else {
        setError(listData?.message ?? "Failed to load notifications.");
      }

      if (countRes.ok) {
        setUnreadCount(
          countData?.data?.unread_count ??
          countData?.unread_count       ??
          0
        );
      }
    } catch {
      setError("Network error loading notifications.");
    } finally {
      setLoading(false);
    }
  }, [unreadOnly, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    fetchAll();
  }, [fetchAll]);

  // ── Poll — pauses when tab is hidden ──────────────────────────────

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") {
        setTick(t => t + 1);
      }
    };

    const interval = setInterval(tick, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  // ── Mark one read ─────────────────────────────────────────────────

  const markRead = useCallback(async (id: string) => {
    // Optimistic update
    prevNotifications.current = notifications;
    prevUnreadCount.current   = unreadCount;

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount(c => Math.max(0, c - 1));

    try {
      const res = await api(`/notifications/${id}/read/`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
    } catch {
      // Revert on failure
      setNotifications(prevNotifications.current);
      setUnreadCount(prevUnreadCount.current);
    }
  }, [notifications, unreadCount]);

  // ── Mark all read ─────────────────────────────────────────────────

  const markAllRead = useCallback(async () => {
    prevNotifications.current = notifications;
    prevUnreadCount.current   = unreadCount;

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      const res = await api("/notifications/mark-all-read/", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setNotifications(prevNotifications.current);
      setUnreadCount(prevUnreadCount.current);
    }
  }, [notifications, unreadCount]);

  // ── Delete one ────────────────────────────────────────────────────

  const remove = useCallback(async (id: string) => {
    const removed = notifications.find(n => n.id === id);
    prevNotifications.current = notifications;
    prevUnreadCount.current   = unreadCount;

    setNotifications(prev => prev.filter(n => n.id !== id));
    if (removed && !removed.is_read) {
      setUnreadCount(c => Math.max(0, c - 1));
    }

    try {
      const res = await api(`/notifications/${id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setNotifications(prevNotifications.current);
      setUnreadCount(prevUnreadCount.current);
    }
  }, [notifications, unreadCount]);

  // ── Clear all ─────────────────────────────────────────────────────

  const clearAll = useCallback(async () => {
    prevNotifications.current = notifications;
    prevUnreadCount.current   = unreadCount;

    setNotifications([]);
    setUnreadCount(0);

    try {
      const res = await api("/notifications/clear-all/", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setNotifications(prevNotifications.current);
      setUnreadCount(prevUnreadCount.current);
    }
  }, [notifications, unreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markRead,
    markAllRead,
    remove,
    clearAll,
    refresh:      () => setTick(t => t + 1),
    filterUnread: () => setUnreadOnly(true),
    filterAll:    () => setUnreadOnly(false),
  };
}