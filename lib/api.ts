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
 * Key behaviours:
 *   - Automatically attaches Bearer token from localStorage
 *   - On 401: silently refreshes the access token and retries once
 *   - On second 401: clears tokens and redirects to /dev-login
 *   - When body is FormData: does NOT set Content-Type so the browser
 *     can set the correct multipart boundary automatically
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

// ── Build headers ─────────────────────────────────────────────────
// When the body is FormData we must NOT set Content-Type — the browser
// sets it automatically with the correct multipart boundary.

function buildHeaders(
  body: RequestInit["body"],
  overrides: Record<string, string>,
  token: string | null,
): Record<string, string> {
  const headers: Record<string, string> = {};

  // Only set JSON content type when not sending FormData
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Merge caller overrides (but never let them force Content-Type on FormData)
  for (const [k, v] of Object.entries(overrides)) {
    if (body instanceof FormData && k.toLowerCase() === "content-type") continue;
    headers[k] = v;
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

// ── Main fetch wrapper ────────────────────────────────────────────

/**
 * api(path, options?)
 *
 * `path` can be:
 *   - relative:  "/users/me/"   → prepended with BASE_URL
 *   - absolute:  "https://..."  → used as-is
 */
export async function api(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  const token   = getAccessToken();
  const headers = buildHeaders(
    options.body ?? null,
    (options.headers as Record<string, string>) ?? {},
    token,
  );

  let res = await fetch(url, { ...options, headers });

  // ── Silent refresh on 401 ─────────────────────────────────────
  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      const retryHeaders = buildHeaders(
        options.body ?? null,
        (options.headers as Record<string, string>) ?? {},
        newToken,
      );
      res = await fetch(url, { ...options, headers: retryHeaders });
    } else {
      // Refresh token also expired — log the user out
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/dev-login";
      }
    }
  }

  return res;
}

// ── Logout helper ─────────────────────────────────────────────────

export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  const access  = getAccessToken();

  if (refresh && access) {
    try {
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