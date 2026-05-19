import { api } from '@/shared/lib/api-client';
import type { Word } from '@/shared/lib/types';

export interface CreateWordInput {
  text: string;
  difficultyLabel: string;
  imageUrl?: string;
  audioUrl?: string;
  isActive?: boolean;
}

export interface UpdateWordInput {
  text?: string;
  difficultyLabel?: string;
  imageUrl?: string;
  audioUrl?: string;
  isActive?: boolean;
}

export const wordsService = {
  async getAll(): Promise<Word[]> {
    return api.get<Word[]>('/words');
  },

  async getById(id: string): Promise<Word> {
    return api.get<Word>(`/words/${id}`);
  },

  async create(input: CreateWordInput): Promise<Word> {
    return api.post<Word>('/words', input);
  },

  async update(id: string, input: UpdateWordInput): Promise<Word> {
    return api.patch<Word>(`/words/${id}`, input);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/words/${id}`);
  },
};
