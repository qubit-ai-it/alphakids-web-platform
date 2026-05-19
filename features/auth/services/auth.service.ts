import { api } from '../../../shared/lib/api-client';
import type { LoginResponse, User } from '../../../shared/lib/types';

const TOKEN_KEY = 'access_token';

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
      await api.post('/auth/logout');
    } finally {
      authService.removeToken();
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

  isAuthenticated(): boolean {
    return !!authService.getToken();
  },
};
