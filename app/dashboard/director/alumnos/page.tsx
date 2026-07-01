'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { studentsService } from '@/features/docente/services/students.service';
import { sectionsService } from '@/features/director/services/sections.service';
import { gradesService } from '@/features/director/services/grades.service';
import { getInstitutionId } from '@/shared/lib/jwt';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/errors';
import type { Student, Grade, Section } from '@/shared/lib/types';

export default function DirectorAlumnosPage() {
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const initialized = useRef(false);
  const { addToast } = useToast();

  const refetch = useCallback(() => {
    const id = getInstitutionId();
    if (!id) return;
    setIsLoading(true); setError(null);
    studentsService.getAll().then((data) => {
      setStudents(data.filter((s) => s.institutionId === id));
      setIsLoading(false);
    }).catch((err: Error) => {
      setError(err.message || 'Error al cargar alumnos');
      setIsLoading(false);
    });
  }, []);

  const fetchGrades = useCallback(() => {
    const id = getInstitutionId();
    if (!id) return;
    gradesService.getAll(id).then(setGrades).catch(() => {});
  }, []);

  const fetchSections = useCallback((gradeId: string) => {
    const id = getInstitutionId();
    if (!id) return;
    sectionsService.getAll(id, gradeId).then(setSections).catch(() => setSections([]));
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const id = getInstitutionId();
    setInstitutionId(id ?? null);
    if (id) {
      void Promise.resolve().then(() => refetch());
      fetchGrades();
    }
  }, [refetch, fetchGrades]);

  const handleEdit = (s: Student) => {
    setEditingStudent(s);
    setSelectedGradeId('');
    setSelectedSectionId('');
    setSections([]);
  };

  const handleGradeChange = (gradeId: string) => {
    setSelectedGradeId(gradeId);
    setSelectedSectionId('');
    setSections([]);
    if (gradeId) fetchSections(gradeId);
  };

  const handleEditSave = async () => {
    if (!editingStudent) return;
    setFormLoading(true);
    try {
      await studentsService.update(editingStudent.id, {
        sectionId: selectedSectionId || undefined,
      });
      setEditingStudent(null);
      setSelectedGradeId('');
      setSelectedSectionId('');
      setSections([]);
      addToast('success', 'Sección actualizada');
      refetch();
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      addToast('error', title, message);
    } finally {
      setFormLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesText = !filterText || fullName.includes(filterText.toLowerCase());
    const matchesStatus = !filterStatus || (filterStatus === 'active' ? s.isActive : !s.isActive);
    return matchesText && matchesStatus;
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const genderLabels: Record<string, string> = {
    MALE: 'Masculino',
    FEMALE: 'Femenino',
    OTHER: 'Otro',
  };

  const columns = [
    { key: 'name', header: 'Nombre', render: (s: Student) => <span className="text-[14px] font-medium text-secondary-900">{s.firstName} {s.lastName}</span> },
    { key: 'section', header: 'Sección', render: (s: Student) => <span className="text-[13px] text-secondary-600">{s.section?.name ?? '-'}</span> },
    { key: 'birthDate', header: 'Nacimiento', render: (s: Student) => <span className="text-[13px] text-secondary-600">{s.birthDate ? new Date(s.birthDate).toLocaleDateString('es-PE') : '-'}</span> },
    { key: 'status', header: 'Estado', className: 'w-[90px]', render: (s: Student) => <Badge variant={s.isActive ? 'success' : 'error'}>{s.isActive ? 'Activo' : 'Inactivo'}</Badge> },
    { key: 'actions', header: 'Acciones', className: 'w-[110px]', render: (s: Student) => (
      <div className="flex items-center gap-[4px]">
        <button onClick={() => setViewingStudent(s)} className="btn btn-2xs btn-ghost" title="Ver detalle">
          <span className="material-symbols-outlined text-[16px]">visibility</span>
        </button>
        <button onClick={() => handleEdit(s)} className="btn btn-2xs btn-ghost" title="Asignar sección">
          <span className="material-symbols-outlined text-[16px]">edit</span>
        </button>
      </div>
    )},
  ];

  if (!institutionId) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Alumnos</h1><p className="page-subtitle">Gestión de alumnos</p></div>
        <div className="card"><div className="empty-state"><p className="empty-state-title">Sin institución asignada</p><p className="empty-state-description">No tienes una institución asignada.</p></div></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Alumnos</h1>
        <p className="page-subtitle">Visualización de alumnos por grado y sección</p>
      </div>

      <div className="mb-[16px] flex items-center gap-[12px] flex-wrap">
        <div className="flex items-center gap-[8px] max-w-[320px] flex-1">
          <span className="material-symbols-outlined text-[18px] text-secondary-400">search</span>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Buscar por nombre..."
            className="input"
          />
          {filterText && (
            <button onClick={() => setFilterText('')} className="btn btn-2xs btn-ghost text-secondary-400" title="Limpiar filtro">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-[8px]">
          <label className="text-[13px] font-medium text-secondary-600">Estado:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input max-w-[150px]">
            <option value="">Todos</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
          {filterStatus && (
            <button onClick={() => setFilterStatus('')} className="btn btn-2xs btn-ghost text-secondary-400" title="Limpiar filtro">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
        {(filterText || filterStatus) && (
          <span className="text-[13px] text-secondary-500">
            {filteredStudents.length} resultado{filteredStudents.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <Table<Student>
        columns={columns}
        data={filteredStudents}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={filterText || filterStatus ? 'No hay alumnos que coincidan con los filtros.' : 'No hay alumnos registrados en esta institución.'}
        pageSize={10}
      />

      {viewingStudent && (
        <Modal>
          <div className="modal-content max-w-[480px] w-full">
            <div className="modal-header">
              <h2 className="modal-title">{viewingStudent.firstName} {viewingStudent.lastName}</h2>
              <button type="button" onClick={() => setViewingStudent(null)} className="text-secondary-600 hover:text-secondary-900 cursor-pointer">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="modal-body flex flex-col gap-[20px]">
              <div className="flex gap-[24px]">
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Nombre</p>
                  <p className="text-[14px] text-secondary-900">{viewingStudent.firstName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Apellido</p>
                  <p className="text-[14px] text-secondary-900">{viewingStudent.lastName}</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Sección</p>
                <p className="text-[14px] text-secondary-700">{viewingStudent.section?.name ?? '-'}</p>
              </div>
              <div className="flex gap-[24px]">
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Nacimiento</p>
                  <p className="text-[14px] text-secondary-700">{viewingStudent.birthDate ? new Date(viewingStudent.birthDate).toLocaleDateString('es-PE') : '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Género</p>
                  <p className="text-[14px] text-secondary-700">{viewingStudent.gender ? (genderLabels[viewingStudent.gender] ?? viewingStudent.gender) : '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Estado</p>
                <Badge variant={viewingStudent.isActive ? 'success' : 'error'}>{viewingStudent.isActive ? 'Activo' : 'Inactivo'}</Badge>
              </div>
              <div className="flex gap-[24px]">
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Creado</p>
                  <p className="text-[13px] text-secondary-700">{formatDate(viewingStudent.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Actualizado</p>
                  <p className="text-[13px] text-secondary-700">{formatDate(viewingStudent.updatedAt)}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setViewingStudent(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}

      {editingStudent && (
        <Modal>
          <div className="modal-content max-w-[440px] w-full">
            <div className="modal-header">
              <h2 className="modal-title">Asignar Sección</h2>
              <button type="button" onClick={() => { setEditingStudent(null); setSelectedGradeId(''); setSelectedSectionId(''); setSections([]); }} className="text-secondary-600 hover:text-secondary-900 cursor-pointer">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="modal-body flex flex-col gap-[16px]">
              <p className="text-[14px] text-secondary-700">
                Asignar sección a <strong>{editingStudent.firstName} {editingStudent.lastName}</strong>
              </p>
              <div className="flex flex-col gap-[4px]">
                <label className="text-[13px] font-semibold text-secondary-700">Grado</label>
                <select
                  value={selectedGradeId}
                  onChange={(e) => handleGradeChange(e.target.value)}
                  className="input"
                >
                  <option value="">Seleccionar grado...</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>{g.name} ({g.ageRangeMin}-{g.ageRangeMax} años)</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className="text-[13px] font-semibold text-secondary-700">Sección</label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="input"
                  disabled={!selectedGradeId}
                >
                  <option value="">{selectedGradeId ? 'Seleccionar sección...' : 'Primero selecciona un grado'}</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} (Cap. {s.capacity})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer flex justify-end gap-[12px]">
              <Button variant="secondary" size="sm" onClick={() => { setEditingStudent(null); setSelectedGradeId(''); setSelectedSectionId(''); setSections([]); }} disabled={formLoading}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleEditSave} disabled={formLoading || !selectedSectionId}>
                {formLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
