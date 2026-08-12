'use client';

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Pagination } from '@/shared/components/ui/Pagination';
import { Badge } from '@/shared/components/ui/Badge';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { studentsService } from '@/features/docente/services/students.service';
import { sectionsService } from '@/features/director/services/sections.service';
import { gradesService } from '@/features/director/services/grades.service';
import { getInstitutionId } from '@/shared/lib/jwt';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/errors';
import { useSetMobileAction } from '@/shared/contexts/MobileActionContext';
import type { Student, Grade, Section } from '@/shared/lib/types';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type ViewMode = 'verified' | 'pending';

export default function DirectorAlumnosPage() {
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [rejectingStudent, setRejectingStudent] = useState<Student | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('verified');
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const initialized = useRef(false);
  const viewModeRef = useRef<ViewMode>(viewMode);
  const { addToast } = useToast();

  viewModeRef.current = viewMode;

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const fetchPendingCount = useCallback(async () => {
    const id = getInstitutionId();
    if (!id) return;
    try {
      const { total: count } = await studentsService.getDirectorStudents({
        skip: 0,
        take: 1,
        verificationStatus: 'PENDING',
      });
      setPendingCount(count);
    } catch {
      // preserve last known count
    }
  }, []);

  const refetch = useCallback(
    (pageToLoad?: number, searchText?: string) => {
      const id = getInstitutionId();
      if (!id) return;
      const targetPage = pageToLoad ?? page;
      const targetSearch = searchText ?? filterText;
      setIsLoading(true);
      setError(null);
      studentsService
        .getDirectorStudents({
          skip: targetPage * PAGE_SIZE,
          take: PAGE_SIZE,
          search: targetSearch.trim() || undefined,
          verificationStatus: viewModeRef.current === 'pending' ? 'PENDING' : 'VERIFIED',
        })
        .then(({ items, total }) => {
          setStudents(items);
          setTotal(total);
          setHasNextPage(total > (targetPage + 1) * PAGE_SIZE);
          setIsLoading(false);
        })
        .catch((err: Error) => {
          setError(err.message || 'Error al cargar alumnos');
          setIsLoading(false);
        });
      void fetchPendingCount();
    },
    [page, filterText, fetchPendingCount],
  );

  const handlePageChange = (next: number) => {
    setPage(next);
    refetch(next);
  };

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
      void Promise.resolve().then(() => refetch(0, ''));
      fetchGrades();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(0);
      refetch(0, filterText);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [filterText, refetch]);

  useEffect(() => {
    if (!institutionId) return;
    setPage(0);
    setSelectedIds(new Set());
    refetch(0, filterText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

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

  const handleStatusChange = async (student: Student, newStatus: 'VERIFIED' | 'REJECTED', reason: string = '') => {
    if (!institutionId) return;
    try {
      await studentsService.verify(institutionId, student.id, {
        status: newStatus,
        rejectionReason: newStatus === 'REJECTED' ? reason.trim() || undefined : undefined,
      });
      addToast('success', 'Éxito', `Estudiante ${newStatus === 'VERIFIED' ? 'aprobado' : 'rechazado'}`);
      setSelectedIds((prev) => {
        if (!prev.has(student.id)) return prev;
        const next = new Set(prev);
        next.delete(student.id);
        return next;
      });
      refetch();
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      addToast('error', title, message);
    }
  };

  const filteredStudents = useMemo(() => {
    return [...students]
      .filter((s) => {
        if (viewMode !== 'verified') return true;
        if (!filterStatus) return true;
        return filterStatus === 'active' ? s.isActive : !s.isActive;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [students, filterStatus, viewMode]);

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

  const columns = viewMode === 'pending'
    ? [
        {
          key: 'select',
          header: '',
          className: 'w-[40px]',
          render: (s: Student) => (
            <input
              type="checkbox"
              checked={selectedIds.has(s.id)}
              onChange={() => toggleSelected(s.id)}
              aria-label={`Seleccionar ${s.firstName} ${s.lastName}`}
            />
          ),
        },
        { key: 'name', header: 'Nombre', render: (s: Student) => <span className="text-[14px] font-medium text-secondary-900">{s.firstName} {s.lastName}</span> },
        { key: 'section', header: 'Sección', render: (s: Student) => <span className="text-[13px] text-secondary-600">{s.section?.name ?? '-'}</span> },
        { key: 'birthDate', header: 'Nacimiento', render: (s: Student) => <span className="text-[13px] text-secondary-600">{s.birthDate ? new Date(s.birthDate).toLocaleDateString('es-PE') : '-'}</span> },
        { key: 'actions', header: 'Acciones', className: 'w-[140px]', render: (s: Student) => (
          <div className="flex items-center gap-[4px]">
            <button onClick={() => setViewingStudent(s)} className="btn btn-2xs btn-ghost" title="Ver detalle">
              <span className="material-symbols-outlined text-[16px]">visibility</span>
            </button>
            <button onClick={() => handleStatusChange(s, 'VERIFIED')} className="btn btn-2xs btn-ghost text-success-600 hover:bg-success-50" title="Aprobar">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
            </button>
            <button onClick={() => { setRejectingStudent(s); setRejectReason(''); }} className="btn btn-2xs btn-ghost text-error-600 hover:bg-error-50" title="Rechazar">
              <span className="material-symbols-outlined text-[16px]">cancel</span>
            </button>
          </div>
        )},
      ]
    : [
        { key: 'name', header: 'Nombre', render: (s: Student) => <span className="text-[14px] font-medium text-secondary-900">{s.firstName} {s.lastName}</span> },
        { key: 'section', header: 'Sección', render: (s: Student) => <span className="text-[13px] text-secondary-600">{s.section?.name ?? '-'}</span> },
        { key: 'birthDate', header: 'Nacimiento', render: (s: Student) => <span className="text-[13px] text-secondary-600">{s.birthDate ? new Date(s.birthDate).toLocaleDateString('es-PE') : '-'}</span> },
        { key: 'status', header: 'Estado', className: 'w-[90px]', render: (s: Student) => <Badge variant={s.isActive ? 'success' : 'error'}>{s.isActive ? 'Activo' : 'Inactivo'}</Badge> },
        { key: 'actions', header: 'Acciones', className: 'w-[140px]', render: (s: Student) => (
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

  const setMobileAction = useSetMobileAction(null);
  useEffect(() => {
    setMobileAction(
      viewMode === 'pending'
        ? {
            label: 'Volver a aprobados',
            icon: 'arrow_back',
            onClick: () => { setViewMode('verified'); },
          }
        : {
            label: `Aprobar (${pendingCount ?? 0})`,
            icon: 'check_circle',
            onClick: () => { setViewMode('pending'); },
            disabled: (pendingCount ?? 0) === 0,
          },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, pendingCount, setMobileAction]);

  if (!institutionId) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Alumnos</h1><p className="page-subtitle">Gestión de alumnos</p></div>
        <div className="card"><div className="empty-state"><p className="empty-state-title">Sin institución asignada</p><p className="empty-state-description">No tienes una institución asignada.</p></div></div>
      </div>
    );
  }

  const subtitle = viewMode === 'pending'
    ? 'Pendientes de aprobación'
    : 'Alumnos activos en la institución';

  const emptyMessage = viewMode === 'pending'
    ? 'No hay solicitudes pendientes.'
    : filterStatus
      ? 'No hay alumnos que coincidan con los filtros.'
      : 'No hay alumnos registrados en esta institución.';

  return (
    <div>
      <div className="page-header flex items-center justify-between gap-[12px] flex-wrap">
        <div>
          <h1 className="page-title">Alumnos</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
        <div className="flex items-center gap-[8px]">
          {viewMode === 'pending' ? (
            <Button
              onClick={() => setViewMode('verified')}
              size="sm"
              variant="ghost"
              className="hidden md:inline-flex"
            >
              <span className="material-symbols-outlined text-[18px] mr-[4px]">arrow_back</span>
              Volver a aprobados
            </Button>
          ) : (
            <Button
              onClick={() => setViewMode('pending')}
              size="sm"
              disabled={(pendingCount ?? 0) === 0}
              className="hidden md:inline-flex"
            >
              <span className="material-symbols-outlined text-[18px] mr-[4px]">check_circle</span>
              Aprobar ({pendingCount ?? 0})
            </Button>
          )}
        </div>
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
        {viewMode === 'verified' && (
          <div className="flex items-center gap-[8px]">
            <label className="text-[13px] font-medium text-secondary-600">Estado de Cuenta:</label>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }} className="input max-w-[150px]">
              <option value="">Todos</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        )}

        <div className="ml-auto flex items-center">
          {(filterText || (viewMode === 'verified' && filterStatus)) && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setFilterText('');
                if (viewMode === 'verified') setFilterStatus('');
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
        columns={columns as unknown as Parameters<typeof Table<Student>>[0]['columns']}
        data={filteredStudents}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch(page)}
        emptyMessage={emptyMessage}
      />

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        totalItems={total}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        onPageChange={handlePageChange}
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

      {rejectingStudent && (
        <Modal>
          <div className="modal-content max-w-[440px] w-full">
            <div className="modal-header">
              <h2 className="modal-title">Rechazar alumno</h2>
              <button type="button" onClick={() => { setRejectingStudent(null); setRejectReason(''); }} className="text-secondary-600 hover:text-secondary-900 cursor-pointer">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="modal-body flex flex-col gap-[16px]">
              <p className="text-[14px] text-secondary-700">
                Vas a rechazar a <strong>{rejectingStudent.firstName} {rejectingStudent.lastName}</strong>.
              </p>
              <div className="flex flex-col gap-[4px]">
                <label className="text-[13px] font-semibold text-secondary-700">Motivo</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  maxLength={500}
                  placeholder="Motivo del rechazo (opcional)"
                  className="input min-h-[100px] resize-y"
                  rows={4}
                />
                <span className="text-[11px] text-secondary-400 self-end">{rejectReason.length}/500</span>
              </div>
            </div>
            <div className="modal-footer flex justify-end gap-[12px]">
              <Button variant="secondary" size="sm" onClick={() => { setRejectingStudent(null); setRejectReason(''); }}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  const target = rejectingStudent;
                  const reason = rejectReason;
                  setRejectingStudent(null);
                  setRejectReason('');
                  await handleStatusChange(target, 'REJECTED', reason);
                }}
              >
                Rechazar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
