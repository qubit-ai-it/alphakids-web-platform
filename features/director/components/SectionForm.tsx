'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useToast } from '@/shared/contexts/ToastContext';
import type { Section } from '@/shared/lib/types';

const sectionSchema = z.object({
  name: z.string().trim().min(1, 'Falta el nombre').max(10, 'Máximo 10 caracteres').regex(/^[a-zA-ZáéíóúüñÑ0-9\s\.\-]+$/, 'Solo letras, números y espacios'),
  capacity: z
    .number({ message: 'Debe ser un número válido' })
    .int({ message: 'Debe ser un número entero' })
    .min(1, 'Mínimo 1')
    .max(999, 'Máximo 999'),
});

type SectionFormData = z.infer<typeof sectionSchema>;

interface SectionFormProps {
  onSubmit: (data: SectionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  section?: Section | null;
}

export function SectionForm({ onSubmit, onCancel, isLoading, section }: SectionFormProps) {
  const isEdit = !!section;
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    mode: 'onChange',
    defaultValues: {
      name: section?.name ?? '',
      capacity: section?.capacity ?? 30,
    },
  });

  const onInvalid = () => {
    addToast('error', 'El formulario se llenó incorrectamente');
    for (const [, error] of Object.entries(errors)) {
      if (error?.message && typeof error.message === 'string') {
        addToast('error', error.message);
      }
    }
  };

  return (
    <Modal>
      <div className="modal-content max-w-[480px] w-full">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? 'Editar Sección' : 'Crear Sección'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-secondary-600 hover:text-secondary-900 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
          <div className="modal-body flex flex-col gap-[16px]">
            <Input
              label="Nombre"
              placeholder="Ej: A, B, Matutina"
              disabled={isLoading}
              error={errors.name?.message}
              maxLength={10}
              {...register('name')}
            />
            <Input
              label="Capacidad"
              type="number"
              placeholder="30"
              disabled={isLoading}
              error={errors.capacity?.message}
              {...register('capacity', { valueAsNumber: true })}
            />
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
