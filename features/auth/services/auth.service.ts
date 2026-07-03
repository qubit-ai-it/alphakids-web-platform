import { api } from '../../../shared/lib/api-client';
import type { LoginResponse, User, Session } from '../../../shared/lib/types';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const authService = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/login', { email, password });
  },

  async register(
    email: string,
    password: string,
    name?: string,
  ): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/register', { email, password, name });
  },

  async getProfile(): Promise<User> {
    return api.get<User>('/auth/profile');
  },

  async logout(): Promise<void> {
    try {
      const refresh_token = authService.getRefreshToken();
      await api.post('/auth/logout', refresh_token ? { refresh_token } : undefined);
    } finally {
      authService.removeToken();
      authService.removeRefreshToken();
    }
  },

  async getAdminDashboard(): Promise<{ message: string }> {
    return api.get('/auth/admin');
  },

  async getDirectorDashboard(): Promise<{ message: string }> {
    return api.get('/auth/director');
  },

  async getTeacherDashboard(): Promise<{ message: string }> {
    return api.get('/auth/teacher');
  },

  async getParentDashboard(): Promise<{ message: string }> {
    return api.get('/auth/parent');
  },

  async forgotPassword(email: string): Promise<{ message: string; resetLink?: string }> {
    return api.post<{ message: string; resetLink?: string }>('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/reset-password', { token, password });
  },

  async setupPassword(token: string, password: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/setup-password', { token, password });
  },

  isAuthenticated(): boolean {
    return !!authService.getToken();
  },

  async getSessions(): Promise<Session[]> {
    return api.get<Session[]>('/auth/sessions');
  },

  async revokeSession(sessionId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/auth/sessions/${sessionId}`);
  },

  async revokeOtherSessions(refresh_token: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>('/auth/sessions', { refresh_token });
  },
};
