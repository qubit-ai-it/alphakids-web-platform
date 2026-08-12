'use client';

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRejecting, setBulkRejecting] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');
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

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
    },
    [page, filterText],
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
      refetch();
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      addToast('error', title, message);
    }
  };

  const handleBulkApprove = useCallback(async () => {
    if (!institutionId || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(
        ids.map((id) =>
          studentsService.verify(institutionId, id, { status: 'VERIFIED' }),
        ),
      );
      addToast('success', 'Aprobación masiva', `${ids.length} estudiante(s) aprobado(s)`);
      setSelectedIds(new Set());
      refetch();
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      addToast('error', title, message);
    }
  }, [institutionId, selectedIds, addToast, refetch]);

  const openBulkRejectModal = useCallback(() => {
    if (selectedIds.size === 0) return;
    setBulkRejectReason('');
    setBulkRejecting(true);
  }, [selectedIds.size]);

  const submitBulkReject = useCallback(async () => {
    if (!institutionId || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const reason = bulkRejectReason.trim();
    setBulkRejecting(false);
    setBulkRejectReason('');
    try {
      await Promise.all(
        ids.map((id) =>
          studentsService.verify(institutionId, id, {
            status: 'REJECTED',
            rejectionReason: reason || undefined,
          }),
        ),
      );
      addToast('success', 'Rechazo masivo', `${ids.length} estudiante(s) rechazado(s)`);
      setSelectedIds(new Set());
      refetch();
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      addToast('error', title, message);
    }
  }, [institutionId, selectedIds, bulkRejectReason, addToast, refetch]);

  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesStatus = !filterStatus || (filterStatus === 'active' ? s.isActive : !s.isActive);
        const matchesVerification = !filterVerification || s.verificationStatus === filterVerification;
        return matchesStatus && matchesVerification;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [students, filterStatus, filterVerification]);

  const pendingInPage = useMemo(
    () => students.filter((s) => s.verificationStatus === 'PENDING').map((s) => s.id),
    [students],
  );

  const allPendingSelected =
    pendingInPage.length > 0 && pendingInPage.every((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPendingSelected) {
        for (const id of pendingInPage) next.delete(id);
      } else {
        for (const id of pendingInPage) next.add(id);
      }
      return next;
    });
  };

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
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={allPendingSelected}
          disabled={pendingInPage.length === 0}
          onChange={toggleSelectAll}
          aria-label="Seleccionar todos los pendientes"
        />
      ),
      className: 'w-[40px]',
      render: (s: Student) =>
        s.verificationStatus === 'PENDING' ? (
          <input
            type="checkbox"
            checked={selectedIds.has(s.id)}
            onChange={() => toggleSelected(s.id)}
            aria-label={`Seleccionar ${s.firstName} ${s.lastName}`}
          />
        ) : null,
    },
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
            <button onClick={() => { setRejectingStudent(s); setRejectReason(''); }} className="btn btn-2xs btn-ghost text-error-600 hover:bg-error-50" title="Rechazar">
              <span className="material-symbols-outlined text-[16px]">cancel</span>
            </button>
          </>
        )}
      </div>
    )},
  ];

  const setMobileAction = useSetMobileAction(null);
  useEffect(() => {
    setMobileAction({
      label: 'Aprobar seleccionados',
      icon: 'check_circle',
      onClick: () => { void handleBulkApprove(); },
      disabled: selectedIds.size === 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, handleBulkApprove, setMobileAction]);

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
      <div className="page-header flex items-center justify-between gap-[12px] flex-wrap">
        <div>
          <h1 className="page-title">Alumnos</h1>
          <p className="page-subtitle">Visualización y gestión de alumnos</p>
        </div>
        <div className="flex items-center gap-[8px]">
          <Button
            onClick={handleBulkApprove}
            size="sm"
            disabled={selectedIds.size === 0}
            className="hidden md:inline-flex"
          >
            <span className="material-symbols-outlined text-[18px] mr-[4px]">check_circle</span>
            Aprobar ({selectedIds.size})
          </Button>
          <Button
            onClick={openBulkRejectModal}
            size="sm"
            disabled={selectedIds.size === 0}
            className="hidden md:inline-flex"
            variant="danger"
          >
            <span className="material-symbols-outlined text-[18px] mr-[4px]">cancel</span>
            Rechazar ({selectedIds.size})
          </Button>
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
        <div className="flex items-center gap-[8px]">
          <label className="text-[13px] font-medium text-secondary-600">Estado de Cuenta:</label>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }} className="input max-w-[150px]">
            <option value="">Todos</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
        <div className="flex items-center gap-[8px]">
          <label className="text-[13px] font-medium text-secondary-600">Solicitud:</label>
          <select
            value={filterVerification}
            onChange={(e) => {
              setFilterVerification(e.target.value);
              setSelectedIds(new Set());
              router.replace('/dashboard/director/alumnos');
            }}
            className="input max-w-[150px]"
          >
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
                setSelectedIds(new Set());
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
        columns={columns as unknown as Parameters<typeof Table<Student>>[0]['columns']}
        data={filteredStudents}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch(page)}
        emptyMessage={filterStatus ? 'No hay alumnos que coincidan con los filtros.' : 'No hay alumnos registrados en esta institución.'}
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

      {bulkRejecting && (
        <Modal>
          <div className="modal-content max-w-[440px] w-full">
            <div className="modal-header">
              <h2 className="modal-title">Rechazar {selectedIds.size} alumno(s)</h2>
              <button type="button" onClick={() => { setBulkRejecting(false); setBulkRejectReason(''); }} className="text-secondary-600 hover:text-secondary-900 cursor-pointer">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="modal-body flex flex-col gap-[16px]">
              <p className="text-[14px] text-secondary-700">
                Vas a rechazar a <strong>{selectedIds.size}</strong> estudiante(s) pendiente(s). El mismo motivo se aplicará a todos.
              </p>
              <div className="flex flex-col gap-[4px]">
                <label className="text-[13px] font-semibold text-secondary-700">Motivo</label>
                <textarea
                  value={bulkRejectReason}
                  onChange={(e) => setBulkRejectReason(e.target.value)}
                  maxLength={500}
                  placeholder="Motivo del rechazo (opcional)"
                  className="input min-h-[100px] resize-y"
                  rows={4}
                />
                <span className="text-[11px] text-secondary-400 self-end">{bulkRejectReason.length}/500</span>
              </div>
            </div>
            <div className="modal-footer flex justify-end gap-[12px]">
              <Button variant="secondary" size="sm" onClick={() => { setBulkRejecting(false); setBulkRejectReason(''); }}>
                Cancelar
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => { void submitBulkReject(); }}
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