'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { UserForm } from '@/features/admin/components/UserForm';
import { usersService } from '@/features/admin/services/users.service';
import { institutionsService } from '@/features/admin/services/institutions.service';
import { membersService } from '@/features/admin/services/members.service';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/errors';
import { useSetMobileAction } from '@/shared/contexts/MobileActionContext';
import type { User, InstitutionMember } from '@/shared/lib/types';

interface UserRow extends User {
  institutionName?: string;
  member?: InstitutionMember | null;
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingInstitution, setEditingInstitution] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editingMember, setEditingMember] = useState<InstitutionMember | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [viewingUser, setViewingUser] = useState<UserRow | null>(null);

  const [filterText, setFilterText] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const initialized = useRef(false);

  const fetchUsersWithInstitutions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, institutions] = await Promise.all([
        usersService.getAll(),
        institutionsService.getAll(),
      ]);

      const membersPromises = institutions.map((inst) =>
        membersService.getAll(inst.id).catch(() => [] as InstitutionMember[]),
      );
      const allMemberships = (await Promise.all(membersPromises)).flat();

      const institutionMap = new Map(
        institutions.map((i) => [i.id, i.name]),
      );

      const enriched: UserRow[] = usersData.map((u) => {
        const membership = allMemberships.find((m) => m.userId === u.id);
        return {
          ...u,
          institutionName: membership
            ? institutionMap.get(membership.institutionId)
            : undefined,
          member: membership ?? null,
        };
      });

      setUsers(enriched);
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      setError(title ? `${title}: ${message}` : 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    fetchUsersWithInstitutions();
  }, [fetchUsersWithInstitutions]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchUsersWithInstitutions();
  }, [fetchUsersWithInstitutions]);

  const filteredUsers = users.filter((u) => {
    const matchesText =
      !filterText ||
      u.email.toLowerCase().includes(filterText.toLowerCase()) ||
      (u.name ?? '').toLowerCase().includes(filterText.toLowerCase()) ||
      (u.institutionName ?? '').toLowerCase().includes(filterText.toLowerCase());
    const matchesRole =
      !filterRole ||
      u.roles.some((r) => r.role.name === filterRole);
    return matchesText && matchesRole;
  });

  const handleCreate = () => {
    setEditingUser(null);
    setEditingInstitution(null);
    setEditingMember(null);
    setShowForm(true);
  };

  const setMobileAction = useSetMobileAction(null);
  useEffect(() => {
    setMobileAction({ label: 'Crear Usuario', icon: 'add', onClick: handleCreate });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEdit = (userRow: UserRow) => {
    const { institutionName, member, ...user } = userRow;
    setEditingUser(user);
    setEditingInstitution(
      institutionName && member
        ? { id: member.institutionId, name: institutionName }
        : null,
    );
    setEditingMember(member ?? null);
    setShowForm(true);
  };

  const handleCreateSubmit = async (data: {
    email: string;
    password: string;
    name?: string;
    roles: string[];
    institutionId?: string;
  }) => {
    setFormLoading(true);
    try {
      const newUser = await usersService.create({
        email: data.email,
        password: data.password,
        name: data.name,
        roles: data.roles,
      });

      if (data.institutionId && data.roles.length > 0) {
        const roleName = data.roles[0];
        const role = newUser.roles.find((r) => r.role.name === roleName);
        if (role) {
          await membersService.create(data.institutionId, {
            userId: newUser.id,
            roleId: role.role.id,
          });
        }
      }

      setShowForm(false);
      addToast('success', 'Usuario creado');
      refetch();
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      addToast('error', title, message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (data: {
    name?: string;
    roles: string[];
    institutionId?: string;
  }) => {
    if (!editingUser) return;
    setFormLoading(true);
    try {
      await usersService.update(editingUser.id, {
        name: data.name,
        roles: data.roles,
      });

      const isDirectorOrTeacher = data.roles.some((r) =>
        ['director', 'teacher'].includes(r),
      );

      if (isDirectorOrTeacher) {
        if (data.institutionId) {
          if (editingMember) {
            if (editingMember.institutionId !== data.institutionId) {
              await membersService.delete(
                editingMember.institutionId,
                editingMember.id,
              );
              const updatedUser = await usersService.getById(editingUser.id);
              const role = updatedUser.roles.find((r) =>
                ['director', 'teacher'].includes(r.role.name),
              );
              if (role) {
                await membersService.create(data.institutionId, {
                  userId: editingUser.id,
                  roleId: role.role.id,
                });
              }
            }
          } else {
            const updatedUser = await usersService.getById(editingUser.id);
            const role = updatedUser.roles.find((r) =>
              ['director', 'teacher'].includes(r.role.name),
            );
            if (role) {
              await membersService.create(data.institutionId, {
                userId: editingUser.id,
                roleId: role.role.id,
              });
            }
          }
        } else if (editingMember) {
          await membersService.delete(
            editingMember.institutionId,
            editingMember.id,
          );
        }
      } else if (editingMember) {
        await membersService.delete(
          editingMember.institutionId,
          editingMember.id,
        );
      }

      setShowForm(false);
      setEditingUser(null);
      setEditingInstitution(null);
      setEditingMember(null);
      addToast('success', 'Usuario actualizado');
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
      await usersService.delete(deleteTarget.id);
      setDeleteTarget(null);
      addToast('success', 'Usuario eliminado');
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
      key: 'email',
      header: 'Correo',
      render: (u: UserRow) => (
        <span className="text-[14px] font-medium text-secondary-900">{u.email}</span>
      ),
    },
    {
      key: 'name',
      header: 'Nombre',
      render: (u: UserRow) => (
        <span className="text-[14px] text-secondary-700">{u.name || '-'}</span>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (u: UserRow) => (
        <div className="flex flex-wrap gap-[4px]">
          {u.roles.length > 0 ? (
            u.roles.map((ur) => (
              <Badge key={ur.role.id} role={ur.role.name} />
            ))
          ) : (
            <span className="text-[12px] text-secondary-400">Sin roles</span>
          )}
        </div>
      ),
    },
    {
      key: 'institution',
      header: 'Institución',
      render: (u: UserRow) => (
        <span className="text-[13px] text-secondary-600">
          {u.institutionName || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-[130px]',
      render: (u: UserRow) => (
        <div className="flex items-center gap-[4px]">
          <button
            onClick={() => setViewingUser(u)}
            className="btn btn-2xs btn-ghost"
            title="Ver detalle"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
          </button>
          <button
            onClick={() => handleEdit(u)}
            className="btn btn-2xs btn-ghost"
            title="Editar"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button
            onClick={() => setDeleteTarget(u)}
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
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">Gestión de usuarios de la plataforma</p>
        </div>
        <Button onClick={handleCreate} size="sm" className="hidden md:inline-flex">
          <span className="material-symbols-outlined text-[18px] mr-[4px]">add</span>
          Crear Usuario
        </Button>
      </div>

      <div className="mb-[16px] flex items-center gap-[12px] flex-wrap">
        <div className="flex items-center gap-[8px] flex-1 max-w-[360px]">
          <span className="material-symbols-outlined text-[18px] text-secondary-400">search</span>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Buscar por nombre, correo o institución..."
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
        </div>
        <div className="flex items-center gap-[8px]">
          <label className="text-[13px] font-medium text-secondary-600">Rol:</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="input max-w-[160px]"
          >
            <option value="">Todos</option>
            <option value="admin">Admin</option>
            <option value="director">Director</option>
            <option value="teacher">Docente</option>
            <option value="parent">Apoderado</option>
          </select>
          {filterRole && (
            <button
              onClick={() => setFilterRole('')}
              className="btn btn-2xs btn-ghost text-secondary-400"
              title="Limpiar filtro"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
        {(filterText || filterRole) && (
          <span className="text-[13px] text-secondary-500">
            {filteredUsers.length} resultado{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <Table<UserRow>
        columns={columns}
        data={filteredUsers}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={
          filterText || filterRole
            ? 'No hay usuarios que coincidan con los filtros.'
            : 'No hay usuarios registrados. Crea el primero usando el botón superior.'
        }
        pageSize={10}
      />

      {showForm && editingUser ? (
        <UserForm
          onSubmitEdit={handleEditSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingUser(null);
            setEditingInstitution(null);
            setEditingMember(null);
          }}
          isLoading={formLoading}
          user={editingUser}
          currentInstitution={
            editingInstitution ?? null
          }
          currentMember={editingMember}
        />
      ) : showForm ? (
        <UserForm
          onSubmitCreate={handleCreateSubmit}
          onCancel={() => {
            setShowForm(false);
          }}
          isLoading={formLoading}
        />
      ) : null}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Eliminar Usuario"
        message={`¿Estás seguro de eliminar a "${deleteTarget?.name ?? deleteTarget?.email}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteLoading}
      />

      {viewingUser && (
        <Modal>
          <div className="modal-content max-w-[480px] w-full">
            <div className="modal-header">
              <h2 className="modal-title">{viewingUser.name || viewingUser.email}</h2>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="text-secondary-600 hover:text-secondary-900 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="modal-body flex flex-col gap-[20px]">
              <div>
                <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Correo</p>
                <p className="text-[14px] text-secondary-900">{viewingUser.email}</p>
              </div>
              {viewingUser.name && (
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Nombre</p>
                  <p className="text-[14px] text-secondary-900">{viewingUser.name}</p>
                </div>
              )}
              <div>
                <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Roles</p>
                <div className="flex flex-wrap gap-[4px]">
                  {viewingUser.roles.length > 0 ? (
                    viewingUser.roles.map((ur) => (
                      <Badge key={ur.role.id} role={ur.role.name} />
                    ))
                  ) : (
                    <span className="text-[13px] text-secondary-400">Sin roles</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Institución</p>
                <p className="text-[14px] text-secondary-700">{viewingUser.institutionName || '-'}</p>
              </div>
              <div className="flex gap-[24px]">
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Creado</p>
                  <p className="text-[13px] text-secondary-700">{formatDate(viewingUser.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Actualizado</p>
                  <p className="text-[13px] text-secondary-700">{formatDate(viewingUser.updatedAt)}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setViewingUser(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
