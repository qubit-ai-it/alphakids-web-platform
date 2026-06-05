'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import type { Student } from '@/shared/lib/types';

const genderOptions = [
  { value: '', label: 'Sin especificar' },
  { value: 'MALE', label: 'Masculino' },
  { value: 'FEMALE', label: 'Femenino' },
  { value: 'OTHER', label: 'Otro' },
];

const studentSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  lastName: z.string().min(1, 'El apellido es requerido').max(100, 'Máximo 100 caracteres'),
  birthDate: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  avatarUrl: z.string().optional().or(z.literal('')),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  onSubmit: (data: StudentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  student?: Student | null;
}

export function StudentForm({ onSubmit, onCancel, isLoading, student }: StudentFormProps) {
  const isEdit = !!student;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: student?.firstName ?? '',
      lastName: student?.lastName ?? '',
      birthDate: student?.birthDate ?? '',
      gender: student?.gender ?? '',
      avatarUrl: student?.avatarUrl ?? '',
    },
  });

  return (
    <Modal>
      <div className="modal-content max-w-[520px] w-full">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? 'Editar Alumno' : 'Crear Alumno'}
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
            <div className="flex gap-[12px]">
              <div className="flex-1">
                <Input
                  label="Nombre"
                  placeholder="Nombre del alumno"
                  disabled={isLoading}
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Apellido"
                  placeholder="Apellido del alumno"
                  disabled={isLoading}
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>
            </div>

            <Input
              label="Fecha de nacimiento"
              type="date"
              disabled={isLoading}
              error={errors.birthDate?.message}
              {...register('birthDate')}
            />

            <div className="w-full flex flex-col">
              <label className="label">Género</label>
              <select
                disabled={isLoading}
                className="input"
                {...register('gender')}
              >
                {genderOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="URL del avatar"
              placeholder="https://ejemplo.com/avatar.png"
              disabled={isLoading}
              error={errors.avatarUrl?.message}
              {...register('avatarUrl')}
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
