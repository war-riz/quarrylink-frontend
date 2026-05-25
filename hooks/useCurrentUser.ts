"use client";

/**
 * useCurrentUser
 * ─────────────────────────────────────────────────────────────────
 * Wired to: GET /api/users/me/
 *
 * Returns the authenticated user + their role-specific profile.
 *
 * Backend response shape:
 * {
 *   success: true,
 *   data: {
 *     user: { id, email, phone_number, first_name, last_name,
 *             role, is_verified, profile_picture, created_at },
 *     profile: { ...role-specific fields }
 *   }
 * }
 *
 * Strategy:
 *   1. Immediately hydrate from sessionStorage so dashboards render
 *      without a flash of blank state.
 *   2. Fire GET /users/me/ in the background and update (and re-sync
 *      sessionStorage) when it resolves.
 *   3. On 401 the api() wrapper already clears tokens + redirects to
 *      /dev-login, so we don't need to handle that here.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import { api, getSessionUser } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────

export interface BackendUser {
  id:              string;
  email:           string | null;
  phone_number:    string | null;
  first_name:      string;
  last_name:       string;
  role:            string;
  is_verified:     boolean;
  profile_picture: string | null;
  created_at:      string;
}

export type RoleProfile = Record<string, unknown>;

export interface CurrentUserResult {
  user:        BackendUser | null;
  profile:     RoleProfile | null;
  loading:     boolean;
  error:       string | null;
  refresh:     () => void;
  initials:    string;
  displayName: string;
}

// ── Role slug map ─────────────────────────────────────────────────

const ROLE_SLUG: Record<string, string> = {
  CUSTOMER:        "customer",
  AGENT:           "supplier",
  LOGISTICS:       "driver",
  PROJECT_MANAGER: "pm",
  FINANCE:         "financial",
  QUARRY_OWNER:    "supplier",
};

// ── Build a BackendUser from the lightweight session cache ─────────

function userFromSession(cached: Record<string, string>): BackendUser {
  return {
    id:              cached.id            ?? "",
    email:           cached.email         ?? null,
    phone_number:    cached.phone         ?? null,
    first_name:      cached.firstName     ?? "",
    last_name:       cached.lastName      ?? "",
    role:            cached.backendRole   ?? cached.role?.toUpperCase() ?? "",
    is_verified:     true,
    profile_picture: null,
    created_at:      "",
  };
}

// ── Hook ───────────────────────────────────────────────────────────

export function useCurrentUser(): CurrentUserResult {
  const cached = typeof window !== "undefined" ? getSessionUser() : null;

  // Seed state immediately from cache so the UI renders without waiting
  const [user,    setUser]    = useState<BackendUser | null>(
    cached ? userFromSession(cached) : null
  );
  const [profile, setProfile] = useState<RoleProfile | null>(null);
  // If we already have cached data, don't show a loading spinner
  const [loading, setLoading] = useState(!cached);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchMe() {
      // Only show loading spinner on first load if there's no cached data
      if (!user) setLoading(true);
      setError(null);

      try {
        const res  = await api("/users/me/");
        const data = await res.json();

        if (cancelled) return;

        if (res.ok && data?.data?.user) {
          const u = data.data.user as BackendUser;
          setUser(u);
          setProfile(data.data.profile ?? null);

          // Keep sessionStorage in sync with fresh server data
          sessionStorage.setItem("ql_user", JSON.stringify({
            id:          u.id,
            email:       u.email,
            phone:       u.phone_number,
            firstName:   u.first_name,
            lastName:    u.last_name,
            role:        ROLE_SLUG[u.role] ?? u.role.toLowerCase(),
            backendRole: u.role,
            avatar:      `${u.first_name[0] ?? ""}${u.last_name[0] ?? ""}`.toUpperCase(),
          }));
        } else if (res.status === 401) {
          // api() already handles redirect on 401 — nothing to do here
        } else {
          setError(data?.message ?? "Failed to load profile.");
        }
      } catch {
        if (!cancelled) setError("Network error loading profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMe();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || "??"
    : "??";

  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim()
    : "";

  return {
    user,
    profile,
    loading,
    error,
    refresh:     () => setTick(t => t + 1),
    initials,
    displayName,
  };
}