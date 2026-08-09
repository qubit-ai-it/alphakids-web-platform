import { api } from '@/shared/lib/api-client';
import type { WordAssignment } from '@/shared/lib/types';

export interface CreateWordAssignmentInput {
  wordId: string;
  studentId: string;
  scheduledAt?: string;
  expiresAt?: string;
}

export interface UpdateWordAssignmentInput {
  status?: string;
  scheduledAt?: string;
  expiresAt?: string;
}

export const wordAssignmentsService = {
  async getAll(params?: { skip?: number; take?: number }): Promise<WordAssignment[]> {
    return api.get<WordAssignment[]>('/word-assignments', { skip: params?.skip, take: params?.take ?? 20 });
  },

  /** Teacher-scoped: only assignments for students in the teacher's sections */
  async getTeacherAssignments(params?: { skip?: number; take?: number }): Promise<WordAssignment[]> {
    return api.get<WordAssignment[]>('/teacher/word-assignments', { skip: params?.skip, take: params?.take ?? 20 });
  },

  async getById(id: string): Promise<WordAssignment> {
    return api.get<WordAssignment>(`/word-assignments/${id}`);
  },

  async create(input: CreateWordAssignmentInput): Promise<WordAssignment> {
    return api.post<WordAssignment>('/word-assignments', input);
  },

  async update(id: string, input: UpdateWordAssignmentInput): Promise<WordAssignment> {
    return api.patch<WordAssignment>(`/word-assignments/${id}`, input);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/word-assignments/${id}`);
  },
};
