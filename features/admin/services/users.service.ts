import { api } from '@/shared/lib/api-client';
import type { User } from '@/shared/lib/types';

export interface CreateUserInput {
  email: string;
  password?: string;
  name?: string;
  roles?: string[];
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  name?: string;
  roles?: string[];
}

export const usersService = {
  async getAll(): Promise<User[]> {
    return api.get<User[]>('/users', { take: 9999 });
  },

  async getById(id: string): Promise<User> {
    return api.get<User>(`/users/${id}`);
  },

  async create(input: CreateUserInput): Promise<User & { setupLink?: string }> {
    return api.post<User & { setupLink?: string }>('/users', input);
  },

  async update(id: string, input: UpdateUserInput): Promise<User> {
    return api.patch<User>(`/users/${id}`, input);
  },

  async delete(id: string): Promise<{ id: string; email: string; name: string }> {
    return api.delete(`/users/${id}`);
  },
};
