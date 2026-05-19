'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { SectionForm } from '@/features/director/components/SectionForm';
import { sectionsService } from '@/features/director/services/sections.service';
import { gradesService } from '@/features/director/services/grades.service';
import { getInstitutionId } from '@/shared/lib/jwt';
import type { Section, Grade } from '@/shared/lib/types';

export default function DirectorSeccionesPage() {
  const institutionId = getInstitutionId();

  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const initialized = useRef(false);

  const fetchSections = useCallback((gradeId: string) => {
    if (!institutionId) return;
    setIsLoading(true);
    setError(null);
    sectionsService
      .getAll(institutionId, gradeId)
      .then((data) => {
        setSections(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Error al cargar secciones');
        setIsLoading(false);
      });
  }, [institutionId]);

  const refetchGrades = useCallback(() => {
    if (!institutionId) return;
    gradesService
      .getAll(institutionId)
      .then(setGrades)
      .catch(() => {});
  }, [institutionId]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    refetchGrades();
  }, [refetchGrades]);

  const handleGradeChange = (gradeId: string) => {
    setSelectedGradeId(gradeId);
    if (gradeId) {
      fetchSections(gradeId);
    } else {
      setSections([]);
    }
  };

  const handleCreate = () => {
    setEditingSection(null);
    setShowForm(true);
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    if (!institutionId || !selectedGradeId) return;
    setFormLoading(true);
    try {
      if (editingSection) {
        await sectionsService.update(
          institutionId,
          selectedGradeId,
          editingSection.id,
          {
            name: data.name as string,
            capacity: data.capacity as number,
          },
        );
      } else {
        await sectionsService.create(institutionId, selectedGradeId, {
          name: data.name as string,
          capacity: data.capacity as number,
        });
      }
      setShowForm(false);
      setEditingSection(null);
      fetchSections(selectedGradeId);
      refetchGrades();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !institutionId || !selectedGradeId) return;
    setDeleteLoading(true);
    try {
      await sectionsService.delete(
        institutionId,
        selectedGradeId,
        deleteTarget.id,
      );
      setDeleteTarget(null);
      fetchSections(selectedGradeId);
      refetchGrades();
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
      render: (s: Section) => (
        <span className="text-[14px] font-medium text-secondary-900">{s.name}</span>
      ),
    },
    {
      key: 'grade',
      header: 'Grado',
      render: (s: Section) => (
        <span className="text-[13px] text-secondary-600">
          {s.grade?.name ?? '-'}
        </span>
      ),
    },
    {
      key: 'capacity',
      header: 'Capacidad',
      className: 'w-[100px]',
      render: (s: Section) => (
        <span className="text-[14px] text-secondary-600">
          {s.capacity} alumnos
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-[100px]',
      render: (s: Section) => (
        <div className="flex items-center gap-[4px]">
          <button
            onClick={() => handleEdit(s)}
            className="btn btn-xs btn-ghost"
            title="Editar"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button
            onClick={() => setDeleteTarget(s)}
            className="btn btn-xs btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600"
            title="Eliminar"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      ),
    },
  ];

  const selectedGrade = grades.find((g) => g.id === selectedGradeId);

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Secciones</h1>
          <p className="page-subtitle">Gestión de secciones por grado</p>
        </div>
        <Button
          onClick={handleCreate}
          size="sm"
          disabled={!selectedGradeId}
        >
          <span className="material-symbols-outlined text-[18px] mr-[4px]">add</span>
          Crear Sección
        </Button>
      </div>

      <div className="mb-[16px]">
        <div className="flex items-center gap-[12px]">
          <label className="text-[14px] font-medium text-secondary-700">Grado:</label>
          <select
            value={selectedGradeId}
            onChange={(e) => handleGradeChange(e.target.value)}
            className="input max-w-[280px]"
          >
            <option value="">Seleccionar grado...</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.ageRangeMin}-{g.ageRangeMax} años)
              </option>
            ))}
          </select>
          {selectedGrade && (
            <span className="text-[13px] text-secondary-500">
              {selectedGrade._count?.sections ?? 0} secciones
            </span>
          )}
        </div>
      </div>

      {!selectedGradeId ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="material-symbols-outlined text-[48px] text-secondary-400">view_column</span>
            </div>
            <p className="empty-state-title">Selecciona un grado</p>
            <p className="empty-state-description">
              Elige un grado del selector para ver y gestionar sus secciones.
            </p>
          </div>
        </div>
      ) : (
        <Table<Section>
          columns={columns}
          data={sections}
          keyExtractor={(s) => s.id}
          isLoading={isLoading}
          error={error}
          onRetry={() => fetchSections(selectedGradeId)}
          emptyMessage="No hay secciones en este grado. Crea la primera usando el botón superior."
        />
      )}

      {showForm && (
        <SectionForm
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingSection(null);
          }}
          isLoading={formLoading}
          section={editingSection}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Eliminar Sección"
        message={`¿Estás seguro de eliminar la sección "${deleteTarget?.name}"?`}
        confirmLabel="Eliminar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteLoading}
      />
    </div>
  );
}
