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
 * Usage — replace every getSession() / DUMMY_USERS reference:
 *
 *   const { user, profile, loading } = useCurrentUser();
 *   if (loading) return <Spinner />;
 *   <p>{user.first_name}</p>
 *   <p>{profile?.business_name}</p>   // AgentProfile
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import { api, clearTokens, getSessionUser } from "@/lib/api";

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

// Role-specific profile — fields differ per role but we keep it loose
// so all dashboards can use one type without casting.
export type RoleProfile = Record<string, unknown>;

export interface CurrentUserResult {
  user:        BackendUser | null;
  profile:     RoleProfile | null;
  loading:     boolean;
  error:       string | null;
  /** Manually re-fetch (e.g. after updating profile) */
  refresh:     () => void;
  /** Convenience: initials for avatar */
  initials:    string;
  /** Convenience: display name */
  displayName: string;
}

// ── Hook ───────────────────────────────────────────────────────────

export function useCurrentUser(): CurrentUserResult {
  const [user,    setUser]    = useState<BackendUser | null>(null);
  const [profile, setProfile] = useState<RoleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetch_() {
      setLoading(true);
      setError(null);

      try {
        const res  = await api("/users/me/");
        const data = await res.json();

        if (cancelled) return;

        if (res.ok && data?.data?.user) {
          setUser(data.data.user);
          setProfile(data.data.profile ?? null);

          // Keep sessionStorage in sync so other code that reads
          // ql_user gets fresh values without a full re-fetch.
          const u = data.data.user as BackendUser;
          sessionStorage.setItem("ql_user", JSON.stringify({
            id:          u.id,
            email:       u.email,
            phone:       u.phone_number,
            firstName:   u.first_name,
            lastName:    u.last_name,
            role:        ROLE_SLUG[u.role] ?? u.role.toLowerCase(),
            backendRole: u.role,
            avatar:      `${u.first_name[0]}${u.last_name[0]}`.toUpperCase(),
          }));
        } else if (res.status === 401) {
          // Token fully expired and refresh failed — api.ts already redirected
        } else {
          setError(data?.message ?? "Failed to load profile.");
        }
      } catch {
        if (!cancelled) setError("Network error loading profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Fast path: show cached session data immediately while the
    // real fetch is in flight, so dashboards don't flash blank.
    const cached = getSessionUser();
    if (cached && !user) {
      setUser({
        id:              cached.id,
        email:           cached.email ?? null,
        phone_number:    cached.phone ?? null,
        first_name:      cached.firstName,
        last_name:        cached.lastName,
        role:            cached.backendRole ?? cached.role?.toUpperCase(),
        is_verified:     true,
        profile_picture: null,
        created_at:      "",
      });
    }

    fetch_();
    return () => { cancelled = true; };
  }, [tick]);

  const initials = user
    ? `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase()
    : "??";

  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim()
    : "";

  return {
    user,
    profile,
    loading,
    error,
    refresh: () => setTick(t => t + 1),
    initials,
    displayName,
  };
}

// ── Helpers ───────────────────────────────────────────────────────

const ROLE_SLUG: Record<string, string> = {
  CUSTOMER:        "customer",
  AGENT:           "supplier",
  LOGISTICS:       "driver",
  PROJECT_MANAGER: "pm",
  FINANCE:         "financial",
  QUARRY_OWNER:    "supplier",
};