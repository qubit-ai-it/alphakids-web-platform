'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import type { User } from '@/shared/lib/types';

const userCreateSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  name: z.string().optional(),
  roles: z.array(z.string()).optional(),
});

const userEditSchema = z.object({
  name: z.string().optional(),
  roles: z.array(z.string()).optional(),
});

type UserCreateData = z.infer<typeof userCreateSchema>;
type UserEditData = z.infer<typeof userEditSchema>;

const availableRoles = ['admin', 'director', 'teacher', 'parent'] as const;

interface UserFormProps {
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  user?: User | null;
}

export function UserForm({ onSubmit, onCancel, isLoading, user }: UserFormProps) {
  if (user) {
    return <EditUserForm user={user} onSubmit={onSubmit} onCancel={onCancel} isLoading={isLoading} />;
  }

  return <CreateUserForm onSubmit={onSubmit} onCancel={onCancel} isLoading={isLoading} />;
}

function CreateUserForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserCreateData>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: { email: '', password: '', name: '', roles: [] },
  });

  return (
    <Modal>
      <div className="modal-content max-w-[520px] w-full">
        <div className="modal-header">
          <h2 className="modal-title">Crear Usuario</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-secondary-600 hover:text-secondary-900 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit(data as Record<string, unknown>))}>
          <div className="modal-body flex flex-col gap-[16px]">
            <Input
              label="Correo"
              type="email"
              placeholder="correo@ejemplo.com"
              disabled={isLoading}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              disabled={isLoading}
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Nombre"
              placeholder="Nombre del usuario"
              disabled={isLoading}
              error={errors.name?.message}
              {...register('name')}
            />
            <div className="w-full flex flex-col">
              <label className="label">Roles</label>
              <div className="flex flex-wrap gap-[12px] mt-[4px]">
                {availableRoles.map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-[6px] text-[14px] text-secondary-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={role}
                      disabled={isLoading}
                      {...register('roles')}
                      className="w-[16px] h-[16px] rounded border-secondary-300"
                    />
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </label>
                ))}
              </div>
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
              {isLoading ? 'Guardando...' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function EditUserForm({
  user,
  onSubmit,
  onCancel,
  isLoading,
}: {
  user: User | null;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserEditData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: user?.name ?? '',
      roles: user?.roles.map((r) => r.role.name) ?? [],
    },
  });

  return (
    <Modal>
      <div className="modal-content max-w-[520px] w-full">
        <div className="modal-header">
          <h2 className="modal-title">Editar Usuario</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-secondary-600 hover:text-secondary-900 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit(data as Record<string, unknown>))}>
          <div className="modal-body flex flex-col gap-[16px]">
            <Input
              label="Nombre"
              placeholder="Nombre del usuario"
              disabled={isLoading}
              error={errors.name?.message}
              {...register('name')}
            />
            <div className="w-full flex flex-col">
              <label className="label">Roles</label>
              <div className="flex flex-wrap gap-[12px] mt-[4px]">
                {availableRoles.map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-[6px] text-[14px] text-secondary-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={role}
                      disabled={isLoading}
                      {...register('roles')}
                      className="w-[16px] h-[16px] rounded border-secondary-300"
                    />
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </label>
                ))}
              </div>
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
              {isLoading ? 'Guardando...' : 'Actualizar'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
