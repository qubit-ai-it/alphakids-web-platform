import type { ApiError } from './types';

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    _isRetry = false
  ): Promise<T> {
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      // Login/register 401 = credenciales inválidas, no "sesión expirada"
      const isCredentialRequest =
        endpoint.startsWith('/auth/login') ||
        endpoint.startsWith('/auth/register');

      if (response.status === 401 && !_isRetry && !isCredentialRequest) {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
        if (refreshToken) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshPromise = this.performRefresh(refreshToken).finally(() => {
              this.isRefreshing = false;
              this.refreshPromise = null;
            });
          }
          
          if (this.refreshPromise) {
            const newToken = await this.refreshPromise;
            if (newToken) {
              return this.request<T>(endpoint, options, true);
            }
          }
        }
        
        if (typeof window !== 'undefined' && (token || refreshToken)) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/?login=true&expired=true';
        }
      }
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'Error de conexión con el servidor' };
      }
      const error = new Error(errorData.message) as Error & { status: number };
      (error as Error & { status: number }).status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  private async performRefresh(refreshToken: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (response.ok) {
        const data = await response.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        return data.access_token;
      }
      return null;
    } catch {
      return null;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { 
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async upload<T>(endpoint: string, formData: FormData, method: 'POST' | 'PATCH' = 'POST'): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {};
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'Error de conexión con el servidor' };
      }
      const error = new Error(errorData.message) as Error & { status: number };
      (error as Error & { status: number }).status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }
}

export const api = new ApiClient(BASE_URL);
