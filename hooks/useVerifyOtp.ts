/**
 * lib/api.ts
 * ─────────────────────────────────────────────────────────────────
 * Central fetch wrapper with automatic JWT token refresh.
 *
 * Usage:
 *   import { api } from "@/lib/api";
 *   const res = await api("/users/me/");
 *   const data = await res.json();
 *
 * Replace every raw fetch() in the codebase with api().
 * It silently refreshes the access token on 401 and retries once.
 * On second 401 (refresh also expired) it clears tokens and
 * redirects to /dev-login.
 * ─────────────────────────────────────────────────────────────────
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://quarrylink-backend.onrender.com/api";

const ACCESS_TOKEN_KEY  = "ql_access_token";
const REFRESH_TOKEN_KEY = "ql_refresh_token";

// ── Token helpers ─────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem("ql_user");
}

// ── Silent token refresh ──────────────────────────────────────────

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${BASE_URL}/users/auth/refresh/`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refresh }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const newAccess = data?.data?.access ?? data?.access;
    if (newAccess) {
      localStorage.setItem(ACCESS_TOKEN_KEY, newAccess);
      return newAccess;
    }
    return null;
  } catch {
    return null;
  }
}

// ── Main fetch wrapper ────────────────────────────────────────────

/**
 * api(path, options?)
 *
 * `path` can be:
 *   - relative:  "/users/me/"  → prepended with BASE_URL
 *   - absolute:  "https://..."  → used as-is
 */
export async function api(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(url, { ...options, headers });

  // ── Silent refresh on 401 ─────────────────────────────────────
  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    } else {
      // Refresh expired — log the user out
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/dev-login";
      }
    }
  }

  return res;
}

// ── Logout helper ─────────────────────────────────────────────────
// Call this wherever you currently call clearSession()

export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  const access  = getAccessToken();

  if (refresh && access) {
    try {
      // Blacklist the refresh token on the backend
      await fetch(`${BASE_URL}/users/auth/logout/`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${access}`,
        },
        body: JSON.stringify({ refresh }),
      });
    } catch {
      // Ignore network errors — always clear locally
    }
  }

  clearTokens();

  if (typeof window !== "undefined") {
    window.location.href = "/dev-login";
  }
}

// ── Current user helper ───────────────────────────────────────────
// Returns the lightweight session object saved during login/verify.
// For fresh data use: await api("/users/me/")

export function getSessionUser(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("ql_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}