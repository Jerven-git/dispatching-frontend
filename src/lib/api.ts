const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_URL = `${BASE_URL}/api`;

export interface ApiValidationError {
  message: string;
  errors: Record<string, string[]>;
}

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

class ApiClient {
  async getCsrfCookie(): Promise<void> {
    await fetch(`${BASE_URL}/sanctum/csrf-cookie`, {
      credentials: 'include',
    });
  }

  private getCsrfToken(): string {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='));
    if (!match) return '';
    return decodeURIComponent(match.split('=')[1]);
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
      response = await fetch(`${API_URL}${endpoint}`, {
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
        window.location.href = '/login';
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

  get<T>(endpoint: string, params?: Record<string, string>) {
    const query = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>(`${endpoint}${query}`);
  }

  post<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
