import { api } from '@/shared/lib/api-client';
import type { InstitutionMember } from '@/shared/lib/types';

export interface SectionTeacher extends InstitutionMember {
  assignedAt: string;
}

const buildUrl = (
  institutionId: string,
  gradeId: string,
  sectionId: string,
  suffix?: string,
) =>
  `/institutions/${institutionId}/grades/${gradeId}/sections/${sectionId}/teachers${suffix ? `/${suffix}` : ''}`;

export const sectionTeachersService = {
  async getAll(
    institutionId: string,
    gradeId: string,
    sectionId: string,
  ): Promise<SectionTeacher[]> {
    return api.get<SectionTeacher[]>(
      buildUrl(institutionId, gradeId, sectionId),
    );
  },

  async assign(
    institutionId: string,
    gradeId: string,
    sectionId: string,
    userId: string,
  ): Promise<SectionTeacher> {
    return api.post<SectionTeacher>(
      buildUrl(institutionId, gradeId, sectionId),
      { userId },
    );
  },

  async remove(
    institutionId: string,
    gradeId: string,
    sectionId: string,
    userId: string,
  ): Promise<void> {
    return api.delete(
      buildUrl(institutionId, gradeId, sectionId, userId),
    );
  },
};
