'use client';

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const tabParam = searchParams?.get('tab');
  const verificationParam = searchParams?.get('verification');
  
  const initialVerification = verificationParam 
    ? verificationParam 
    : tabParam === 'pendientes' 
      ? 'PENDING' 
      : '';
      
  const [filterVerification, setFilterVerification] = useState<string>(initialVerification);

  useEffect(() => {
    if (verificationParam) setFilterVerification(verificationParam);
    else if (tabParam === 'pendientes') setFilterVerification('PENDING');
  }, [tabParam, verificationParam]);

  const refetch = useCallback(() => {
    const id = getInstitutionId();
    if (!id) return;
    setIsLoading(true); setError(null);
    studentsService.getDirectorStudents().then((data) => {
      setStudents(data);
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

  const handleStatusChange = async (student: Student, newStatus: 'VERIFIED' | 'REJECTED') => {
    try {
      await studentsService.update(student.id, { verificationStatus: newStatus });
      addToast('success', 'Éxito', `Estudiante ${newStatus === 'VERIFIED' ? 'aprobado' : 'rechazado'}`);
      refetch();
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      addToast('error', title, message);
    }
  };

  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        const matchesText = !filterText || fullName.includes(filterText.toLowerCase());
        const matchesStatus = !filterStatus || (filterStatus === 'active' ? s.isActive : !s.isActive);
        const matchesVerification = !filterVerification || s.verificationStatus === filterVerification;
        return matchesText && matchesStatus && matchesVerification;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [students, filterText, filterStatus, filterVerification]);

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
    { key: 'actions', header: 'Acciones', className: 'w-[140px]', render: (s: Student) => (
      <div className="flex items-center gap-[4px]">
        <button onClick={() => setViewingStudent(s)} className="btn btn-2xs btn-ghost" title="Ver detalle">
          <span className="material-symbols-outlined text-[16px]">visibility</span>
        </button>
        {(!s.verificationStatus || s.verificationStatus === 'VERIFIED') && (
          <button onClick={() => handleEdit(s)} className="btn btn-2xs btn-ghost" title="Asignar sección">
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
        )}
        {s.verificationStatus === 'PENDING' && (
          <>
            <button onClick={() => handleStatusChange(s, 'VERIFIED')} className="btn btn-2xs btn-ghost text-success-600 hover:bg-success-50" title="Aprobar">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
            </button>
            <button onClick={() => handleStatusChange(s, 'REJECTED')} className="btn btn-2xs btn-ghost text-error-600 hover:bg-error-50" title="Rechazar">
              <span className="material-symbols-outlined text-[16px]">cancel</span>
            </button>
          </>
        )}
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
        <p className="page-subtitle">Visualización y gestión de alumnos</p>
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
        </div>
        <div className="flex items-center gap-[8px]">
          <label className="text-[13px] font-medium text-secondary-600">Estado de Cuenta:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input max-w-[150px]">
            <option value="">Todos</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
        <div className="flex items-center gap-[8px]">
          <label className="text-[13px] font-medium text-secondary-600">Solicitud:</label>
          <select value={filterVerification} onChange={(e) => { setFilterVerification(e.target.value); router.replace('/dashboard/director/alumnos'); }} className="input max-w-[150px]">
            <option value="">Todas</option>
            <option value="VERIFIED">Aprobados</option>
            <option value="PENDING">Pendientes</option>
            <option value="REJECTED">Rechazados</option>
          </select>
        </div>


        <div className="ml-auto flex items-center">
          {(filterText || filterStatus || filterVerification) && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setFilterText('');
                setFilterStatus('');
                setFilterVerification('');
                router.replace('/dashboard/director/alumnos');
              }}
              className="gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              Limpiar Filtros
            </Button>
          )}
        </div>
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
