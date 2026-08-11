import { api } from '@/shared/lib/api-client';
import type { Student } from '@/shared/lib/types';

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  birthDate?: string;
  gender?: string;
  avatarUrl?: string;
  institutionId?: string;
  sectionId?: string;
}

export interface UpdateStudentInput {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  avatarUrl?: string;
  institutionId?: string;
  sectionId?: string;
  isActive?: boolean;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface VerifyStudentInput {
  status: 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
}

export const studentsService = {
  async getAll(params?: { skip?: number; take?: number }): Promise<Student[]> {
    return api.get<Student[]>('/students', { skip: params?.skip, take: params?.take ?? 20 });
  },

  /** Teacher-scoped: only students from the teacher's sections */
  async getTeacherStudents(params?: { skip?: number; take?: number }): Promise<Student[]> {
    return api.get<Student[]>('/teacher/students', { skip: params?.skip, take: params?.take ?? 20 });
  },

  /** Director-scoped: students from the director's institutions */
  async getDirectorStudents(params?: { skip?: number; take?: number }): Promise<Student[]> {
    return api.get<Student[]>('/director/students', { skip: params?.skip, take: params?.take ?? 20 });
  },

  async getById(id: string): Promise<Student> {
    return api.get<Student>(`/students/${id}`);
  },

  async create(input: CreateStudentInput): Promise<Student> {
    return api.post<Student>('/students', input);
  },

  async update(id: string, input: UpdateStudentInput): Promise<Student> {
    return api.patch<Student>(`/students/${id}`, input);
  },

  async verify(
    institutionId: string,
    studentId: string,
    input: VerifyStudentInput,
  ): Promise<Student> {
    return api.patch<Student>(
      `/institutions/${institutionId}/students/${studentId}/verify`,
      input,
    );
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/students/${id}`);
  },
};
