'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { gradesService } from '@/features/director/services/grades.service';
import { sectionsService } from '@/features/director/services/sections.service';
import type { Grade, Section } from '@/shared/lib/types';

interface TeacherEditFormProps {
  onSubmit: (data: { gradeId: string; sectionId: string }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  institutionId: string;
  currentGradeId?: string | null;
  currentSectionId?: string | null;
  teacherName?: string;
}

export function TeacherEditForm({
  onSubmit,
  onCancel,
  isLoading,
  institutionId,
  currentGradeId,
  currentSectionId,
  teacherName,
}: TeacherEditFormProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState(currentGradeId ?? '');
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState(currentSectionId ?? '');
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    gradesService.getAll(institutionId).then(setGrades).catch(() => {});
  }, [institutionId]);

  useEffect(() => {
    if (!selectedGradeId) return;
    sectionsService.getAll(institutionId, selectedGradeId).then(setSections).catch(() => {});
  }, [institutionId, selectedGradeId]);

  const handleSubmit = () => {
    onSubmit({ gradeId: selectedGradeId, sectionId: selectedSectionId });
  };

  const hasChanged = selectedGradeId !== (currentGradeId ?? '') || selectedSectionId !== (currentSectionId ?? '');

  return (
    <Modal>
      <div className="modal-content max-w-[480px] w-full">
        <div className="modal-header">
          <h2 className="modal-title">Reasignar Sección</h2>
          <button type="button" onClick={onCancel} className="text-secondary-600 hover:text-secondary-900 cursor-pointer">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
        <div className="modal-body flex flex-col gap-[16px]">
          {teacherName && (
            <p className="text-[14px] text-secondary-600">
              Docente: <span className="font-medium text-secondary-900">{teacherName}</span>
            </p>
          )}

          <div className="w-full flex flex-col">
            <label className="label">Grado</label>
            <select
              value={selectedGradeId}
              onChange={(e) => { setSelectedGradeId(e.target.value); setSelectedSectionId(''); }}
              disabled={isLoading}
              className="input"
            >
              <option value="">Seleccionar grado...</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>{g.name} ({g.ageRangeMin}-{g.ageRangeMax} años)</option>
              ))}
            </select>
          </div>

          {selectedGradeId && (
            <div className="w-full flex flex-col">
              <label className="label">Sección</label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                disabled={isLoading}
                className="input"
              >
                <option value="">Seleccionar sección...</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} (capacidad: {s.capacity})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="modal-footer flex justify-end gap-[12px]">
          <Button variant="secondary" size="sm" type="button" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="button" size="md" disabled={isLoading || !selectedSectionId || !hasChanged} onClick={handleSubmit}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
