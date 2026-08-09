'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useToast } from '@/shared/contexts/ToastContext';
import { gradesService } from '@/features/director/services/grades.service';
import { sectionsService } from '@/features/director/services/sections.service';
import { getInstitutionId } from '@/shared/lib/jwt';
import type { Grade, Section } from '@/shared/lib/types';

const teacherSchema = z.object({
  email: z
    .string()
    .min(1, 'Falta el correo')
    .email('Correo inválido')
    .max(255, 'Máximo 255 caracteres'),
  name: z.string()
    .refine((val) => val.trim().length > 0 || val.length === 0, 'Falta el nombre')
    .transform((val) => val.trim())
    .pipe(z.string().regex(/^[a-zA-ZáéíóúüñÑ0-9\s\.\-]+$/, 'Solo letras, números y espacios').max(150, 'Máximo 150 caracteres'))
    .optional()
    .or(z.literal('')),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

export interface TeacherCreateOutput {
  email: string;
  name?: string;
  institutionId: string;
  sectionId: string;
  gradeId: string;
}

interface TeacherFormProps {
  onSubmit: (data: TeacherCreateOutput) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function TeacherForm({ onSubmit, onCancel, isLoading }: TeacherFormProps) {
  const institutionId = getInstitutionId() ?? '';
  const [step, setStep] = useState<1 | 2>(1);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const { addToast } = useToast();
  const initialized = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    mode: 'onChange',
    defaultValues: { email: '', name: '' },
  });

  useEffect(() => {
    if (initialized.current || !institutionId) return;
    initialized.current = true;
    gradesService.getAll(institutionId, { take: 9999 }).then(setGrades).catch(() => {});
  }, [institutionId]);

  useEffect(() => {
    if (!institutionId || !selectedGradeId) return;
    sectionsService.getAll(institutionId, selectedGradeId, { take: 9999 }).then(setSections).catch(() => {});
  }, [institutionId, selectedGradeId]);

  const [selectedSectionId, setSelectedSectionId] = useState('');

  const onInvalid = () => {
    addToast('error', 'El formulario se llenó incorrectamente');
    for (const [, error] of Object.entries(errors)) {
      if (error?.message && typeof error.message === 'string') {
        addToast('error', error.message);
      }
    }
  };

  const goNext = () => setStep(2);
  const goBack = () => setStep(1);

  const onFinalSubmit = () => {
    const data = getValues();
    onSubmit({
      email: data.email,
      name: data.name || undefined,
      institutionId,
      gradeId: selectedGradeId,
      sectionId: selectedSectionId,
    });
  };

  if (step === 2) {
    return (
      <Modal>
        <div className="modal-content max-w-[480px] w-full">
          <div className="modal-header">
            <h2 className="modal-title">Paso 2: Grado y Sección</h2>
            <button type="button" onClick={onCancel} className="text-secondary-600 hover:text-secondary-900 cursor-pointer">
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>
          <div className="modal-body flex flex-col gap-[16px]">
            <div className="w-full flex flex-col">
              <label className="label">Grado</label>
              <select value={selectedGradeId} onChange={(e) => { setSelectedGradeId(e.target.value); setSelectedSectionId(''); }} className="input">
                <option value="">Seleccionar grado...</option>
                {grades.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.ageRangeMin}-{g.ageRangeMax} años)</option>)}
              </select>
            </div>
            {selectedGradeId && (
              <div className="w-full flex flex-col">
                <label className="label">Sección</label>
                <select value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)} className="input">
                  <option value="">Seleccionar sección...</option>
                  {sections.map((s) => <option key={s.id} value={s.id}>{s.name} (capacidad: {s.capacity})</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="modal-footer flex justify-between">
            <Button variant="secondary" size="sm" type="button" onClick={goBack} disabled={isLoading}>Atrás</Button>
            <Button type="button" size="sm" disabled={isLoading || !selectedSectionId} onClick={handleSubmit(onFinalSubmit, onInvalid)}>
              {isLoading ? 'Guardando...' : 'Crear Docente'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal>
      <div className="modal-content max-w-[480px] w-full">
        <div className="modal-header">
          <h2 className="modal-title">Paso 1: Datos del Docente</h2>
          <button type="button" onClick={onCancel} className="text-secondary-600 hover:text-secondary-900 cursor-pointer">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
        <form noValidate onSubmit={handleSubmit(goNext, onInvalid)}>
          <div className="modal-body flex flex-col gap-[16px]">
            <Input label="Correo" type="email" placeholder="docente@ejemplo.com" disabled={isLoading} error={errors.email?.message} maxLength={255} {...register('email')} />
            <Input label="Nombre" placeholder="Nombre del docente" disabled={isLoading} error={errors.name?.message} maxLength={150} {...register('name')} />
          </div>
          <div className="modal-footer flex justify-end gap-[12px]">
            <Button variant="secondary" size="sm" type="button" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={isLoading}>Siguiente</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
