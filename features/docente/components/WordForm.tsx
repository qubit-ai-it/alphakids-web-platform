'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useToast } from '@/shared/contexts/ToastContext';
import type { Word } from '@/shared/lib/types';

const difficultyOptions = [
  { value: 'INICIAL', label: 'Inicial' },
  { value: 'BASICO', label: 'Básico' },
  { value: 'INTERMEDIO', label: 'Intermedio' },
  { value: 'AVANZADO', label: 'Avanzado' },
  { value: 'EXPERTO', label: 'Experto' },
];

const wordSchema = z.object({
  text: z.string().min(1, 'Falta la palabra').max(15, 'Máximo 15 caracteres'),
  difficultyLabel: z.enum(['INICIAL', 'BASICO', 'INTERMEDIO', 'AVANZADO', 'EXPERTO'], {
    message: 'Selecciona una dificultad',
  }),
  isActive: z.boolean().optional(),
});

export type WordFormData = z.infer<typeof wordSchema>;

interface WordFormProps {
  onSubmit: (data: WordFormData, imageFile?: File, audioFile?: File) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  word?: Word | null;
}

export function WordForm({ onSubmit, onCancel, isLoading, word }: WordFormProps) {
  const isEdit = !!word;
  const { addToast } = useToast();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const existingImageUrl = word?.imageUrl ?? null;
  const existingAudioUrl = word?.audioUrl ?? null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WordFormData>({
    resolver: zodResolver(wordSchema),
    mode: 'onTouched',
    defaultValues: {
      text: word?.text ?? '',
      difficultyLabel: (word?.difficultyLabel as WordFormData['difficultyLabel']) ?? 'BASICO',
      isActive: word?.isActive ?? true,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioFile(e.target.files?.[0] ?? null);
  };

  const onInvalid = () => {
    addToast('error', 'El formulario se llenó incorrectamente');
    for (const [, error] of Object.entries(errors)) {
      if (error?.message && typeof error.message === 'string') {
        addToast('error', error.message);
      }
    }
  };

  const handleFormSubmit = (data: WordFormData) => {
    const hasImage = isEdit ? !!existingImageUrl || !!imageFile : !!imageFile;
    const hasAudio = isEdit ? !!existingAudioUrl || !!audioFile : !!audioFile;

    if (!hasImage) {
      addToast('error', 'Falta la imagen');
      return;
    }
    if (!hasAudio) {
      addToast('error', 'Falta el audio');
      return;
    }

    onSubmit(data, imageFile ?? undefined, audioFile ?? undefined);
  };

  const imageSrc = imagePreview ?? existingImageUrl;

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

        <form onSubmit={handleSubmit(handleFormSubmit, onInvalid)}>
          <div className="modal-body flex flex-col gap-[16px]">
            <Input
              label="Palabra"
              placeholder="Ej: sol, luna, pez"
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

            <div className="w-full flex flex-col">
              <label className="label-auth">
                Imagen <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-[12px]">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt="Vista previa"
                    className="w-[64px] h-[64px] rounded-[12px] object-cover border border-secondary-200"
                  />
                ) : (
                  <div className="w-[64px] h-[64px] rounded-[12px] bg-secondary-100 border border-secondary-200 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[28px] text-secondary-400">image</span>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isLoading}
                    onChange={handleImageChange}
                    className="text-[14px] text-secondary-700 file:mr-[12px] file:py-[8px] file:px-[16px] file:rounded-[8px] file:border-0 file:text-[13px] file:font-medium file:bg-primary-100 file:text-primary-700 file:cursor-pointer hover:file:bg-primary-200"
                  />
                  <p className="text-[11px] text-secondary-500 mt-[6px]">PNG, JPG o WEBP. Se redimensionará a 400x400px.</p>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col">
              <label className="label-auth">
                Audio <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-[12px]">
                <div className="w-[64px] h-[64px] rounded-[12px] bg-secondary-100 border border-secondary-200 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[28px] text-secondary-400">mic</span>
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="audio/*"
                    disabled={isLoading}
                    onChange={handleAudioChange}
                    className="text-[14px] text-secondary-700 file:mr-[12px] file:py-[8px] file:px-[16px] file:rounded-[8px] file:border-0 file:text-[13px] file:font-medium file:bg-primary-100 file:text-primary-700 file:cursor-pointer hover:file:bg-primary-200"
                  />
                  {audioFile && (
                    <p className="text-[12px] text-primary-600 mt-[6px]">{audioFile.name}</p>
                  )}
                  {existingAudioUrl && !audioFile && (
                    <p className="text-[12px] text-primary-600 mt-[6px]">Audio existente</p>
                  )}
                  <p className="text-[11px] text-secondary-500 mt-[6px]">MP3, WAV o OGG.</p>
                </div>
              </div>
            </div>

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
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
