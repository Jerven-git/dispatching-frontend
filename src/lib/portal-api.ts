const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const PORTAL_API_URL = `${BASE_URL}/api/portal`;

import { ApiError } from './api';

const DEFAULT_CACHE_TTL = 30_000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class PortalApiClient {
  private cache = new Map<string, CacheEntry<unknown>>();
  private inflight = new Map<string, Promise<unknown>>();
  private csrfTokenCache: string | null = null;
  private csrfCookieString: string | null = null;

  async getCsrfCookie(): Promise<void> {
    await fetch(`${BASE_URL}/sanctum/csrf-cookie`, {
      credentials: 'include',
    });
    this.csrfTokenCache = null;
  }

  private getCsrfToken(): string {
    const currentCookie = document.cookie;
    if (this.csrfTokenCache !== null && this.csrfCookieString === currentCookie) {
      return this.csrfTokenCache;
    }
    this.csrfCookieString = currentCookie;
    const match = currentCookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='));
    this.csrfTokenCache = match ? decodeURIComponent(match.split('=')[1]) : '';
    return this.csrfTokenCache;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-XSRF-TOKEN': this.getCsrfToken(),
      ...options.headers,
    };

    let response: Response;
    try {
      response = await fetch(`${PORTAL_API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });
    } catch {
      throw new ApiError(
        'Unable to connect to the server. Please check your connection and try again.',
        0
      );
    }

    if (response.status === 401) {
      if (typeof window !== 'undefined' && !endpoint.includes('/me')) {
        window.location.href = '/portal/login';
      }
      throw new ApiError('Unauthorized', 401);
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new ApiError(
        body.message || `Request failed: ${response.status}`,
        response.status,
        body.errors || {}
      );
    }

    return response.json();
  }

  get<T>(endpoint: string, params?: Record<string, string>, options?: { cacheTtl?: number; skipCache?: boolean }): Promise<T> {
    const query = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    const url = `${endpoint}${query}`;
    const ttl = options?.cacheTtl ?? DEFAULT_CACHE_TTL;

    if (!options?.skipCache) {
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.timestamp < ttl) {
        return Promise.resolve(cached.data as T);
      }
    }

    const existing = this.inflight.get(url);
    if (existing) return existing as Promise<T>;

    const promise = this.request<T>(url)
      .then((data) => {
        this.cache.set(url, { data, timestamp: Date.now() });
        return data;
      })
      .finally(() => {
        this.inflight.delete(url);
      });

    this.inflight.set(url, promise);
    return promise;
  }

  post<T>(endpoint: string, data?: unknown) {
    this.invalidateCache(endpoint);
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /** Download a file as blob (for PDF downloads) */
  async download(endpoint: string): Promise<Blob> {
    const response = await fetch(`${PORTAL_API_URL}${endpoint}`, {
      headers: {
        Accept: 'application/pdf',
        'X-XSRF-TOKEN': this.getCsrfToken(),
      },
      credentials: 'include',
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/portal/login';
      }
      throw new ApiError('Unauthorized', 401);
    }

    if (!response.ok) {
      throw new ApiError(`Download failed: ${response.status}`, response.status);
    }

    return response.blob();
  }

  private invalidateCache(endpoint: string) {
    const base = endpoint.split('?')[0];
    for (const key of this.cache.keys()) {
      if (key.startsWith(base)) {
        this.cache.delete(key);
      }
    }
  }

  clearCache() {
    this.cache.clear();
    this.inflight.clear();
  }
}

export const portalApi = new PortalApiClient();
