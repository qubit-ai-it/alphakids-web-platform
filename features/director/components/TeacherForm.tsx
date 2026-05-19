'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { gradesService } from '@/features/director/services/grades.service';
import { sectionsService } from '@/features/director/services/sections.service';
import { getInstitutionId } from '@/shared/lib/jwt';
import type { Grade, Section } from '@/shared/lib/types';

const teacherSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  name: z.string().optional(),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

export interface TeacherCreateOutput {
  email: string;
  password: string;
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
  const initialized = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { email: '', password: '', name: '' },
  });

  useEffect(() => {
    if (initialized.current || !institutionId) return;
    initialized.current = true;
    gradesService.getAll(institutionId).then(setGrades).catch(() => {});
  }, [institutionId]);

  useEffect(() => {
    if (!institutionId || !selectedGradeId) return;
    sectionsService.getAll(institutionId, selectedGradeId).then(setSections).catch(() => {});
  }, [institutionId, selectedGradeId]);

  const [selectedSectionId, setSelectedSectionId] = useState('');

  const goNext = () => setStep(2);
  const goBack = () => setStep(1);

  const onFinalSubmit = () => {
    const data = getValues();
    onSubmit({
      email: data.email,
      password: data.password,
      name: data.name,
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
            <Button type="button" size="sm" disabled={isLoading || !selectedSectionId} onClick={onFinalSubmit}>
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
        <form onSubmit={handleSubmit(goNext)}>
          <div className="modal-body flex flex-col gap-[16px]">
            <Input label="Correo" type="email" placeholder="docente@ejemplo.com" disabled={isLoading} error={errors.email?.message} {...register('email')} />
            <Input label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" disabled={isLoading} error={errors.password?.message} {...register('password')} />
            <Input label="Nombre" placeholder="Nombre del docente" disabled={isLoading} error={errors.name?.message} {...register('name')} />
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
