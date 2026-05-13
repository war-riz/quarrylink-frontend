"use client";

/**
 * useNotifications
 * ─────────────────────────────────────────────────────────────────
 * Wired to:
 *   GET    /api/notifications/                  list (filterable)
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
 * Usage in any dashboard shell:
 *
 *   const {
 *     notifications, unreadCount, loading,
 *     markRead, markAllRead, remove, clearAll
 *   } = useNotifications();
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────

export interface Notification {
  id:                         string;
  title:                      string;
  message:                    string;
  notification_type:          string;
  notification_type_display:  string;
  is_read:                    boolean;
  read_at:                    string | null;
  action_url:                 string | null;
  data:                       Record<string, unknown> | null;
  created_at:                 string;
  time_ago:                   string;
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
  /** Re-fetch from backend */
  refresh:       () => void;
  /** Filter to unread only */
  filterUnread:  () => void;
  /** Remove filter — show all */
  filterAll:     () => void;
}

// ── Hook ───────────────────────────────────────────────────────────

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [unreadOnly,    setUnreadOnly]    = useState(false);
  const [tick,          setTick]          = useState(0);

  // ── Fetch list + badge count ────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
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
        // Paginated response: { results: [...] } or { data: [...] }
        const items: Notification[] =
          listData?.results ?? listData?.data ?? [];
        setNotifications(items);
      } else {
        setError(listData?.message ?? "Failed to load notifications.");
      }

      if (countRes.ok) {
        setUnreadCount(countData?.data?.unread_count ?? 0);
      }
    } catch {
      setError("Network error loading notifications.");
    } finally {
      setLoading(false);
    }
  }, [unreadOnly, tick]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Poll for new notifications every 60 s ─────────────────────
  // Replace this with a WebSocket once your backend exposes one.
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  // ── Mark one read ─────────────────────────────────────────────

  async function markRead(id: string) {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount(c => Math.max(0, c - 1));

    try {
      await api(`/notifications/${id}/read/`, { method: "POST" });
    } catch {
      // Revert on error
      setTick(t => t + 1);
    }
  }

  // ── Mark all read ─────────────────────────────────────────────

  async function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await api("/notifications/mark-all-read/", { method: "POST" });
    } catch {
      setTick(t => t + 1);
    }
  }

  // ── Delete one ────────────────────────────────────────────────

  async function remove(id: string) {
    const removed = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (removed && !removed.is_read) {
      setUnreadCount(c => Math.max(0, c - 1));
    }

    try {
      await api(`/notifications/${id}/`, { method: "DELETE" });
    } catch {
      setTick(t => t + 1);
    }
  }

  // ── Clear all ─────────────────────────────────────────────────

  async function clearAll() {
    setNotifications([]);
    setUnreadCount(0);

    try {
      await api("/notifications/clear-all/", { method: "DELETE" });
    } catch {
      setTick(t => t + 1);
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markRead,
    markAllRead,
    remove,
    clearAll,
    refresh:     () => setTick(t => t + 1),
    filterUnread: () => setUnreadOnly(true),
    filterAll:    () => setUnreadOnly(false),
  };
}