'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { WordAssignmentForm } from '@/features/docente/components/WordAssignmentForm';
import { wordAssignmentsService } from '@/features/docente/services/word-assignments.service';
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
  const [filterStatus, setFilterStatus] = useState<string>('');

  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<WordAssignment | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<WordAssignment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const initialized = useRef(false);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    wordAssignmentsService
      .getAll()
      .then((data) => {
        setAssignments(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Error al cargar asignaciones');
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    refetch();
  }, [refetch]);

  const filteredAssignments = filterStatus
    ? assignments.filter((a) => a.status === filterStatus)
    : assignments;

  const handleCreate = () => {
    setEditingAssignment(null);
    setShowForm(true);
  };

  const handleEdit = (assignment: WordAssignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

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
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
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
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'student',
      header: 'Alumno',
      render: (a: WordAssignment) => (
        <span className="text-[14px] font-medium text-secondary-900">
          {a.student ? `${a.student.firstName} ${a.student.lastName}` : '-'}
        </span>
      ),
    },
    {
      key: 'word',
      header: 'Palabra',
      render: (a: WordAssignment) => (
        <span className="text-[14px] text-secondary-700">
          {a.word?.text ?? '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'w-[110px]',
      render: (a: WordAssignment) => (
        <span className={statusBadgeClass[a.status] ?? 'badge-secondary'}>
          {statusLabels[a.status] ?? a.status}
        </span>
      ),
    },
    {
      key: 'scheduled',
      header: 'Programado',
      render: (a: WordAssignment) => (
        <span className="text-[13px] text-secondary-600">
          {a.scheduledAt ? new Date(a.scheduledAt).toLocaleDateString('es-PE') : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-[100px]',
      render: (a: WordAssignment) => (
        <div className="flex items-center gap-[4px]">
          <button
            onClick={() => handleEdit(a)}
            className="btn btn-xs btn-ghost"
            title="Editar estado"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button
            onClick={() => setDeleteTarget(a)}
            className="btn btn-xs btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600"
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
          <h1 className="page-title">Asignaciones</h1>
          <p className="page-subtitle">Gestión de palabras asignadas a alumnos</p>
        </div>
        <Button onClick={handleCreate} size="sm">
          <span className="material-symbols-outlined text-[18px] mr-[4px]">add</span>
          Nueva Asignación
        </Button>
      </div>

      <div className="mb-[16px]">
        <div className="flex items-center gap-[12px]">
          <label className="text-[14px] font-medium text-secondary-700">Filtrar por estado:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input max-w-[200px]"
          >
            <option value="">Todos</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {filterStatus && (
            <span className="text-[13px] text-secondary-500">
              {filteredAssignments.length} asignación{filteredAssignments.length !== 1 ? 'es' : ''}
            </span>
          )}
        </div>
      </div>

      <Table<WordAssignment>
        columns={columns}
        data={filteredAssignments}
        keyExtractor={(a) => a.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={filterStatus
          ? `No hay asignaciones con estado "${statusLabels[filterStatus as WordAssignmentStatus] ?? filterStatus}"`
          : 'No hay asignaciones. Crea la primera usando el botón superior.'}
      />

      {showForm && (
        <WordAssignmentForm
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingAssignment(null);
          }}
          isLoading={formLoading}
          assignment={editingAssignment}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Eliminar Asignación"
        message={`¿Estás seguro de eliminar esta asignación?`}
        confirmLabel="Eliminar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteLoading}
      />
    </div>
  );
}
