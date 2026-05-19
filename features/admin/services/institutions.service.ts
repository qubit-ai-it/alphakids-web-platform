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

export const institutionsService = {
  async getAll(): Promise<Institution[]> {
    return api.get<Institution[]>('/institutions');
  },

  async getBySlug(slug: string): Promise<Institution> {
    return api.get<Institution>(`/institutions/slug/${slug}`);
  },

  async create(input: CreateInstitutionInput): Promise<Institution> {
    return api.post<Institution>('/institutions', input);
  },
};
