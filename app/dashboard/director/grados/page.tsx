'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Pagination } from '@/shared/components/ui/Pagination';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Modal } from '@/shared/components/ui/Modal';
import { GradeForm } from '@/features/director/components/GradeForm';
import { gradesService } from '@/features/director/services/grades.service';
import { getInstitutionId } from '@/shared/lib/jwt';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/errors';
import { useSetMobileAction } from '@/shared/contexts/MobileActionContext';
import type { Grade } from '@/shared/lib/types';

const PAGE_SIZE = 20;

export default function DirectorGradosPage() {
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Grade | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [viewingGrade, setViewingGrade] = useState<Grade | null>(null);

  const [filterText, setFilterText] = useState('');
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  const initialized = useRef(false);

  const refetch = useCallback(
    (pageToLoad: number = page) => {
      const id = getInstitutionId();
      if (!id) return;
      setIsLoading(true);
      setError(null);
      gradesService
        .getAll(id, { skip: pageToLoad * PAGE_SIZE, take: PAGE_SIZE + 1 })
        .then((data) => {
          setHasNextPage(data.length > PAGE_SIZE);
          setGrades(data.slice(0, PAGE_SIZE));
          setIsLoading(false);
        })
        .catch((err: Error) => {
          const { title, message } = getErrorMessage(err);
          setError(title ? `${title}: ${message}` : 'Error al cargar grados');
          setIsLoading(false);
        });
    },
    [page],
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const id = getInstitutionId();
    setInstitutionId(id ?? null);
    if (id) { void Promise.resolve().then(() => refetch(0)); }
  }, [refetch]);

  const handlePageChange = (next: number) => {
    setPage(next);
    refetch(next);
  };

  const filteredGrades = filterText
    ? grades.filter((g) => g.name.toLowerCase().includes(filterText.toLowerCase()))
    : grades;

  const handleCreate = () => { setEditingGrade(null); setShowForm(true); };

  const setMobileAction = useSetMobileAction(null);
  useEffect(() => {
    setMobileAction({ label: 'Crear Grado', icon: 'add', onClick: handleCreate });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const handleEdit = (grade: Grade) => { setEditingGrade(grade); setShowForm(true); };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    const id = getInstitutionId();
    if (!id) return;
    setFormLoading(true);
    try {
      if (editingGrade) {
        await gradesService.update(id, editingGrade.id, {
          name: data.name as string,
          ageRangeMin: data.ageRangeMin as number,
          ageRangeMax: data.ageRangeMax as number,
        });
      } else {
        await gradesService.create(id, {
          name: data.name as string,
          ageRangeMin: data.ageRangeMin as number,
          ageRangeMax: data.ageRangeMax as number,
        });
      }
      setShowForm(false);
      setEditingGrade(null);
      addToast('success', editingGrade ? 'Grado actualizado' : 'Grado creado');
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
    const id = getInstitutionId();
    if (!id) return;
    setDeleteLoading(true);
    try {
      await gradesService.delete(id, deleteTarget.id);
      setDeleteTarget(null);
      addToast('success', 'Grado eliminado');
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
    { key: 'name', header: 'Nombre', render: (g: Grade) => <span className="text-[14px] font-medium text-secondary-900">{g.name}</span> },
    { key: 'ageRange', header: 'Rango de edad', render: (g: Grade) => <span className="text-[14px] text-secondary-600">{g.ageRangeMin} - {g.ageRangeMax} años</span> },
    { key: 'sections', header: 'Secciones', className: 'w-[100px]', render: (g: Grade) => <span className="text-[14px] text-secondary-600">{g._count?.sections ?? 0}</span> },
    { key: 'actions', header: 'Acciones', className: 'w-[130px]', render: (g: Grade) => (
      <div className="flex items-center gap-[4px]">
        <button onClick={() => setViewingGrade(g)} className="btn btn-2xs btn-ghost" title="Ver detalle"><span className="material-symbols-outlined text-[16px]">visibility</span></button>
        <button onClick={() => handleEdit(g)} className="btn btn-2xs btn-ghost" title="Editar"><span className="material-symbols-outlined text-[16px]">edit</span></button>
        <button onClick={() => setDeleteTarget(g)} className="btn btn-2xs btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600" title="Eliminar"><span className="material-symbols-outlined text-[16px]">delete</span></button>
      </div>
    )},
  ];

  if (!institutionId) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Grados</h1><p className="page-subtitle">Gestión de grados académicos</p></div>
        <div className="card"><div className="empty-state"><p className="empty-state-title">Sin institución asignada</p><p className="empty-state-description">No tienes una institución asignada. Contacta al administrador.</p></div></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Grados</h1><p className="page-subtitle">Gestión de grados académicos</p></div>
        <Button onClick={handleCreate} size="sm" className="hidden md:inline-flex"><span className="material-symbols-outlined text-[18px] mr-[4px]">add</span>Crear Grado</Button>
      </div>

      <div className="mb-[16px]">
        <div className="flex items-center gap-[8px] max-w-[360px]">
          <span className="material-symbols-outlined text-[18px] text-secondary-400">search</span>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Buscar por nombre..."
            className="input"
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="btn btn-2xs btn-ghost text-secondary-400"
              title="Limpiar filtro"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
          {filterText && (
            <span className="text-[13px] text-secondary-500">
              {filteredGrades.length} resultado{filteredGrades.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <Table<Grade>
        columns={columns}
        data={filteredGrades}
        keyExtractor={(g) => g.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch(page)}
        emptyMessage={filterText ? 'No hay grados que coincidan con el filtro.' : 'No hay grados registrados.'}
      />

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        totalItems={hasNextPage ? (page + 1) * PAGE_SIZE + 1 : page * PAGE_SIZE + filteredGrades.length}
        totalPages={hasNextPage ? page + 2 : page + 1}
        onPageChange={handlePageChange}
      />

      {showForm && <GradeForm onSubmit={handleFormSubmit} onCancel={() => { setShowForm(false); setEditingGrade(null); }} isLoading={formLoading} grade={editingGrade} />}

      <ConfirmDialog isOpen={!!deleteTarget} title="Eliminar Grado" message={`¿Eliminar "${deleteTarget?.name}"?`} confirmLabel="Eliminar" onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} isLoading={deleteLoading} />

      {viewingGrade && (
        <Modal>
          <div className="modal-content max-w-[480px] w-full">
            <div className="modal-header">
              <h2 className="modal-title">{viewingGrade.name}</h2>
              <button type="button" onClick={() => setViewingGrade(null)} className="text-secondary-600 hover:text-secondary-900 cursor-pointer">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="modal-body flex flex-col gap-[20px]">
              <div className="flex gap-[24px]">
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Edad mínima</p>
                  <p className="text-[14px] text-secondary-900">{viewingGrade.ageRangeMin} años</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Edad máxima</p>
                  <p className="text-[14px] text-secondary-900">{viewingGrade.ageRangeMax} años</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Secciones</p>
                <p className="text-[14px] text-secondary-700">{viewingGrade._count?.sections ?? 0}</p>
              </div>
              <div className="flex gap-[24px]">
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Creado</p>
                  <p className="text-[13px] text-secondary-700">{formatDate(viewingGrade.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Actualizado</p>
                  <p className="text-[13px] text-secondary-700">{formatDate(viewingGrade.updatedAt)}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setViewingGrade(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
