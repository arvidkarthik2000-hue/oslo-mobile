/**
 * OSLO API client — runtime-configurable base URL.
 *
 * The URL is determined by (in priority order):
 * 1. Runtime override via setApiUrl() (saved to AsyncStorage)
 * 2. Build-time EXPO_PUBLIC_API_URL env var (set in eas.json)
 * 3. Fallback default
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/auth';

let BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:8000';

/** Get the current API base URL. */
export function getApiUrl(): string {
  return BASE_URL;
}

/** Set a new API base URL at runtime (persisted across restarts). */
export async function setApiUrl(url: string): Promise<void> {
  // Strip trailing slash
  BASE_URL = url.replace(/\/+$/, '');
  await AsyncStorage.setItem('oslo_api_base_url', BASE_URL);
}

/** Load saved API URL from storage. Call once during app init, before any API calls. */
export async function initApiUrl(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem('oslo_api_base_url');
    if (saved) BASE_URL = saved;
  } catch {
    // Ignore — use default
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  /** Skip auth header (for login/signup endpoints). */
  noAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(`${status}: ${detail}`);
    this.name = 'ApiError';
  }
}

async function request<T = unknown>(
  method: Method,
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...opts.headers,
  };

  if (!opts.noAuth) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch {}

    // If 401 and we have a refresh token, try refresh
    if (res.status === 401 && !opts.noAuth) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        // Retry once with new token
        return request<T>(method, path, opts);
      }
    }

    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  const { refreshToken, setTokens, ownerId, logout } = useAuthStore.getState();
  if (!refreshToken || !ownerId) {
    logout();
    return false;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      logout();
      return false;
    }
    const data = await res.json();
    setTokens(data.access_token, refreshToken, ownerId);
    return true;
  } catch {
    logout();
    return false;
  }
}

// Convenience methods
export const api = {
  get: <T = unknown>(path: string, opts?: RequestOptions) =>
    request<T>('GET', path, opts),
  post: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, { ...opts, body }),
  put: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PUT', path, { ...opts, body }),
  patch: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PATCH', path, { ...opts, body }),
  delete: <T = unknown>(path: string, opts?: RequestOptions) =>
    request<T>('DELETE', path, opts),
};
