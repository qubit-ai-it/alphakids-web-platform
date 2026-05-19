'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Modal } from '@/shared/components/ui/Modal';
import { TeacherForm } from '@/features/director/components/TeacherForm';
import { TeacherEditForm } from '@/features/director/components/TeacherEditForm';
import { usersService } from '@/features/admin/services/users.service';
import { membersService } from '@/features/admin/services/members.service';
import { sectionTeachersService } from '@/features/director/services/section-teachers.service';
import { gradesService } from '@/features/director/services/grades.service';
import { sectionsService } from '@/features/director/services/sections.service';
import { getInstitutionId } from '@/shared/lib/jwt';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/errors';
import { useSetMobileAction } from '@/shared/contexts/MobileActionContext';
import type { User, InstitutionMember, Section } from '@/shared/lib/types';

interface TeacherRow extends User {
  member?: InstitutionMember | null;
  sectionName?: string;
  sectionId?: string | null;
  gradeId?: string | null;
}

export default function DirectorDocentesPage() {
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeacherRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherRow | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<TeacherRow | null>(null);
  const [filterText, setFilterText] = useState('');
  const initialized = useRef(false);

  const fetchTeachers = useCallback(async () => {
    const id = getInstitutionId();
    if (!id) return;
    setIsLoading(true); setError(null);
    try {
      const members = await membersService.getAll(id);
      const teacherMembers = members.filter((m) => m.role?.name === 'teacher' && !m.leftAt);
      const userIds = [...new Set(teacherMembers.map((m) => m.userId))];
      if (userIds.length === 0) { setTeachers([]); setIsLoading(false); return; }

      const gradesData = await gradesService.getAll(id);
      const allSections: Section[] = [];
      for (const g of gradesData) {
        try { const s = await sectionsService.getAll(id, g.id); allSections.push(...s.map((sec) => ({ ...sec, gradeId: g.id }))); } catch {}
      }

      const sectionTeacherMap = new Map<string, { sectionName: string; sectionId: string; gradeId: string }>();
      for (const s of allSections) {
        try {
          const assigned = await sectionTeachersService.getAll(id, (s as Section & { gradeId: string }).gradeId, s.id);
          for (const t of assigned) {
            const tAny = t as unknown as Record<string, unknown>;
            const member = tAny.member as Record<string, unknown> | undefined;
            const userId = (member?.userId as string) ?? (member?.user as Record<string, unknown>)?.id as string;
            if (userId) sectionTeacherMap.set(userId, { sectionName: s.name, sectionId: s.id, gradeId: (s as Section & { gradeId: string }).gradeId });
          }
        } catch {}
      }

      const usersArr = await usersService.getAll();
      const usersMap = new Map(usersArr.map((u) => [u.id, u] as [string, User]));
      setTeachers(teacherMembers.map((m) => {
        const u = usersMap.get(m.userId);
        const st = sectionTeacherMap.get(m.userId);
        return {
          ...(u ?? { id: m.userId, email: m.user?.email ?? '', name: m.user?.name ?? null, createdAt: '', updatedAt: '', roles: [] }),
          member: m,
          sectionName: st?.sectionName,
          sectionId: st?.sectionId ?? null,
          gradeId: st?.gradeId ?? null,
        };
      }));
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      setError(title ? `${title}: ${message}` : 'Error al cargar docentes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const id = getInstitutionId();
    setInstitutionId(id ?? null);
    if (id) void Promise.resolve().then(() => fetchTeachers());
  }, [fetchTeachers]);

  const filteredTeachers = filterText
    ? teachers.filter((t) =>
        (t.name ?? '').toLowerCase().includes(filterText.toLowerCase()) ||
        t.email.toLowerCase().includes(filterText.toLowerCase()) ||
        (t.sectionName ?? '').toLowerCase().includes(filterText.toLowerCase())
      )
    : teachers;

  const handleCreate = () => setShowForm(true);

  const setMobileAction = useSetMobileAction(null);
  useEffect(() => {
    setMobileAction({ label: 'Crear Docente', icon: 'add', onClick: handleCreate });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateSubmit = async (data: {
    email: string;
    password: string;
    name?: string;
    institutionId: string;
    gradeId: string;
    sectionId: string;
  }) => {
    setFormLoading(true);
    try {
      const newUser = await usersService.create({
        email: data.email,
        password: data.password,
        name: data.name,
        roles: ['teacher'],
      });
      const roleId = newUser.roles.find((r) => r.role.name === 'teacher')?.role.id;
      if (roleId) await membersService.create(data.institutionId, { userId: newUser.id, roleId });
      await sectionTeachersService.assign(data.institutionId, data.gradeId, data.sectionId, newUser.id);
      setShowForm(false);
      addToast('success', 'Docente creado');
      fetchTeachers();
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      addToast('error', title, message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (data: { gradeId: string; sectionId: string }) => {
    if (!editingTeacher || !institutionId) return;
    setFormLoading(true);
    try {
      const isSameSection =
        editingTeacher.gradeId === data.gradeId &&
        editingTeacher.sectionId === data.sectionId;
      if (!isSameSection) {
        if (editingTeacher.gradeId && editingTeacher.sectionId) {
          try {
            await sectionTeachersService.remove(
              institutionId,
              editingTeacher.gradeId,
              editingTeacher.sectionId,
              editingTeacher.id,
            );
          } catch {}
        }
        try {
          await sectionTeachersService.assign(
            institutionId,
            data.gradeId,
            data.sectionId,
            editingTeacher.id,
          );
        } catch (e) {
          if ((e as Error & { status?: number }).status === 409) {
            addToast('error', 'Conflicto', 'El docente ya está asignado a esta sección.');
            setFormLoading(false);
            return;
          }
          throw e;
        }
      }
      setEditingTeacher(null);
      addToast('success', 'Sección reasignada');
      fetchTeachers();
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      addToast('error', title, message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.member) return;
    setDeleteLoading(true);
    try {
      await membersService.delete(deleteTarget.member.institutionId, deleteTarget.member.id);
      try { await usersService.delete(deleteTarget.id); } catch {}
      setDeleteTarget(null);
      addToast('success', 'Docente eliminado');
      fetchTeachers();
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
    { key: 'name', header: 'Nombre', render: (t: TeacherRow) => <span className="text-[14px] font-medium text-secondary-900">{t.name || '-'}</span> },
    { key: 'email', header: 'Correo', render: (t: TeacherRow) => <span className="text-[13px] text-secondary-600">{t.email}</span> },
    { key: 'section', header: 'Sección', render: (t: TeacherRow) => <span className="text-[13px] text-secondary-600">{t.sectionName || 'Sin asignar'}</span> },
    { key: 'roles', header: 'Roles', render: (t: TeacherRow) => <div className="flex flex-wrap gap-[4px]">{t.roles.length > 0 ? t.roles.map((ur) => <Badge key={ur.role.id} role={ur.role.name} />) : <Badge role="teacher" />}</div> },
    { key: 'actions', header: 'Acciones', className: 'w-[130px]', render: (t: TeacherRow) => (
      <div className="flex items-center gap-[4px]">
        <button onClick={() => setViewingTeacher(t)} className="btn btn-2xs btn-ghost" title="Ver detalle"><span className="material-symbols-outlined text-[16px]">visibility</span></button>
        <button onClick={() => setEditingTeacher(t)} className="btn btn-2xs btn-ghost" title="Reasignar sección"><span className="material-symbols-outlined text-[16px]">edit</span></button>
        <button onClick={() => setDeleteTarget(t)} className="btn btn-2xs btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600" title="Eliminar"><span className="material-symbols-outlined text-[16px]">delete</span></button>
      </div>
    )},
  ];

  if (!institutionId) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Docentes</h1><p className="page-subtitle">Gestión de docentes</p></div>
        <div className="card"><div className="empty-state"><p className="empty-state-title">Sin institución asignada</p><p className="empty-state-description">No tienes una institución asignada.</p></div></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Docentes</h1><p className="page-subtitle">Gestión de docentes de la institución</p></div>
        <Button onClick={handleCreate} size="sm" className="hidden md:inline-flex"><span className="material-symbols-outlined text-[18px] mr-[4px]">add</span>Crear Docente</Button>
      </div>

      <div className="mb-[16px]">
        <div className="flex items-center gap-[8px] max-w-[360px]">
          <span className="material-symbols-outlined text-[18px] text-secondary-400">search</span>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Buscar por nombre, correo o sección..."
            className="input"
          />
          {filterText && (
            <button onClick={() => setFilterText('')} className="btn btn-2xs btn-ghost text-secondary-400" title="Limpiar filtro">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
          {filterText && (
            <span className="text-[13px] text-secondary-500">
              {filteredTeachers.length} resultado{filteredTeachers.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <Table<TeacherRow>
        columns={columns}
        data={filteredTeachers}
        keyExtractor={(t) => t.id}
        isLoading={isLoading}
        error={error}
        onRetry={fetchTeachers}
        emptyMessage={filterText ? 'No hay docentes que coincidan con el filtro.' : 'No hay docentes en esta institución.'}
        pageSize={10}
      />

      {showForm && <TeacherForm onSubmit={handleCreateSubmit} onCancel={() => setShowForm(false)} isLoading={formLoading} />}
      {editingTeacher && (
        <TeacherEditForm
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingTeacher(null)}
          isLoading={formLoading}
          institutionId={institutionId}
          currentGradeId={editingTeacher.gradeId}
          currentSectionId={editingTeacher.sectionId}
          teacherName={editingTeacher.name ?? editingTeacher.email}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Eliminar Docente"
        message={`¿Eliminar a "${deleteTarget?.name ?? deleteTarget?.email}"?`}
        confirmLabel="Eliminar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteLoading}
      />

      {viewingTeacher && (
        <Modal>
          <div className="modal-content max-w-[480px] w-full">
            <div className="modal-header">
              <h2 className="modal-title">{viewingTeacher.name || viewingTeacher.email}</h2>
              <button type="button" onClick={() => setViewingTeacher(null)} className="text-secondary-600 hover:text-secondary-900 cursor-pointer">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="modal-body flex flex-col gap-[20px]">
              <div>
                <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Correo</p>
                <p className="text-[14px] text-secondary-900">{viewingTeacher.email}</p>
              </div>
              {viewingTeacher.name && (
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Nombre</p>
                  <p className="text-[14px] text-secondary-900">{viewingTeacher.name}</p>
                </div>
              )}
              <div>
                <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Sección</p>
                <p className="text-[14px] text-secondary-700">{viewingTeacher.sectionName || 'Sin asignar'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Roles</p>
                <div className="flex flex-wrap gap-[4px]">
                  {viewingTeacher.roles.length > 0 ? (
                    viewingTeacher.roles.map((ur) => <Badge key={ur.role.id} role={ur.role.name} />)
                  ) : (
                    <Badge role="teacher" />
                  )}
                </div>
              </div>
              <div className="flex gap-[24px]">
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Creado</p>
                  <p className="text-[13px] text-secondary-700">{formatDate(viewingTeacher.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Actualizado</p>
                  <p className="text-[13px] text-secondary-700">{formatDate(viewingTeacher.updatedAt)}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setViewingTeacher(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
