'use client';

import React from 'react';

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
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  error = null,
  onRetry,
  emptyMessage = 'No hay datos disponibles',
}: TableProps<T>) {
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
            <button
              onClick={onRetry}
              className="btn btn-primary mt-[12px] cursor-pointer"
            >
              Reintentar
            </button>
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
            {data.map((item) => (
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
    </div>
  );
}
