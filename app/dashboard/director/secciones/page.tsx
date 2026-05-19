'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Modal } from '@/shared/components/ui/Modal';
import { SectionForm } from '@/features/director/components/SectionForm';
import { sectionsService } from '@/features/director/services/sections.service';
import { gradesService } from '@/features/director/services/grades.service';
import { getInstitutionId } from '@/shared/lib/jwt';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/errors';
import { useSetMobileAction } from '@/shared/contexts/MobileActionContext';
import type { Section, Grade } from '@/shared/lib/types';

export default function DirectorSeccionesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewingSection, setViewingSection] = useState<Section | null>(null);
  const [filterText, setFilterText] = useState('');
  const initialized = useRef(false);

  const fetchSections = useCallback((gradeId: string) => {
    const id = getInstitutionId();
    if (!id) return;
    setIsLoading(true); setError(null);
    sectionsService.getAll(id, gradeId).then((data) => { setSections(data); setIsLoading(false); })
      .catch((err: Error) => {
        const { title, message } = getErrorMessage(err);
        setError(title ? `${title}: ${message}` : 'Error al cargar secciones');
        setIsLoading(false);
      });
  }, []);

  const fetchGrades = useCallback(() => {
    const id = getInstitutionId();
    if (!id) return;
    gradesService.getAll(id).then(setGrades).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const id = getInstitutionId();
    if (id) fetchGrades();
  }, [fetchGrades]);

  const handleGradeChange = (gradeId: string) => {
    setSelectedGradeId(gradeId);
    setFilterText('');
    if (gradeId) fetchSections(gradeId);
    else setSections([]);
  };

  const filteredSections = filterText
    ? sections.filter((s) => s.name.toLowerCase().includes(filterText.toLowerCase()))
    : sections;

  const handleCreate = () => { setEditingSection(null); setShowForm(true); };

  const setMobileAction = useSetMobileAction(null);
  useEffect(() => {
    setMobileAction({ label: 'Crear Sección', icon: 'add', onClick: handleCreate, disabled: !selectedGradeId });
  }, [selectedGradeId]); // eslint-disable-line react-hooks/exhaustive-deps
  const handleEdit = (s: Section) => { setEditingSection(s); setShowForm(true); };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    const id = getInstitutionId();
    if (!id || !selectedGradeId) return;
    setFormLoading(true);
    try {
      if (editingSection) {
        await sectionsService.update(id, selectedGradeId, editingSection.id, {
          name: data.name as string,
          capacity: data.capacity as number,
        });
      } else {
        await sectionsService.create(id, selectedGradeId, {
          name: data.name as string,
          capacity: data.capacity as number,
        });
      }
      setShowForm(false);
      setEditingSection(null);
      addToast('success', editingSection ? 'Sección actualizada' : 'Sección creada');
      fetchSections(selectedGradeId);
      fetchGrades();
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      addToast('error', title, message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    const id = getInstitutionId();
    if (!deleteTarget || !id || !selectedGradeId) return;
    setDeleteLoading(true);
    try {
      await sectionsService.delete(id, selectedGradeId, deleteTarget.id);
      setDeleteTarget(null);
      addToast('success', 'Sección eliminada');
      fetchSections(selectedGradeId);
      fetchGrades();
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
    { key: 'name', header: 'Nombre', render: (s: Section) => <span className="text-[14px] font-medium text-secondary-900">{s.name}</span> },
    { key: 'grade', header: 'Grado', render: (s: Section) => <span className="text-[13px] text-secondary-600">{s.grade?.name ?? '-'}</span> },
    { key: 'capacity', header: 'Capacidad', className: 'w-[100px]', render: (s: Section) => <span className="text-[14px] text-secondary-600">{s.capacity} alumnos</span> },
    { key: 'actions', header: 'Acciones', className: 'w-[130px]', render: (s: Section) => (
      <div className="flex items-center gap-[4px]">
        <button onClick={() => setViewingSection(s)} className="btn btn-2xs btn-ghost" title="Ver detalle"><span className="material-symbols-outlined text-[16px]">visibility</span></button>
        <button onClick={() => handleEdit(s)} className="btn btn-2xs btn-ghost" title="Editar"><span className="material-symbols-outlined text-[16px]">edit</span></button>
        <button onClick={() => setDeleteTarget(s)} className="btn btn-2xs btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600" title="Eliminar"><span className="material-symbols-outlined text-[16px]">delete</span></button>
      </div>
    )},
  ];

  const selectedGrade = grades.find((g) => g.id === selectedGradeId);

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Secciones</h1><p className="page-subtitle">Gestión de secciones por grado</p></div>
        <Button onClick={handleCreate} size="sm" disabled={!selectedGradeId} className="hidden md:inline-flex"><span className="material-symbols-outlined text-[18px] mr-[4px]">add</span>Crear Sección</Button>
      </div>

      <div className="mb-[16px] flex items-center gap-[12px] flex-wrap">
        <div className="flex items-center gap-[12px]">
          <label className="text-[14px] font-medium text-secondary-700">Grado:</label>
          <select value={selectedGradeId} onChange={(e) => handleGradeChange(e.target.value)} className="input max-w-[280px]">
            <option value="">Seleccionar grado...</option>
            {grades.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.ageRangeMin}-{g.ageRangeMax} años)</option>)}
          </select>
          {selectedGrade && <span className="text-[13px] text-secondary-500">{selectedGrade._count?.sections ?? 0} secciones</span>}
        </div>
        {selectedGradeId && (
          <div className="flex items-center gap-[8px] max-w-[280px]">
            <span className="material-symbols-outlined text-[18px] text-secondary-400">search</span>
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Buscar por nombre..."
              className="input"
            />
            {filterText && (
              <button onClick={() => setFilterText('')} className="btn btn-2xs btn-ghost text-secondary-400" title="Limpiar filtro">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        )}
      </div>

      {!selectedGradeId ? (
        <div className="card"><div className="empty-state"><p className="empty-state-title">Selecciona un grado</p><p className="empty-state-description">Elige un grado para ver sus secciones.</p></div></div>
      ) : (
        <Table<Section>
          columns={columns}
          data={filteredSections}
          keyExtractor={(s) => s.id}
          isLoading={isLoading}
          error={error}
          onRetry={() => fetchSections(selectedGradeId)}
          emptyMessage={filterText ? 'No hay secciones que coincidan con el filtro.' : 'No hay secciones en este grado.'}
          pageSize={10}
        />
      )}

      {showForm && <SectionForm onSubmit={handleFormSubmit} onCancel={() => { setShowForm(false); setEditingSection(null); }} isLoading={formLoading} section={editingSection} />}
      <ConfirmDialog isOpen={!!deleteTarget} title="Eliminar Sección" message={`¿Eliminar "${deleteTarget?.name}"?`} confirmLabel="Eliminar" onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} isLoading={deleteLoading} />

      {viewingSection && (
        <Modal>
          <div className="modal-content max-w-[480px] w-full">
            <div className="modal-header">
              <h2 className="modal-title">{viewingSection.name}</h2>
              <button type="button" onClick={() => setViewingSection(null)} className="text-secondary-600 hover:text-secondary-900 cursor-pointer">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="modal-body flex flex-col gap-[20px]">
              <div>
                <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Grado</p>
                <p className="text-[14px] text-secondary-900">{viewingSection.grade?.name ?? '-'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Capacidad</p>
                <p className="text-[14px] text-secondary-700">{viewingSection.capacity} alumnos</p>
              </div>
              <div className="flex gap-[24px]">
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Creado</p>
                  <p className="text-[13px] text-secondary-700">{formatDate(viewingSection.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Actualizado</p>
                  <p className="text-[13px] text-secondary-700">{formatDate(viewingSection.updatedAt)}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setViewingSection(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
