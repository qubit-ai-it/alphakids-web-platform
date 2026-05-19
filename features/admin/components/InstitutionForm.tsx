'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import type { Institution } from '@/shared/lib/types';

const institutionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(150, 'Máximo 150 caracteres'),
  slug: z.string().min(1, 'El slug es requerido').max(150, 'Máximo 150 caracteres'),
  ruc: z.string().min(1, 'El RUC es requerido').max(20, 'Máximo 20 caracteres'),
  address: z.string().min(1, 'La dirección es requerida'),
  phone: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export type InstitutionFormData = z.infer<typeof institutionSchema>;

interface InstitutionFormProps {
  onSubmit: (data: InstitutionFormData, logoFile?: File) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  initialData?: Institution;
}

export function InstitutionForm({ onSubmit, onCancel, isLoading, initialData }: InstitutionFormProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const existingLogoUrl = initialData?.logoUrl ?? null;
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      slug: initialData?.slug ?? '',
      ruc: initialData?.ruc ?? '',
      address: initialData?.address ?? '',
      phone: initialData?.phone ?? '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (data: InstitutionFormData) => {
    onSubmit(data, logoFile ?? undefined);
  };

  const logoSrc = logoPreview ?? existingLogoUrl;

  return (
    <Modal>
      <div className="modal-content max-w-[520px] w-full">
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Editar Institución' : 'Crear Institución'}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-secondary-600 hover:text-secondary-900 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
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

            <div className="w-full flex flex-col">
              <label className="label-auth">Logo</label>
              <div className="flex items-center gap-[12px]">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt="Logo preview"
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
                    onChange={handleFileChange}
                    className="text-[14px] text-secondary-700 file:mr-[12px] file:py-[8px] file:px-[16px] file:rounded-[8px] file:border-0 file:text-[13px] file:font-medium file:bg-primary-100 file:text-primary-700 file:cursor-pointer hover:file:bg-primary-200"
                  />
                  <p className="text-[11px] text-secondary-500 mt-[6px]">PNG, JPG o WEBP. Se redimensionará a 400x400px.</p>
                </div>
              </div>
            </div>

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
            <Button variant="secondary" size="sm" type="button" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Institución'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
