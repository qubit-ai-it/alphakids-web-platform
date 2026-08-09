'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useToast } from '@/shared/contexts/ToastContext';
import { institutionsService } from '@/features/admin/services/institutions.service';
import { ROLE_LABELS } from '@/shared/lib/roles';
import type { User, Institution, InstitutionMember } from '@/shared/lib/types';

const availableRoles = ['admin', 'director', 'teacher'] as const;
const needsInstitution = (roles: string[]) =>
  roles.includes('director') || roles.includes('teacher');
const requiresInstitution = (roles: string[]) =>
  roles.includes('director') || roles.includes('teacher');

const userCreateSchema = z.object({
  email: z
    .string()
    .min(1, 'Falta el correo')
    .email('Correo inválido')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Correo inválido')
    .max(50, 'Máximo 50 caracteres'),
  name: z
    .string()
    .max(150, 'Máximo 150 caracteres')
    .regex(/^[a-zA-ZáéíóúüñÑ0-9\s\.\-]*$/, 'Solo letras, números y espacios')
    .optional()
    .or(z.literal('')),
  roles: z.array(z.string()).optional(),
});

const userEditSchema = z.object({
  name: z
    .string()
    .max(150, 'Máximo 150 caracteres')
    .regex(/^[a-zA-ZáéíóúüñÑ0-9\s\.\-]*$/, 'Solo letras, números y espacios')
    .optional()
    .or(z.literal('')),
  roles: z.array(z.string()).optional(),
});

type UserCreateData = z.infer<typeof userCreateSchema>;
type UserEditData = z.infer<typeof userEditSchema>;

interface CreateOutput {
  email: string;
  name?: string;
  roles: string[];
  institutionId?: string;
}

interface EditOutput {
  name?: string;
  roles: string[];
  institutionId?: string;
}

interface UserFormProps {
  onSubmitCreate?: (data: CreateOutput) => Promise<void>;
  onSubmitEdit?: (data: EditOutput) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  user?: User | null;
  currentInstitution?: { id: string; name: string } | null;
  currentMember?: InstitutionMember | null;
}

export function UserForm({
  onSubmitCreate,
  onSubmitEdit,
  onCancel,
  isLoading,
  user,
  currentInstitution,
  currentMember,
}: UserFormProps) {
  if (user) {
    return (
      <EditUserForm
        user={user}
        onSubmit={onSubmitEdit!}
        onCancel={onCancel}
        isLoading={isLoading}
        currentInstitution={currentInstitution}
        currentMember={currentMember}
      />
    );
  }

  return (
    <CreateUserForm
      onSubmit={onSubmitCreate!}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
}

function CreateUserForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: CreateOutput) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
  const { addToast } = useToast();
  const initialized = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserCreateData>({
    resolver: zodResolver(userCreateSchema),
    mode: 'onChange',
    defaultValues: { email: '', name: '', roles: [] },
  });

  const selectedRoles = (watch('roles') ?? []) as string[];
  const showStep2 = needsInstitution(selectedRoles);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    institutionsService.getAll({ take: 9999 }).then(setInstitutions).catch(() => {});
  }, []);

  const onInvalid = () => {
    addToast('error', 'El formulario se llenó incorrectamente');
    for (const [, error] of Object.entries(errors)) {
      if (error?.message && typeof error.message === 'string') {
        addToast('error', error.message);
      }
    }
  };

  const goNext = () => {
    if (showStep2) {
      setStep(2);
    }
  };

  const goBack = () => setStep(1);

  const onFinalSubmit = (data: UserCreateData) => {
    onSubmit({
      ...data,
      name: data.name || undefined,
      roles: data.roles ?? [],
      institutionId: showStep2 ? selectedInstitutionId : undefined,
    });
  };

  if (step === 2 && showStep2) {
    return (
      <Modal>
        <div className="modal-content max-w-[520px] w-full">
          <div className="modal-header">
            <h2 className="modal-title">Asignar Institución</h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-secondary-600 hover:text-secondary-900 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          <div className="modal-body flex flex-col gap-[16px]">
            <p className="text-[14px] text-secondary-600">
              Selecciona la institución a la que pertenecerá este usuario.
            </p>

            <div className="w-full flex flex-col">
              <label className="label">Institución</label>
              <select
                value={selectedInstitutionId}
                onChange={(e) => setSelectedInstitutionId(e.target.value)}
                className="input"
              >
                <option value="">Seleccionar institución...</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer flex justify-between">
            <Button variant="secondary" size="sm" type="button" onClick={goBack} disabled={isLoading}>
              Atrás
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isLoading || (requiresInstitution(watch('roles') ?? []) && !selectedInstitutionId)}
              onClick={handleSubmit(onFinalSubmit, onInvalid)}
            >
              {isLoading ? 'Guardando...' : 'Crear Usuario'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

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

        <form noValidate onSubmit={handleSubmit(showStep2 ? goNext : onFinalSubmit, onInvalid)}>
          <div className="modal-body flex flex-col gap-[16px]">
            <Input
              label="Correo"
              type="email"
              placeholder="correo@ejemplo.com"
              disabled={isLoading}
              error={errors.email?.message}
              maxLength={255}
              {...register('email')}
            />
            <Input
              label="Nombre"
              placeholder="Nombre del usuario"
              disabled={isLoading}
              error={errors.name?.message}
              maxLength={150}
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
                    {ROLE_LABELS[role] ?? role}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer flex justify-end gap-[12px]">
            <Button variant="secondary" size="sm" type="button" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {showStep2 ? 'Siguiente' : 'Crear Usuario'}
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
  currentInstitution,
  currentMember,
}: {
  user: User | null;
  onSubmit: (data: EditOutput) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  currentInstitution?: { id: string; name: string } | null;
  currentMember?: InstitutionMember | null;
}) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(
    currentInstitution?.id ?? '',
  );
  const { addToast } = useToast();
  const initialized = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserEditData>({
    resolver: zodResolver(userEditSchema),
    mode: 'onChange',
    defaultValues: {
      name: user?.name ?? '',
      roles: user?.roles.map((r) => r.role.name) ?? [],
    },
  });

  const selectedRoles = (watch('roles') ?? []) as string[];
  const showInstitution = needsInstitution(selectedRoles);

  const isDirectorOrTeacher = user?.roles.some((r) =>
    ['director', 'teacher'].includes(r.role.name),
  );
  const isParentUser = user?.roles.some((r) => r.role.name === 'parent');

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    institutionsService.getAll({ take: 9999 }).then(setInstitutions).catch(() => {});
  }, []);

  const onInvalid = () => {
    addToast('error', 'El formulario se llenó incorrectamente');
    for (const [, error] of Object.entries(errors)) {
      if (error?.message && typeof error.message === 'string') {
        addToast('error', error.message);
      }
    }
  };

  const onFinalSubmit = (data: UserEditData) => {
    onSubmit({
      name: data.name || undefined,
      roles: data.roles ?? [],
      institutionId: showInstitution ? selectedInstitutionId || undefined : undefined,
    });
  };

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

        <form noValidate onSubmit={handleSubmit(onFinalSubmit, onInvalid)}>
          <div className="modal-body flex flex-col gap-[16px]">
            <Input
              label="Nombre"
              placeholder="Nombre del usuario"
              disabled={isLoading}
              error={errors.name?.message}
              maxLength={150}
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
                    {ROLE_LABELS[role] ?? role}
                  </label>
                ))}
              </div>
            </div>

            {(isDirectorOrTeacher || isParentUser || showInstitution) && (
              <div className="w-full flex flex-col">
                <label className="label">Institución</label>
                {currentInstitution && (
                  <p className="text-[12px] text-secondary-500 mb-[4px]">
                    Actual: {currentInstitution.name}
                  </p>
                )}
                <select
                  value={selectedInstitutionId}
                  onChange={(e) => setSelectedInstitutionId(e.target.value)}
                  disabled={isLoading}
                  className="input"
                >
                  <option value="">Sin institución</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer flex justify-end gap-[12px]">
            <Button variant="secondary" size="sm" type="button" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Actualizar'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
