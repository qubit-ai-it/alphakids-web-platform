'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { wordsService } from '@/features/docente/services/words.service';
import { studentsService } from '@/features/docente/services/students.service';
import type { WordAssignment, Word, Student } from '@/shared/lib/types';

const assignmentSchema = z.object({
  wordId: z.string().min(1, 'Selecciona una palabra'),
  studentId: z.string().min(1, 'Selecciona un alumno'),
  scheduledAt: z.string().optional().or(z.literal('')),
  expiresAt: z.string().optional().or(z.literal('')),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface WordAssignmentFormProps {
  onSubmit: (data: AssignmentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  assignment?: WordAssignment | null;
}

export function WordAssignmentForm({ onSubmit, onCancel, isLoading, assignment }: WordAssignmentFormProps) {
  const isEdit = !!assignment;
  const [words, setWords] = useState<Word[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    wordsService.getAll().then(setWords).catch(() => {});
    studentsService.getAll().then(setStudents).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      wordId: assignment?.wordId ?? '',
      studentId: assignment?.studentId ?? '',
      scheduledAt: assignment?.scheduledAt ?? '',
      expiresAt: assignment?.expiresAt ?? '',
    },
  });

  return (
    <Modal>
      <div className="modal-content max-w-[520px] w-full">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? 'Editar Asignación' : 'Nueva Asignación'}
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
            {!isEdit && (
              <>
                <div className="w-full flex flex-col">
                  <label className="label">Palabra</label>
                  <select
                    disabled={isLoading}
                    className={`input ${errors.wordId ? 'input-error' : ''}`}
                    {...register('wordId')}
                  >
                    <option value="">Seleccionar palabra...</option>
                    {words.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.text} ({w.difficultyLabel})
                      </option>
                    ))}
                  </select>
                  {errors.wordId && (
                    <span className="error-message">{errors.wordId.message}</span>
                  )}
                </div>

                <div className="w-full flex flex-col">
                  <label className="label">Alumno</label>
                  <select
                    disabled={isLoading}
                    className={`input ${errors.studentId ? 'input-error' : ''}`}
                    {...register('studentId')}
                  >
                    <option value="">Seleccionar alumno...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </option>
                    ))}
                  </select>
                  {errors.studentId && (
                    <span className="error-message">{errors.studentId.message}</span>
                  )}
                </div>
              </>
            )}

            <Input
              label="Programar para"
              type="datetime-local"
              disabled={isLoading}
              error={errors.scheduledAt?.message}
              {...register('scheduledAt')}
            />

            <Input
              label="Expira el"
              type="datetime-local"
              disabled={isLoading}
              error={errors.expiresAt?.message}
              {...register('expiresAt')}
            />
          </div>

          <div className="modal-footer flex justify-end gap-[12px]">
            <Button variant="secondary" size="sm" type="button" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" size="md" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
