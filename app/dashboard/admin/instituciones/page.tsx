'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { InstitutionForm } from '@/features/admin/components/InstitutionForm';
import type { InstitutionFormData } from '@/features/admin/components/InstitutionForm';
import { institutionsService } from '@/features/admin/services/institutions.service';
import { resizeImage } from '@/shared/lib/image';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/errors';
import { useSetMobileAction } from '@/shared/contexts/MobileActionContext';
import type { Institution } from '@/shared/lib/types';

export default function AdminInstitucionesPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Institution | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [viewingInstitution, setViewingInstitution] = useState<Institution | null>(null);

  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const initialized = useRef(false);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    institutionsService
      .getAll()
      .then((data) => {
        setInstitutions(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Error al cargar instituciones');
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    refetch();
  }, [refetch]);

  const filteredInstitutions = institutions.filter((inst) => {
    const matchesText =
      !filterText ||
      inst.name.toLowerCase().includes(filterText.toLowerCase()) ||
      inst.slug.toLowerCase().includes(filterText.toLowerCase()) ||
      inst.ruc.toLowerCase().includes(filterText.toLowerCase()) ||
      (inst.address ?? '').toLowerCase().includes(filterText.toLowerCase());
    const matchesStatus =
      !filterStatus || (filterStatus === 'active' ? inst.isActive : !inst.isActive);
    return matchesText && matchesStatus;
  });

  const handleCreate = () => {
    setEditingInstitution(null);
    setShowForm(true);
  };

  const setMobileAction = useSetMobileAction(null);
  useEffect(() => {
    setMobileAction({ label: 'Crear Institución', icon: 'add', onClick: handleCreate });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEdit = (inst: Institution) => {
    setEditingInstitution(inst);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: InstitutionFormData, logoFile?: File) => {
    setFormLoading(true);
    try {
      let logoUrl: string | undefined;
      if (logoFile) {
        logoUrl = await resizeImage(logoFile);
      }

      if (editingInstitution) {
        await institutionsService.update(editingInstitution.id, {
          name: data.name,
          slug: data.slug,
          ruc: data.ruc,
          address: data.address,
          phone: data.phone || undefined,
          logoUrl: logoUrl ?? undefined,
          isActive: data.isActive,
        });
      } else {
        await institutionsService.create({
          name: data.name,
          slug: data.slug,
          ruc: data.ruc,
          address: data.address,
          phone: data.phone || undefined,
          logoUrl: logoUrl,
          isActive: data.isActive,
        });
      }
      setShowForm(false);
      setEditingInstitution(null);
      addToast('success', editingInstitution ? 'Institución actualizada' : 'Institución creada');
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
      await institutionsService.delete(deleteTarget.id);
      setDeleteTarget(null);
      addToast('success', 'Institución eliminada');
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
    {
      key: 'name',
      header: 'Nombre',
      render: (inst: Institution) => (
        <span className="text-[14px] font-medium text-secondary-900">{inst.name}</span>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (inst: Institution) => (
        <span className="text-[13px] text-secondary-600 font-mono">{inst.slug}</span>
      ),
    },
    {
      key: 'ruc',
      header: 'RUC',
      render: (inst: Institution) => (
        <span className="text-[13px] text-secondary-600">{inst.ruc}</span>
      ),
    },
    {
      key: 'isActive',
      header: 'Estado',
      className: 'w-[100px]',
      render: (inst: Institution) => (
        <Badge variant={inst.isActive ? 'success' : 'error'}>
          {inst.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-[130px]',
      render: (inst: Institution) => (
        <div className="flex items-center gap-[4px]">
          <button
            onClick={() => setViewingInstitution(inst)}
            className="btn btn-2xs btn-ghost"
            title="Ver detalle"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
          </button>
          <button
            onClick={() => handleEdit(inst)}
            className="btn btn-2xs btn-ghost"
            title="Editar"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button
            onClick={() => setDeleteTarget(inst)}
            className="btn btn-2xs btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600"
            title="Eliminar"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Instituciones</h1>
          <p className="page-subtitle">Gestión de instituciones educativas</p>
        </div>
        <Button onClick={handleCreate} size="sm" className="hidden md:inline-flex">
          <span className="material-symbols-outlined text-[18px] mr-[4px]">add</span>
          Crear Institución
        </Button>
      </div>

      <div className="mb-[16px] flex items-center gap-[12px] flex-wrap">
        <div className="flex items-center gap-[8px] max-w-[360px] flex-1">
          <span className="material-symbols-outlined text-[18px] text-secondary-400">search</span>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Buscar por nombre, slug, RUC o dirección..."
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
            {filteredInstitutions.length} resultado{filteredInstitutions.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <Table<Institution>
        columns={columns}
        data={filteredInstitutions}
        keyExtractor={(i) => i.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={
          filterText || filterStatus
            ? 'No hay instituciones que coincidan con los filtros.'
            : 'No hay instituciones registradas. Crea la primera usando el botón superior.'
        }
        pageSize={10}
      />

      {showForm && (
        <InstitutionForm
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingInstitution(null);
          }}
          isLoading={formLoading}
          initialData={editingInstitution ?? undefined}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Eliminar Institución"
        message={`¿Estás seguro de eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteLoading}
      />

      {viewingInstitution && (
        <Modal>
          <div className="modal-content max-w-[480px] w-full">
            <div className="modal-header">
              <h2 className="modal-title">{viewingInstitution.name}</h2>
              <button
                type="button"
                onClick={() => setViewingInstitution(null)}
                className="text-secondary-600 hover:text-secondary-900 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="modal-body flex flex-col gap-[20px]">
              {viewingInstitution.logoUrl && (
                <div className="flex justify-center">
                  <img
                    src={viewingInstitution.logoUrl}
                    alt={`Logo de ${viewingInstitution.name}`}
                    className="w-[120px] h-[120px] rounded-[16px] object-cover border border-secondary-200"
                  />
                </div>
              )}
              <div className="flex flex-col gap-[12px]">
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Slug</p>
                  <p className="text-[14px] text-secondary-900 font-mono">{viewingInstitution.slug}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">RUC</p>
                  <p className="text-[14px] text-secondary-900">{viewingInstitution.ruc}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Dirección</p>
                  <p className="text-[14px] text-secondary-900">{viewingInstitution.address}</p>
                </div>
                {viewingInstitution.phone && (
                  <div>
                    <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Teléfono</p>
                    <p className="text-[14px] text-secondary-900">{viewingInstitution.phone}</p>
                  </div>
                )}
                <div className="flex gap-[24px]">
                  <div>
                    <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Estado</p>
                    <Badge variant={viewingInstitution.isActive ? 'success' : 'error'}>
                      {viewingInstitution.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">ID</p>
                    <p className="text-[12px] text-secondary-600 font-mono">{viewingInstitution.id}</p>
                  </div>
                </div>
                <div className="flex gap-[24px]">
                  <div>
                    <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Creado</p>
                    <p className="text-[13px] text-secondary-700">{formatDate(viewingInstitution.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Actualizado</p>
                    <p className="text-[13px] text-secondary-700">{formatDate(viewingInstitution.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setViewingInstitution(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
