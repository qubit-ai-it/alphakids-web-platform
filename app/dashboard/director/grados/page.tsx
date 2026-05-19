'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { GradeForm } from '@/features/director/components/GradeForm';
import { gradesService } from '@/features/director/services/grades.service';
import { getInstitutionId } from '@/shared/lib/jwt';
import type { Grade } from '@/shared/lib/types';

export default function DirectorGradosPage() {
  const institutionId = getInstitutionId();

  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Grade | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const initialized = useRef(false);

  const refetch = useCallback(() => {
    if (!institutionId) {
      setError('No tienes una institución asignada');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    gradesService
      .getAll(institutionId)
      .then((data) => {
        setGrades(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Error al cargar grados');
        setIsLoading(false);
      });
  }, [institutionId]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    refetch();
  }, [refetch]);

  const handleCreate = () => {
    setEditingGrade(null);
    setShowForm(true);
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    if (!institutionId) return;
    setFormLoading(true);
    try {
      if (editingGrade) {
        await gradesService.update(institutionId, editingGrade.id, {
          name: data.name as string,
          ageRangeMin: data.ageRangeMin as number,
          ageRangeMax: data.ageRangeMax as number,
        });
      } else {
        await gradesService.create(institutionId, {
          name: data.name as string,
          ageRangeMin: data.ageRangeMin as number,
          ageRangeMax: data.ageRangeMax as number,
        });
      }
      setShowForm(false);
      setEditingGrade(null);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !institutionId) return;
    setDeleteLoading(true);
    try {
      await gradesService.delete(institutionId, deleteTarget.id);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      render: (g: Grade) => (
        <span className="text-[14px] font-medium text-secondary-900">{g.name}</span>
      ),
    },
    {
      key: 'ageRange',
      header: 'Rango de edad',
      render: (g: Grade) => (
        <span className="text-[14px] text-secondary-600">
          {g.ageRangeMin} - {g.ageRangeMax} años
        </span>
      ),
    },
    {
      key: 'sections',
      header: 'Secciones',
      className: 'w-[100px]',
      render: (g: Grade) => (
        <span className="text-[14px] text-secondary-600">
          {g._count?.sections ?? 0}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-[100px]',
      render: (g: Grade) => (
        <div className="flex items-center gap-[4px]">
          <button
            onClick={() => handleEdit(g)}
            className="btn btn-xs btn-ghost"
            title="Editar"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button
            onClick={() => setDeleteTarget(g)}
            className="btn btn-xs btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600"
            title="Eliminar"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      ),
    },
  ];

  if (!institutionId) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Grados</h1>
          <p className="page-subtitle">Gestión de grados académicos</p>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="material-symbols-outlined text-[48px] text-secondary-400">school</span>
            </div>
            <p className="empty-state-title">Sin institución asignada</p>
            <p className="empty-state-description">
              No tienes una institución asignada. Contacta al administrador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Grados</h1>
          <p className="page-subtitle">Gestión de grados académicos</p>
        </div>
        <Button onClick={handleCreate} size="sm">
          <span className="material-symbols-outlined text-[18px] mr-[4px]">add</span>
          Crear Grado
        </Button>
      </div>

      <Table<Grade>
        columns={columns}
        data={grades}
        keyExtractor={(g) => g.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage="No hay grados registrados. Crea el primero usando el botón superior."
      />

      {showForm && (
        <GradeForm
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingGrade(null);
          }}
          isLoading={formLoading}
          grade={editingGrade}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Eliminar Grado"
        message={`¿Estás seguro de eliminar "${deleteTarget?.name}"? Se eliminarán también todas sus secciones.`}
        confirmLabel="Eliminar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteLoading}
      />
    </div>
  );
}
