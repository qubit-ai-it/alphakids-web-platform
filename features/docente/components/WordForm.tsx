'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import type { Word } from '@/shared/lib/types';

const difficultyOptions = [
  { value: 'INICIAL', label: 'Inicial' },
  { value: 'BASICO', label: 'Básico' },
  { value: 'INTERMEDIO', label: 'Intermedio' },
  { value: 'AVANZADO', label: 'Avanzado' },
  { value: 'EXPERTO', label: 'Experto' },
];

const wordSchema = z.object({
  text: z.string().min(1, 'El texto es requerido').max(100, 'Máximo 100 caracteres'),
  difficultyLabel: z.enum(['INICIAL', 'BASICO', 'INTERMEDIO', 'AVANZADO', 'EXPERTO'], {
    message: 'Selecciona una dificultad',
  }),
  imageUrl: z.string().optional().or(z.literal('')),
  audioUrl: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

type WordFormData = z.infer<typeof wordSchema>;

interface WordFormProps {
  onSubmit: (data: WordFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  word?: Word | null;
}

export function WordForm({ onSubmit, onCancel, isLoading, word }: WordFormProps) {
  const isEdit = !!word;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WordFormData>({
    resolver: zodResolver(wordSchema),
    defaultValues: {
      text: word?.text ?? '',
      difficultyLabel: (word?.difficultyLabel as WordFormData['difficultyLabel']) ?? 'BASICO',
      imageUrl: word?.imageUrl ?? '',
      audioUrl: word?.audioUrl ?? '',
      isActive: word?.isActive ?? true,
    },
  });

  return (
    <Modal>
      <div className="modal-content max-w-[520px] w-full">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? 'Editar Palabra' : 'Crear Palabra'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-secondary-600 hover:text-secondary-900 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body flex flex-col gap-[16px]">
            <Input
              label="Palabra"
              placeholder="Ej: manzana, perro, casa"
              disabled={isLoading}
              error={errors.text?.message}
              {...register('text')}
            />

            <div className="w-full flex flex-col">
              <label className="label">Dificultad</label>
              <select
                disabled={isLoading}
                className={`input ${errors.difficultyLabel ? 'input-error' : ''}`}
                {...register('difficultyLabel')}
              >
                {difficultyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.difficultyLabel && (
                <span className="error-message">{errors.difficultyLabel.message}</span>
              )}
            </div>

            <Input
              label="URL de imagen"
              placeholder="https://ejemplo.com/imagen.png"
              disabled={isLoading}
              error={errors.imageUrl?.message}
              {...register('imageUrl')}
            />

            <Input
              label="URL de audio"
              placeholder="https://ejemplo.com/audio.mp3"
              disabled={isLoading}
              error={errors.audioUrl?.message}
              {...register('audioUrl')}
            />

            <div className="flex items-center gap-[8px]">
              <input
                type="checkbox"
                id="isActiveEdit"
                disabled={isLoading}
                {...register('isActive')}
                className="w-[16px] h-[16px] rounded border-secondary-300"
              />
              <label htmlFor="isActiveEdit" className="text-[14px] text-secondary-700 cursor-pointer">
                Palabra activa
              </label>
            </div>
          </div>

          <div className="modal-footer flex justify-end gap-[12px]">
            <Button variant="secondary" size="sm" type="button" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" size="md" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
