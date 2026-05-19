'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { StudentForm } from '@/features/docente/components/StudentForm';
import { studentsService } from '@/features/docente/services/students.service';
import type { Student } from '@/shared/lib/types';

const genderLabels: Record<string, string> = {
  MALE: 'M',
  FEMALE: 'F',
  OTHER: 'Otro',
};

export default function DocenteAlumnosPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const initialized = useRef(false);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    studentsService
      .getAll()
      .then((data) => {
        setStudents(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Error al cargar alumnos');
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    refetch();
  }, [refetch]);

  const handleCreate = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    setFormLoading(true);
    try {
      const input = {
        firstName: data.firstName as string,
        lastName: data.lastName as string,
        birthDate: (data.birthDate as string) || undefined,
        gender: (data.gender as string) || undefined,
        avatarUrl: (data.avatarUrl as string) || undefined,
      };

      if (editingStudent) {
        await studentsService.update(editingStudent.id, input);
      } else {
        await studentsService.create(input);
      }
      setShowForm(false);
      setEditingStudent(null);
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
      await studentsService.delete(deleteTarget.id);
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
      render: (s: Student) => (
        <span className="text-[14px] font-medium text-secondary-900">
          {s.firstName} {s.lastName}
        </span>
      ),
    },
    {
      key: 'gender',
      header: 'Género',
      className: 'w-[80px]',
      render: (s: Student) => (
        <span className="text-[13px] text-secondary-600">
          {s.gender ? genderLabels[s.gender] ?? s.gender : '-'}
        </span>
      ),
    },
    {
      key: 'birthDate',
      header: 'Nacimiento',
      render: (s: Student) => (
        <span className="text-[13px] text-secondary-600">
          {s.birthDate ? new Date(s.birthDate).toLocaleDateString('es-PE') : '-'}
        </span>
      ),
    },
    {
      key: 'section',
      header: 'Sección',
      render: (s: Student) => (
        <span className="text-[13px] text-secondary-600">
          {s.section?.name ?? '-'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Estado',
      className: 'w-[90px]',
      render: (s: Student) => (
        <Badge variant={s.isActive ? 'success' : 'error'}>
          {s.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-[100px]',
      render: (s: Student) => (
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

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Alumnos</h1>
          <p className="page-subtitle">Gestión de alumnos del aula</p>
        </div>
        <Button onClick={handleCreate} size="sm">
          <span className="material-symbols-outlined text-[18px] mr-[4px]">add</span>
          Crear Alumno
        </Button>
      </div>

      <Table<Student>
        columns={columns}
        data={students}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage="No hay alumnos registrados. Crea el primero usando el botón superior."
      />

      {showForm && (
        <StudentForm
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingStudent(null);
          }}
          isLoading={formLoading}
          student={editingStudent}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Eliminar Alumno"
        message={`¿Estás seguro de eliminar a "${deleteTarget?.firstName} ${deleteTarget?.lastName}"?`}
        confirmLabel="Eliminar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteLoading}
      />
    </div>
  );
}
