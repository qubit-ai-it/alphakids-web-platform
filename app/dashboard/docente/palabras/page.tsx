'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Modal } from '@/shared/components/ui/Modal';
import { WordForm } from '@/features/docente/components/WordForm';
import type { WordFormData } from '@/features/docente/components/WordForm';
import { wordsService } from '@/features/docente/services/words.service';
import { resizeImage } from '@/shared/lib/image';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/errors';
import { useSetMobileAction } from '@/shared/contexts/MobileActionContext';
import type { Word, DifficultyLabel } from '@/shared/lib/types';

const difficultyBadgeMap: Record<DifficultyLabel, string> = {
  INICIAL: 'bg-green-50 text-green-700 border border-green-200 px-[10px] py-[2px] rounded-[6px] text-[12px] font-medium',
  BASICO: 'bg-blue-50 text-blue-700 border border-blue-200 px-[10px] py-[2px] rounded-[6px] text-[12px] font-medium',
  INTERMEDIO: 'bg-orange-50 text-orange-700 border border-orange-200 px-[10px] py-[2px] rounded-[6px] text-[12px] font-medium',
  AVANZADO: 'bg-red-50 text-red-700 border border-red-200 px-[10px] py-[2px] rounded-[6px] text-[12px] font-medium',
  EXPERTO: 'bg-purple-50 text-purple-700 border border-purple-200 px-[10px] py-[2px] rounded-[6px] text-[12px] font-medium',
};

const difficultyLabels: Record<DifficultyLabel, string> = {
  INICIAL: 'Inicial',
  BASICO: 'Básico',
  INTERMEDIO: 'Intermedio',
  AVANZADO: 'Avanzado',
  EXPERTO: 'Experto',
};

export default function DocentePalabrasPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [filterText, setFilterText] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Word | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [viewingWord, setViewingWord] = useState<Word | null>(null);

  const { addToast } = useToast();

  const initialized = useRef(false);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    wordsService
      .getAll()
      .then((data) => {
        setWords(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Error al cargar palabras');
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    refetch();
  }, [refetch]);

  const filteredWords = words.filter((w) => {
    const matchesDifficulty = !filterDifficulty || w.difficultyLabel === filterDifficulty;
    const matchesText = !filterText || w.text.toLowerCase().includes(filterText.toLowerCase());
    return matchesDifficulty && matchesText;
  });

  const handleCreate = () => {
    setEditingWord(null);
    setShowForm(true);
  };

  const setMobileAction = useSetMobileAction(null);
  useEffect(() => {
    setMobileAction({ label: 'Crear Palabra', icon: 'add', onClick: handleCreate });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEdit = (word: Word) => {
    setEditingWord(word);
    setShowForm(true);
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });

  const handleFormSubmit = async (data: WordFormData, imageFile?: File, audioFile?: File) => {
    setFormLoading(true);
    try {
      let imageUrl: string | undefined;
      let audioUrl: string | undefined;

      if (imageFile) {
        imageUrl = await resizeImage(imageFile);
      }
      if (audioFile) {
        audioUrl = await readFileAsDataUrl(audioFile);
      }

      if (editingWord) {
        await wordsService.update(editingWord.id, {
          text: data.text,
          difficultyLabel: data.difficultyLabel,
          imageUrl: imageUrl ?? undefined,
          audioUrl: audioUrl ?? undefined,
          isActive: data.isActive,
        });
      } else {
        await wordsService.create({
          text: data.text,
          difficultyLabel: data.difficultyLabel,
          imageUrl,
          audioUrl,
          isActive: data.isActive,
        });
      }
      setShowForm(false);
      setEditingWord(null);
      addToast('success', editingWord ? 'Palabra actualizada' : 'Palabra creada');
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
      await wordsService.delete(deleteTarget.id);
      setDeleteTarget(null);
      addToast('success', 'Palabra eliminada');
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
      key: 'text',
      header: 'Palabra',
      render: (w: Word) => (
        <span className="text-[14px] font-medium text-secondary-900">{w.text}</span>
      ),
    },
    {
      key: 'difficulty',
      header: 'Dificultad',
      className: 'w-[120px]',
      render: (w: Word) => (
        <span className={difficultyBadgeMap[w.difficultyLabel] ?? ''}>
          {difficultyLabels[w.difficultyLabel] ?? w.difficultyLabel}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Estado',
      className: 'w-[90px]',
      render: (w: Word) => (
        <Badge variant={w.isActive ? 'success' : 'error'}>
          {w.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'createdBy',
      header: 'Creado por',
      render: (w: Word) => (
        <span className="text-[13px] text-secondary-600">
          {w.createdBy?.name ?? w.createdBy?.email ?? '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-[130px]',
      render: (w: Word) => (
        <div className="flex items-center gap-[4px]">
          <button
            onClick={() => setViewingWord(w)}
            className="btn btn-2xs btn-ghost"
            title="Ver detalle"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
          </button>
          <button
            onClick={() => handleEdit(w)}
            className="btn btn-2xs btn-ghost"
            title="Editar"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button
            onClick={() => setDeleteTarget(w)}
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
          <h1 className="page-title">Palabras</h1>
          <p className="page-subtitle">Gestión del diccionario de palabras</p>
        </div>
        <Button onClick={handleCreate} size="sm" className="hidden md:inline-flex">
          <span className="material-symbols-outlined text-[18px] mr-[4px]">add</span>
          Crear Palabra
        </Button>
      </div>

      <div className="mb-[16px] flex items-center gap-[12px] flex-wrap">
        <div className="flex items-center gap-[8px] max-w-[300px] flex-1">
          <span className="material-symbols-outlined text-[18px] text-secondary-400">search</span>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Buscar por palabra..."
            className="input"
          />
          {filterText && (
            <button onClick={() => setFilterText('')} className="btn btn-2xs btn-ghost text-secondary-400" title="Limpiar filtro">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-[8px]">
          <label className="text-[14px] font-medium text-secondary-700">Dificultad:</label>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="input max-w-[200px]"
          >
            <option value="">Todas</option>
            {Object.entries(difficultyLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {filterDifficulty && (
            <button onClick={() => setFilterDifficulty('')} className="btn btn-2xs btn-ghost text-secondary-400" title="Limpiar filtro">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
        {(filterDifficulty || filterText) && (
          <span className="text-[13px] text-secondary-500">
            {filteredWords.length} palabra{filteredWords.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <Table<Word>
        columns={columns}
        data={filteredWords}
        keyExtractor={(w) => w.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={filterDifficulty || filterText
          ? filterDifficulty && filterText
            ? `No hay palabras "${difficultyLabels[filterDifficulty as DifficultyLabel] ?? filterDifficulty}" que coincidan con "${filterText}"`
            : filterDifficulty
              ? `No hay palabras con dificultad "${difficultyLabels[filterDifficulty as DifficultyLabel] ?? filterDifficulty}"`
              : `No hay palabras que coincidan con "${filterText}"`
          : 'No hay palabras registradas. Crea la primera usando el botón superior.'}
        pageSize={10}
      />

      {showForm && (
        <WordForm
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingWord(null);
          }}
          isLoading={formLoading}
          word={editingWord}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Eliminar Palabra"
        message={`¿Estás seguro de eliminar la palabra "${deleteTarget?.text}"?`}
        confirmLabel="Eliminar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteLoading}
      />

      {viewingWord && (
        <Modal>
          <div className="modal-content max-w-[480px] w-full">
            <div className="modal-header">
              <h2 className="modal-title">{viewingWord.text}</h2>
              <button
                type="button"
                onClick={() => setViewingWord(null)}
                className="text-secondary-600 hover:text-secondary-900 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="modal-body flex flex-col gap-[20px]">
              <div className="flex gap-[16px]">
                {viewingWord.imageUrl ? (
                  <img
                    src={viewingWord.imageUrl}
                    alt={viewingWord.text}
                    className="w-[120px] h-[120px] rounded-[16px] object-cover border border-secondary-200 shrink-0"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] rounded-[16px] bg-secondary-100 border border-secondary-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[40px] text-secondary-400">image</span>
                  </div>
                )}
                <div className="flex flex-col gap-[12px] flex-1">
                  <div>
                    <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Dificultad</p>
                    <span className={difficultyBadgeMap[viewingWord.difficultyLabel] ?? ''}>
                      {difficultyLabels[viewingWord.difficultyLabel] ?? viewingWord.difficultyLabel}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Estado</p>
                    <Badge variant={viewingWord.isActive ? 'success' : 'error'}>
                      {viewingWord.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  {viewingWord.audioUrl && (
                    <div>
                      <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[4px]">Audio</p>
                      <audio controls src={viewingWord.audioUrl} className="h-[32px] w-full max-w-[240px]" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-[24px]">
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Creado</p>
                  <p className="text-[13px] text-secondary-700">{formatDate(viewingWord.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-secondary-500 uppercase tracking-[0.05em] mb-[2px]">Actualizado</p>
                  <p className="text-[13px] text-secondary-700">{formatDate(viewingWord.updatedAt)}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setViewingWord(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
