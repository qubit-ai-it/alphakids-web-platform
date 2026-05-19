'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

const institutionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(150, 'Máximo 150 caracteres'),
  slug: z.string().min(1, 'El slug es requerido').max(150, 'Máximo 150 caracteres'),
  ruc: z.string().min(1, 'El RUC es requerido').max(20, 'Máximo 20 caracteres'),
  address: z.string().min(1, 'La dirección es requerida'),
  phone: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  logoUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

type InstitutionFormData = z.infer<typeof institutionSchema>;

interface InstitutionFormProps {
  onSubmit: (data: InstitutionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function InstitutionForm({ onSubmit, onCancel, isLoading }: InstitutionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      name: '',
      slug: '',
      ruc: '',
      address: '',
      phone: '',
      logoUrl: '',
      isActive: true,
    },
  });

  return (
    <Modal>
      <div className="modal-content max-w-[520px] w-full">
        <div className="modal-header">
          <h2 className="modal-title">Crear Institución</h2>
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
              placeholder="Nombre de la institución"
              disabled={isLoading}
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Slug"
              placeholder="identificador-unico"
              disabled={isLoading}
              error={errors.slug?.message}
              {...register('slug')}
            />
            <Input
              label="RUC"
              placeholder="12345678901"
              disabled={isLoading}
              error={errors.ruc?.message}
              {...register('ruc')}
            />
            <Input
              label="Dirección"
              placeholder="Dirección completa"
              disabled={isLoading}
              error={errors.address?.message}
              {...register('address')}
            />
            <Input
              label="Teléfono"
              placeholder="+51 999 888 777"
              disabled={isLoading}
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="URL del Logo"
              placeholder="https://ejemplo.com/logo.png"
              disabled={isLoading}
              error={errors.logoUrl?.message}
              {...register('logoUrl')}
            />
            <div className="flex items-center gap-[8px]">
              <input
                type="checkbox"
                id="isActive"
                disabled={isLoading}
                {...register('isActive')}
                className="w-[16px] h-[16px] rounded border-secondary-300"
              />
              <label htmlFor="isActive" className="text-[14px] text-secondary-700 cursor-pointer">
                Institución activa
              </label>
            </div>
          </div>

          <div className="modal-footer flex justify-end gap-[12px]">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="btn btn-secondary cursor-pointer"
            >
              Cancelar
            </button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Institución'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
