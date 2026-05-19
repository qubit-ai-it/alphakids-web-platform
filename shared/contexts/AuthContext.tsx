'use client';

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User } from '../lib/types';
import { authService } from '@/features/auth/services/auth.service';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateProfile: (data: Partial<Pick<User, 'name' | 'avatarUrl'>>) => void;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      void Promise.resolve().then(() => setHydrated(true));
      return;
    }

    authService
      .getProfile()
      .then((profile) => {
        setUser(profile);
        setHydrated(true);
      })
      .catch(() => {
        authService.removeToken();
        setUser(null);
        setHydrated(true);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const response = await authService.login(email, password);
      authService.setToken(response.access_token);
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
      throw err;
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      setError(null);
      try {
        const response = await authService.register(email, password, name);
        authService.setToken(response.access_token);
        const profile = await authService.getProfile();
        setUser(profile);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al registrarse';
        setError(message);
        throw err;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const updateProfile = useCallback(
    (data: Partial<Pick<User, 'name' | 'avatarUrl'>>) => {
      setUser((prev) => (prev ? { ...prev, ...data } : prev));
    },
    [],
  );

  const isLoading = !hydrated;

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      error,
      login,
      register,
      logout,
      clearError,
      updateProfile,
    }),
    [user, isLoading, error, login, register, logout, clearError, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
