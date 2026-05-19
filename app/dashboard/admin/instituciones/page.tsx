'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { InstitutionForm } from '@/features/admin/components/InstitutionForm';
import { institutionsService } from '@/features/admin/services/institutions.service';
import type { Institution } from '@/shared/lib/types';

export default function AdminInstitucionesPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

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

  const handleCreate = () => {
    setShowForm(true);
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    setFormLoading(true);
    try {
      await institutionsService.create({
        name: data.name as string,
        slug: data.slug as string,
        ruc: data.ruc as string,
        address: data.address as string,
        phone: (data.phone as string) || undefined,
        logoUrl: (data.logoUrl as string) || undefined,
        isActive: data.isActive as boolean | undefined,
      });
      setShowForm(false);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear institución');
    } finally {
      setFormLoading(false);
    }
  };

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
      className: 'w-[120px]',
      render: () => (
        <div className="flex items-center gap-[4px]">
          <button
            disabled
            className="btn btn-xs btn-ghost"
            title="Editar - No disponible (requiere fix UUID en backend)"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button
            disabled
            className="btn btn-xs btn-ghost"
            title="Eliminar - No disponible (requiere fix UUID en backend)"
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
        <Button onClick={handleCreate} size="sm">
          <span className="material-symbols-outlined text-[18px] mr-[4px]">add</span>
          Crear Institución
        </Button>
      </div>

      <div className="mb-[16px]">
        <div className="bg-yellow-50 border border-yellow-200 rounded-[10px] p-[12px] text-[13px] text-yellow-800">
          <span className="material-symbols-outlined text-[16px] align-middle mr-[6px]">info</span>
          Las acciones de editar y eliminar instituciones estarán disponibles una vez que se corrija
          el validador UUID en el backend (los IDs actuales usan formato cuid).
        </div>
      </div>

      <Table<Institution>
        columns={columns}
        data={institutions}
        keyExtractor={(i) => i.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage="No hay instituciones registradas. Crea la primera usando el botón superior."
      />

      {showForm && (
        <InstitutionForm
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          isLoading={formLoading}
        />
      )}
    </div>
  );
}
