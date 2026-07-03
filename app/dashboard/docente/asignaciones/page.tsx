'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Modal } from '@/shared/components/ui/Modal';
import { WordAssignmentForm } from '@/features/docente/components/WordAssignmentForm';
import { wordAssignmentsService } from '@/features/docente/services/word-assignments.service';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/errors';
import { useSetMobileAction } from '@/shared/contexts/MobileActionContext';
import type { WordAssignment, WordAssignmentStatus } from '@/shared/lib/types';

const statusBadgeClass: Record<WordAssignmentStatus, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border border-yellow-200 px-[10px] py-[2px] rounded-[6px] text-[12px] font-medium',
  COMPLETED: 'bg-green-50 text-green-700 border border-green-200 px-[10px] py-[2px] rounded-[6px] text-[12px] font-medium',
  EXPIRED: 'bg-red-50 text-red-700 border border-red-200 px-[10px] py-[2px] rounded-[6px] text-[12px] font-medium',
};

const statusLabels: Record<WordAssignmentStatus, string> = {
  PENDING: 'Pendiente',
  COMPLETED: 'Completado',
  EXPIRED: 'Expirado',
};

export default function DocenteAsignacionesPage() {
  const [assignments, setAssignments] = useState<WordAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const { addToast } = useToast();
  const [filterStatus, setFilterStatus] = useState('');
  const [filterText, setFilterText] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<WordAssignment | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<WordAssignment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [viewingAssignment, setViewingAssignment] = useState<WordAssignment | null>(null);

  const initialized = useRef(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try teacher-scoped endpoint first
      const data = await wordAssignmentsService.getTeacherAssignments();
      setAssignments(data);
      setUsingFallback(false);
    } catch {
      // Fallback: old approach (will likely also fail for teacher role)
      try {
        const data = await wordAssignmentsService.getAll();
        setAssignments(data);
        setUsingFallback(true);
      } catch (err) {
        const { title, message } = getErrorMessage(err);
        setError(title ? `${title}: ${message}` : 'Error al cargar asignaciones');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    refetch();
  }, [refetch]);

  const filteredAssignments = assignments.filter((a) => {
    const matchesStatus = !filterStatus || a.status === filterStatus;
    const studentName = a.student ? `${a.student.firstName} ${a.student.lastName}` : '';
    const wordText = a.word?.text ?? '';
    const matchesText =
      !filterText ||
      studentName.toLowerCase().includes(filterText.toLowerCase()) ||
      wordText.toLowerCase().includes(filterText.toLowerCase());
    return matchesStatus && matchesText;
  });

  const handleCreate = () => { setEditingAssignment(null); setShowForm(true); };

  const setMobileAction = useSetMobileAction(null);
  useEffect(() => {
    setMobileAction({ label: 'Nueva Asignación', icon: 'add', onClick: handleCreate });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const handleEdit = (a: WordAssignment) => { setEditingAssignment(a); setShowForm(true); };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    setFormLoading(true);
    try {
      if (editingAssignment) {
        await wordAssignmentsService.update(editingAssignment.id, {
          status: data.status as string | undefined,
          scheduledAt: (data.scheduledAt as string) || undefined,
          expiresAt: (data.expiresAt as string) || undefined,
        });
      } else {
        await wordAssignmentsService.create({
          wordId: data.wordId as string,
          studentId: data.studentId as string,
          scheduledAt: (data.scheduledAt as string) || undefined,
          expiresAt: (data.expiresAt as string) || undefined,
        });
      }
      setShowForm(false);
      setEditingAssignment(null);
      addToast('success', editingAssignment ? 'Asignación actualizada' : 'Asignación creada');
      refetch();
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      addToast('error', title, message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await wordAssignmentsService.delete(deleteTarget.id);
      setDeleteTarget(null);
      addToast('success', 'Asignación eliminada');
      refetch();
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      addToast('error', title, message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const columns = [
    { key: 'student', header: 'Alumno', render: (a: WordAssignment) => <span className="text-[14px] font-medium text-secondary-900">{a.student ? `${a.student.firstName} ${a.student.lastName}` : '-'}</span> },
    { key: 'word', header: 'Palabra', render: (a: WordAssignment) => <span className="text-[14px] text-secondary-700">{a.word?.text ?? '-'}</span> },
    { key: 'status', header: 'Estado', className: 'w-[110px]', render: (a: WordAssignment) => <span className={statusBadgeClass[a.status] ?? 'badge-secondary'}>{statusLabels[a.status] ?? a.status}</span> },
    { key: 'scheduled', header: 'Programado', render: (a: WordAssignment) => <span className="text-[13px] text-secondary-600">{a.scheduledAt ? new Date(a.scheduledAt).toLocaleDateString('es-PE') : '-'}</span> },
    { key: 'actions', header: 'Acciones', className: 'w-[130px]', render: (a: WordAssignment) => (
      <div className="flex items-center gap-[4px]">
        <button onClick={() => setViewingAssignment(a)} className="btn btn-2xs btn-ghost" title="Ver detalle"><span className="material-symbols-outlined text-[16px]">visibility</span></button>
        <button onClick={() => handleEdit(a)} className="btn btn-2xs btn-ghost" title="Editar estado"><span className="material-symbols-outlined text-[16px]">edit</span></button>
        <button onClick={() => setDeleteTarget(a)} className="btn btn-2xs btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600" title="Eliminar"><span className="material-symbols-outlined text-[16px]">delete</span></button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Asignaciones</h1><p className="page-subtitle">Gestión de palabras asignadas a alumnos</p></div>
        <Button onClick={handleCreate} size="sm" className="hidden md:inline-flex"><span className="material-symbols-outlined text-[18px] mr-[4px]">add</span>Nueva Asignación</Button>
      </div>

      {usingFallback && (
        <div className="mb-[16px] px-[16px] py-[10px] bg-amber-50 border border-amber-200 rounded-[10px] text-[13px] text-amber-800 flex items-center gap-[8px]">
          <span className="material-symbols-outlined text-[18px] text-amber-500">info</span>
          Usando filtro local — algunos datos podrían no estar actualizados.
        </div>
      )}

      <div className="mb-[16px] flex items-center gap-[12px] flex-wrap">
        <div className="flex items-center gap-[8px] max-w-[320px] flex-1">
          <span className="material-symbols-outlined text-[18px] text-secondary-400">search</span>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Buscar por alumno o palabra..."
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
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input max-w-[160px]">
            <option value="">Todos</option>
            {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {filterStatus && (
            <button onClick={() => setFilterStatus('')} className="btn btn-2xs btn-ghost text-secondary-400" title="Limpiar filtro">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
        {(filterStatus || filterText) && (
          <span className="text-[13px] text-secondary-500">
            {filteredAssignments.length} asignación{filteredAssignments.length !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      <Table<WordAssignment>
        columns={columns}
        data={filteredAssignments}
        keyExtractor={(a) => a.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={
          filterStatus || filterText
            ? filterStatus && filterText
              ? `No hay asignaciones con estado "${statusLabels[filterStatus as WordAssignmentStatus] ?? filterStatus}" que coincidan con "${filterText}"`
              : filterStatus
                ? `No hay asignaciones con estado "${statusLabels[filterStatus as WordAssignmentStatus] ?? filterStatus}"`
                : `No hay asignaciones que coincidan con "${filterText}"`
            : 'No hay asignaciones en tus secciones.'
        }
        pageSize={10}
      />

      {showForm && <WordAssignmentForm onSubmit={handleFormSubmit} onCancel={() => { setShowForm(false); setEditingAssignment(null); }} isLoading={formLoading} assignment={editingAssignment} />}
      <ConfirmDialog isOpen={!!deleteTarget} title="Eliminar Asignación" message="¿Estás seguro de eliminar esta asignación?" confirmLabel="Eliminar" onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} isLoading={deleteLoading} />

      {viewingAssignment && (
        <Modal>
          <div className="modal-content max-w-[480px] w-full">
            <div className="modal-header">
              <h2 className="modal-title">Detalle de Asignación</h2>
              <button type="button" onClick={() => setViewingAssignment(null)} className="text-secondary-600 hover:text-secondary-900 cursor-pointer">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="modal-body flex flex-col gap-[20px]">
              <div>
                <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Alumno</p>
                <p className="text-[14px] text-secondary-900">{viewingAssignment.student ? `${viewingAssignment.student.firstName} ${viewingAssignment.student.lastName}` : '-'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Palabra</p>
                <p className="text-[14px] text-secondary-700">{viewingAssignment.word?.text ?? '-'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Estado</p>
                <span className={statusBadgeClass[viewingAssignment.status] ?? 'badge-secondary'}>
                  {statusLabels[viewingAssignment.status] ?? viewingAssignment.status}
                </span>
              </div>
              <div className="flex gap-[24px]">
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Programado</p>
                  <p className="text-[13px] text-secondary-700">{viewingAssignment.scheduledAt ? new Date(viewingAssignment.scheduledAt).toLocaleDateString('es-PE') : '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Expira</p>
                  <p className="text-[13px] text-secondary-700">{viewingAssignment.expiresAt ? new Date(viewingAssignment.expiresAt).toLocaleDateString('es-PE') : '-'}</p>
                </div>
              </div>
              <div className="flex gap-[24px]">
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Creado</p>
                  <p className="text-[13px] text-secondary-700">{formatDate(viewingAssignment.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Actualizado</p>
                  <p className="text-[13px] text-secondary-700">{formatDate(viewingAssignment.updatedAt)}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setViewingAssignment(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
