'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import type { Grade } from '@/shared/lib/types';

const gradeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'Máximo 50 caracteres'),
  ageRangeMin: z.number().int().min(0, 'Mínimo 0').max(99, 'Máximo 99'),
  ageRangeMax: z.number().int().min(0, 'Mínimo 0').max(99, 'Máximo 99'),
});

type GradeFormData = z.infer<typeof gradeSchema>;

interface GradeFormProps {
  onSubmit: (data: GradeFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  grade?: Grade | null;
}

export function GradeForm({ onSubmit, onCancel, isLoading, grade }: GradeFormProps) {
  const isEdit = !!grade;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      name: grade?.name ?? '',
      ageRangeMin: grade?.ageRangeMin ?? 3,
      ageRangeMax: grade?.ageRangeMax ?? 5,
    },
  });

  return (
    <Modal>
      <div className="modal-content max-w-[480px] w-full">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? 'Editar Grado' : 'Crear Grado'}
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
              label="Nombre"
              placeholder="Ej: Sala de 3, Pre-kínder, 1° Grado"
              disabled={isLoading}
              error={errors.name?.message}
              {...register('name')}
            />

            <div className="flex gap-[12px]">
              <div className="flex-1">
                <Input
                  label="Edad mínima"
                  type="number"
                  placeholder="3"
                  disabled={isLoading}
                  error={errors.ageRangeMin?.message}
                  {...register('ageRangeMin', { valueAsNumber: true })}
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Edad máxima"
                  type="number"
                  placeholder="5"
                  disabled={isLoading}
                  error={errors.ageRangeMax?.message}
                  {...register('ageRangeMax', { valueAsNumber: true })}
                />
              </div>
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
