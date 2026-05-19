'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { WordForm } from '@/features/docente/components/WordForm';
import { wordsService } from '@/features/docente/services/words.service';
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

  const [showForm, setShowForm] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Word | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const filteredWords = filterDifficulty
    ? words.filter((w) => w.difficultyLabel === filterDifficulty)
    : words;

  const handleCreate = () => {
    setEditingWord(null);
    setShowForm(true);
  };

  const handleEdit = (word: Word) => {
    setEditingWord(word);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    setFormLoading(true);
    try {
      if (editingWord) {
        await wordsService.update(editingWord.id, {
          text: data.text as string | undefined,
          difficultyLabel: data.difficultyLabel as string | undefined,
          imageUrl: data.imageUrl as string | undefined,
          audioUrl: data.audioUrl as string | undefined,
          isActive: data.isActive as boolean | undefined,
        });
      } else {
        await wordsService.create({
          text: data.text as string,
          difficultyLabel: data.difficultyLabel as string,
          imageUrl: data.imageUrl as string | undefined,
          audioUrl: data.audioUrl as string | undefined,
          isActive: data.isActive as boolean | undefined,
        });
      }
      setShowForm(false);
      setEditingWord(null);
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
      await wordsService.delete(deleteTarget.id);
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
      className: 'w-[100px]',
      render: (w: Word) => (
        <div className="flex items-center gap-[4px]">
          <button
            onClick={() => handleEdit(w)}
            className="btn btn-xs btn-ghost"
            title="Editar"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button
            onClick={() => setDeleteTarget(w)}
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
          <h1 className="page-title">Palabras</h1>
          <p className="page-subtitle">Gestión del diccionario de palabras</p>
        </div>
        <Button onClick={handleCreate} size="sm">
          <span className="material-symbols-outlined text-[18px] mr-[4px]">add</span>
          Crear Palabra
        </Button>
      </div>

      <div className="mb-[16px]">
        <div className="flex items-center gap-[12px]">
          <label className="text-[14px] font-medium text-secondary-700">Filtrar por dificultad:</label>
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
            <span className="text-[13px] text-secondary-500">
              {filteredWords.length} palabra{filteredWords.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <Table<Word>
        columns={columns}
        data={filteredWords}
        keyExtractor={(w) => w.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={filterDifficulty
          ? `No hay palabras con dificultad "${difficultyLabels[filterDifficulty as DifficultyLabel] ?? filterDifficulty}"`
          : 'No hay palabras registradas. Crea la primera usando el botón superior.'}
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
    </div>
  );
}
