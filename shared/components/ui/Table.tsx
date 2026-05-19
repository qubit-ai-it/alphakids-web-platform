'use client';

import React, { useState } from 'react';
import { Button } from './Button';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
  pageSize?: number;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  error = null,
  onRetry,
  emptyMessage = 'No hay datos disponibles',
  pageSize = 0,
}: TableProps<T>) {
  const [page, setPage] = useState(0);

  if (isLoading) {
    return (
      <div className="card">
        <div className="p-[40px] flex flex-col items-center gap-[16px]">
          <div className="spinner spinner-lg" />
          <p className="text-secondary-600 text-[14px]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-state">
          <div className="empty-state-icon">
            <span className="material-symbols-outlined text-[48px] text-error">error</span>
          </div>
          <p className="error-state-title">Error al cargar los datos</p>
          <p className="empty-state-description">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} size="sm" className="mt-[12px]">
              Reintentar
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">
            <span className="material-symbols-outlined text-[48px] text-secondary-400">inbox</span>
          </div>
          <p className="empty-state-title">Sin resultados</p>
          <p className="empty-state-description">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const usePagination = pageSize > 0;
  const totalPages = usePagination ? Math.ceil(data.length / pageSize) : 1;
  const safePage = Math.min(page, totalPages - 1);
  const pagedData = usePagination
    ? data.slice(safePage * pageSize, (safePage + 1) * pageSize)
    : data;
  const from = usePagination ? safePage * pageSize + 1 : 1;
  const to = usePagination ? Math.min((safePage + 1) * pageSize, data.length) : data.length;

  const handlePrev = () => setPage((p) => Math.max(0, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <div className="card">
      <div className="table-container">
        <table className="table">
          <thead>
            <tr className="table-header">
              {columns.map((col) => (
                <th key={col.key} className={`table-header-cell ${col.className ?? ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item) => (
              <tr key={keyExtractor(item)} className="table-row">
                {columns.map((col) => (
                  <td key={col.key} className={`table-cell ${col.className ?? ''}`}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {usePagination && totalPages > 1 && (
        <div className="flex items-center justify-between pt-[16px] px-[4px]">
          <span className="text-[13px] text-secondary-500">
            Mostrando {from}&ndash;{to} de {data.length}
          </span>
          <div className="flex items-center gap-[4px]">
            <button
              onClick={handlePrev}
              disabled={safePage === 0}
              className="btn btn-2xs btn-ghost"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`btn btn-2xs ${i === safePage ? 'btn-primary' : 'btn-ghost'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={handleNext}
              disabled={safePage === totalPages - 1}
              className="btn btn-2xs btn-ghost"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
