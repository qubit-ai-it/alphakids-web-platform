import { api } from '@/shared/lib/api-client';

// ── DTOs (match backend) ─────────────────────────────────────

export interface TeacherSectionDto {
  id: string;
  name: string;
  studentCount: number;
  pendingAssignments: number;
}

export interface TeacherGradeDto {
  id: string;
  name: string;
  ageRangeMin: number;
  ageRangeMax: number;
  sections: TeacherSectionDto[];
}

export interface TeacherAulaResponse {
  grades: TeacherGradeDto[];
  summary: {
    totalGrades: number;
    totalSections: number;
    totalStudents: number;
    totalPendingAssignments: number;
  };
}

// ── Service ──────────────────────────────────────────────────

export const aulaService = {
  async getAula(): Promise<TeacherAulaResponse> {
    return api.get<TeacherAulaResponse>('/teacher/aula');
  },
};
