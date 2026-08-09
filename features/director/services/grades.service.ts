import { api } from '@/shared/lib/api-client';
import type { Grade } from '@/shared/lib/types';

export interface CreateGradeInput {
  name: string;
  ageRangeMin: number;
  ageRangeMax: number;
}

export interface UpdateGradeInput {
  name?: string;
  ageRangeMin?: number;
  ageRangeMax?: number;
}

export const gradesService = {
  async getAll(
    institutionId: string,
    params?: { skip?: number; take?: number },
  ): Promise<Grade[]> {
    return api.get<Grade[]>(`/institutions/${institutionId}/grades`, {
      skip: params?.skip,
      take: params?.take ?? 20,
    });
  },

  async getById(institutionId: string, id: string): Promise<Grade> {
    return api.get<Grade>(`/institutions/${institutionId}/grades/${id}`);
  },

  async create(institutionId: string, input: CreateGradeInput): Promise<Grade> {
    return api.post<Grade>(`/institutions/${institutionId}/grades`, input);
  },

  async update(
    institutionId: string,
    id: string,
    input: UpdateGradeInput,
  ): Promise<Grade> {
    return api.patch<Grade>(
      `/institutions/${institutionId}/grades/${id}`,
      input,
    );
  },

  async delete(institutionId: string, id: string): Promise<void> {
    return api.delete(`/institutions/${institutionId}/grades/${id}`);
  },
};
