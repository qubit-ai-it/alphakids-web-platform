'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { studentsService } from '@/features/docente/services/students.service';
import { getTeacherSectionIds } from '@/shared/lib/jwt';
import type { Student } from '@/shared/lib/types';

export default function DocenteAlumnosPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const initialized = useRef(false);

  const refetch = useCallback(() => {
    const sectionIds = getTeacherSectionIds();
    if (sectionIds.length === 0) { setStudents([]); setIsLoading(false); return; }
    setIsLoading(true);
    setError(null);
    studentsService.getAll().then((data) => {
      setStudents(data.filter((s) => sectionIds.includes(s.sectionId ?? '')));
      setIsLoading(false);
    }).catch((err: Error) => {
      setError(err.message || 'Error al cargar alumnos');
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    refetch();
  }, [refetch]);

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
    { key: 'actions', header: 'Acciones', className: 'w-[70px]', render: (s: Student) => (
      <button onClick={() => setViewingStudent(s)} className="btn btn-2xs btn-ghost" title="Ver detalle">
        <span className="material-symbols-outlined text-[16px]">visibility</span>
      </button>
    )},
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Alumnos</h1>
        <p className="page-subtitle">Alumnos asignados a tus secciones</p>
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
        emptyMessage={filterText || filterStatus ? 'No hay alumnos que coincidan con los filtros.' : 'No hay alumnos en tus secciones.'}
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
    </div>
  );
}
