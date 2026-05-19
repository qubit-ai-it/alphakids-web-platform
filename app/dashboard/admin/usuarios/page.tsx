'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Button } from '@/shared/components/ui/Button';
import { UserForm } from '@/features/admin/components/UserForm';
import { usersService } from '@/features/admin/services/users.service';
import type { User } from '@/shared/lib/types';

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const initialized = useRef(false);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    usersService
      .getAll()
      .then((data) => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Error al cargar usuarios');
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    refetch();
  }, [refetch]);

  const handleCreate = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    setFormLoading(true);
    try {
      if (editingUser) {
        await usersService.update(editingUser.id, {
          name: data.name as string | undefined,
          roles: data.roles as string[] | undefined,
        });
      } else {
        await usersService.create({
          email: data.email as string,
          password: data.password as string,
          name: data.name as string | undefined,
          roles: data.roles as string[] | undefined,
        });
      }
      setShowForm(false);
      setEditingUser(null);
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
      await usersService.delete(deleteTarget.id);
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
      key: 'email',
      header: 'Correo',
      render: (user: User) => (
        <span className="text-[14px] font-medium text-secondary-900">{user.email}</span>
      ),
    },
    {
      key: 'name',
      header: 'Nombre',
      render: (user: User) => (
        <span className="text-[14px] text-secondary-700">{user.name || '-'}</span>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (user: User) => (
        <div className="flex flex-wrap gap-[4px]">
          {user.roles.length > 0 ? (
            user.roles.map((ur) => (
              <Badge key={ur.role.id} role={ur.role.name} />
            ))
          ) : (
            <span className="text-[12px] text-secondary-400">Sin roles</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-[120px]',
      render: (user: User) => (
        <div className="flex items-center gap-[4px]">
          <button
            onClick={() => handleEdit(user)}
            className="btn btn-xs btn-ghost"
            title="Editar"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button
            onClick={() => setDeleteTarget(user)}
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
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">Gestión de usuarios de la plataforma</p>
        </div>
        <Button onClick={handleCreate} size="sm">
          <span className="material-symbols-outlined text-[18px] mr-[4px]">add</span>
          Crear Usuario
        </Button>
      </div>

      <Table<User>
        columns={columns}
        data={users}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage="No hay usuarios registrados. Crea el primero usando el botón superior."
      />

      {showForm && (
        <UserForm
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
          isLoading={formLoading}
          user={editingUser}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Eliminar Usuario"
        message={`¿Estás seguro de eliminar a "${deleteTarget?.name ?? deleteTarget?.email}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteLoading}
      />
    </div>
  );
}
