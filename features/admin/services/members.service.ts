import { api } from '@/shared/lib/api-client';
import type { InstitutionMember } from '@/shared/lib/types';

export interface CreateMemberInput {
  userId: string;
  roleId: string;
}

export interface UpdateMemberInput {
  roleId?: string;
  leftAt?: string | null;
}

export const membersService = {
  async getAll(institutionId: string): Promise<InstitutionMember[]> {
    return api.get<InstitutionMember[]>(
      `/institutions/${institutionId}/members`,
      { take: 9999 },
    );
  },

  async getById(
    institutionId: string,
    id: string,
  ): Promise<InstitutionMember> {
    return api.get<InstitutionMember>(
      `/institutions/${institutionId}/members/${id}`,
    );
  },

  async create(
    institutionId: string,
    input: CreateMemberInput,
  ): Promise<InstitutionMember> {
    return api.post<InstitutionMember>(
      `/institutions/${institutionId}/members`,
      input,
    );
  },

  async update(
    institutionId: string,
    id: string,
    input: UpdateMemberInput,
  ): Promise<InstitutionMember> {
    return api.patch<InstitutionMember>(
      `/institutions/${institutionId}/members/${id}`,
      input,
    );
  },

  async delete(institutionId: string, id: string): Promise<void> {
    return api.delete(`/institutions/${institutionId}/members/${id}`);
  },
};
