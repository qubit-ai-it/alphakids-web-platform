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

export const studentsService = {
  async getAll(): Promise<Student[]> {
    return api.get<Student[]>('/students', { take: 9999 });
  },

  /** Teacher-scoped: only students from the teacher's sections */
  async getTeacherStudents(): Promise<Student[]> {
    return api.get<Student[]>('/teacher/students');
  },

  /** Director-scoped: students from the director's institutions */
  async getDirectorStudents(): Promise<Student[]> {
    return api.get<Student[]>('/director/students');
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

  async delete(id: string): Promise<void> {
    return api.delete(`/students/${id}`);
  },
};
