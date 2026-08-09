import { api } from '@/shared/lib/api-client';
import type { Institution } from '@/shared/lib/types';

export interface CreateInstitutionInput {
  name: string;
  slug: string;
  ruc: string;
  address: string;
  phone?: string;
  logoUrl?: string;
  isActive?: boolean;
}

export interface UpdateInstitutionInput {
  name?: string;
  slug?: string;
  ruc?: string;
  address?: string;
  phone?: string;
  logoUrl?: string | null;
  isActive?: boolean;
}

export const institutionsService = {
  async getAll(params?: { skip?: number; take?: number }): Promise<Institution[]> {
    return api.get<Institution[]>('/institutions', { skip: params?.skip, take: params?.take ?? 20 });
  },

  async getById(id: string): Promise<Institution> {
    return api.get<Institution>(`/institutions/${id}`);
  },

  async getBySlug(slug: string): Promise<Institution> {
    return api.get<Institution>(`/institutions/slug/${slug}`);
  },

  async getMine(): Promise<Institution[]> {
    return api.get<Institution[]>('/institutions/mine');
  },

  async create(input: CreateInstitutionInput): Promise<Institution> {
    return api.post<Institution>('/institutions', input);
  },

  async createWithLogo(formData: FormData): Promise<Institution> {
    return api.upload<Institution>('/institutions', formData);
  },

  async updateWithLogo(id: string, formData: FormData): Promise<Institution> {
    return api.upload<Institution>(`/institutions/${id}`, formData, 'PATCH');
  },

  async update(id: string, input: UpdateInstitutionInput): Promise<Institution> {
    return api.patch<Institution>(`/institutions/${id}`, input);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/institutions/${id}`);
  },
};
