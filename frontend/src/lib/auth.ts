import type {
  User,
  LoginCredentials,
  RegisterData,
  TokenResponse,
} from "@/types/user";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail ?? "ログインに失敗しました");
  }

  const token: TokenResponse = await res.json();
  accessToken = token.access_token;

  return getMe();
}

export async function register(data: RegisterData): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail ?? "登録に失敗しました");
  }

  // Auto-login after registration
  return login({ email: data.email, password: data.password });
}

export async function getMe(): Promise<User> {
  if (!accessToken) {
    throw new Error("認証が必要です");
  }

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    accessToken = null;
    throw new Error("認証が切れました");
  }

  return res.json();
}

export async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      accessToken = null;
      return false;
    }

    const token: TokenResponse = await res.json();
    accessToken = token.access_token;
    return true;
  } catch {
    accessToken = null;
    return false;
  }
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
  accessToken = null;
}
