export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role?: "admin" | "user";
  created_at?: number;
}

export const PRESET_ACCOUNTS: Record<"admin" | "user", AuthUser> = {
  admin: {
    id: 1,
    name: "Station Admin",
    email: "admin@thermoshelter.com",
    role: "admin",
  },
  user: {
    id: 2,
    name: "Field Researcher",
    email: "user@thermoshelter.com",
    role: "user",
  },
};

const TOKEN_KEY = "thermo-shelter-auth-token";
const USER_KEY = "thermo-shelter-auth-user";

export function saveAuth(accessToken: string, user: AuthUser) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, accessToken);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export async function loginAsPreset(role: "admin" | "user"): Promise<AuthUser> {
  try {
    const res = await fetch("/backend-api/api/auth/quick-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      const data = await res.json();
      saveAuth(data.access_token, data.user);
      return data.user;
    }
  } catch {
    // Backend offline or starting up
  }

  // Resilient instant client session fallback
  const fallbackUser = PRESET_ACCOUNTS[role];
  saveAuth(`preset-token-${role}-${Date.now()}`, fallbackUser);
  return fallbackUser;
}
