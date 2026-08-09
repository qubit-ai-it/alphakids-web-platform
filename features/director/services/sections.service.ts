import { api } from '@/shared/lib/api-client';
import type { Section } from '@/shared/lib/types';

export interface CreateSectionInput {
  name: string;
  capacity: number;
}

export interface UpdateSectionInput {
  name?: string;
  capacity?: number;
}

export const sectionsService = {
  async getAll(
    institutionId: string,
    gradeId: string,
    params?: { skip?: number; take?: number },
  ): Promise<Section[]> {
    return api.get<Section[]>(
      `/institutions/${institutionId}/grades/${gradeId}/sections`,
      { skip: params?.skip, take: params?.take ?? 20 },
    );
  },

  async getById(
    institutionId: string,
    gradeId: string,
    id: string,
  ): Promise<Section> {
    return api.get<Section>(
      `/institutions/${institutionId}/grades/${gradeId}/sections/${id}`,
    );
  },

  async create(
    institutionId: string,
    gradeId: string,
    input: CreateSectionInput,
  ): Promise<Section> {
    return api.post<Section>(
      `/institutions/${institutionId}/grades/${gradeId}/sections`,
      input,
    );
  },

  async update(
    institutionId: string,
    gradeId: string,
    id: string,
    input: UpdateSectionInput,
  ): Promise<Section> {
    return api.patch<Section>(
      `/institutions/${institutionId}/grades/${gradeId}/sections/${id}`,
      input,
    );
  },

  async delete(
    institutionId: string,
    gradeId: string,
    id: string,
  ): Promise<void> {
    return api.delete(
      `/institutions/${institutionId}/grades/${gradeId}/sections/${id}`,
    );
  },
};
