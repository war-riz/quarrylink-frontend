const ACCESS_TOKEN_KEY  = "ql_access_token";
const REFRESH_TOKEN_KEY = "ql_refresh_token";

export function getAccessToken()  { return typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY)  : null; }
export function getRefreshToken() { return typeof window !== "undefined" ? localStorage.getItem(REFRESH_TOKEN_KEY) : null; }

export function saveTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const { access } = await res.json();
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    return access;
  } catch {
    return null;
  }
}

export async function api(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    } else {
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
  }
  return res;
}