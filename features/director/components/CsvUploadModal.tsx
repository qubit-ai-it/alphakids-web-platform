'use client';

import React, { useRef, useState, useCallback } from 'react';
import { parseCsv } from '@/shared/lib/csv-parser';
import { api } from '@/shared/lib/api-client';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BulkUploadResult {
  created: number;
  emailsSent?: number;
  errors: Array<{ row: number; field: string; message: string }>;
}

type ImportType = 'grades' | 'sections' | 'teachers';
type Status = 'select-type' | 'idle' | 'preview' | 'uploading' | 'done' | 'error';

interface ImportTypeConfig {
  label: string;
  labelPlural: string;
  endpoint: string;
  template: string;
  templateFilename: string;
  description: string;
  dropzoneColumns: string;
}

const IMPORT_TYPES: Record<ImportType, ImportTypeConfig> = {
  grades: {
    label: 'Grado',
    labelPlural: 'Grados',
    endpoint: '/bulk/grades',
    template: 'name\n1ro Primaria\n2do Primaria\n3ro Primaria',
    templateFilename: 'plantilla_grados.csv',
    description: 'Importa grados desde un archivo CSV.',
    dropzoneColumns: 'name',
  },
  sections: {
    label: 'Sección',
    labelPlural: 'Secciones',
    endpoint: '/bulk/sections',
    template: 'grade_name,section_name\n1ro Primaria,A\n1ro Primaria,B\n2do Primaria,A',
    templateFilename: 'plantilla_secciones.csv',
    description: 'Importa secciones desde un archivo CSV.',
    dropzoneColumns: 'grade_name, section_name',
  },
  teachers: {
    label: 'Docente',
    labelPlural: 'Docentes',
    endpoint: '/bulk/teachers',
    template: 'email,name,grade_name,section_name\njuan@colegio.com,Juan Pérez,1ro Primaria,A',
    templateFilename: 'plantilla_docentes.csv',
    description: 'Importa docentes desde un archivo CSV. Si el email no existe, se crea el usuario y se envía email de bienvenida.',
    dropzoneColumns: 'email, name, grade_name, section_name',
  },
};

export function CsvUploadModal({ isOpen, onClose }: CsvUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState<ImportType | null>(null);
  const [status, setStatus] = useState<Status>('select-type');
  const [fileName, setFileName] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const reset = useCallback(() => {
    setStatus('select-type');
    setImportType(null);
    setFileName('');
    setHeaders([]);
    setRows([]);
    setUploadResult(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSelectType = useCallback((type: ImportType) => {
    setImportType(type);
    setStatus('idle');
    setUploadError(null);
  }, []);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadError('Solo se permiten archivos CSV.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCsv(text);
      if (parsed.headers.length === 0) {
        setUploadError('El archivo CSV está vacío o tiene un formato inválido.');
        return;
      }
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setStatus('preview');
      setUploadError(null);
    };
    reader.onerror = () => {
      setUploadError('Error al leer el archivo.');
    };
    reader.readAsText(file);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleImport = useCallback(async () => {
    if (!importType || rows.length === 0) return;
    setStatus('uploading');

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], fileName);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await api.upload<BulkUploadResult>(IMPORT_TYPES[importType].endpoint, formData);
      setUploadResult(result);
      setStatus('done');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error desconocido');
      setStatus('error');
    }
  }, [importType, headers, rows, fileName]);

  const handleDownloadTemplate = useCallback(() => {
    if (!importType) return;
    const config = IMPORT_TYPES[importType];
    const blob = new Blob([config.template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = config.templateFilename;
    a.click();
    URL.revokeObjectURL(url);
  }, [importType]);

  if (!isOpen) return null;

  const config = importType ? IMPORT_TYPES[importType] : null;

  return (
    <div className="modal-auth-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="modal-content max-w-[560px] w-full">
        <div className="modal-header">
          <h2 className="modal-title">Importar datos</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary-100 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-[20px] text-secondary-600">close</span>
          </button>
        </div>

        <div className="modal-body">
          {/* Upload error */}
          {uploadError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {uploadError}
            </div>
          )}

          {/* Step 1: Select type */}
          {status === 'select-type' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-secondary-600 mb-1">¿Qué querés importar?</p>
              {(Object.entries(IMPORT_TYPES) as [ImportType, ImportTypeConfig][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => handleSelectType(key)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[28px] text-primary-500">
                    {key === 'grades' ? 'school' : key === 'sections' ? 'view_column' : 'person'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-secondary-900">{cfg.labelPlural}</p>
                    <p className="text-xs text-secondary-500">{cfg.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: File upload (idle) */}
          {(status === 'idle' || status === 'error') && importType && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={reset}
                  className="text-xs text-secondary-500 hover:text-secondary-700 flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                  Cambiar tipo
                </button>
                <span className="text-xs text-secondary-300">|</span>
                <span className="text-xs font-medium text-primary-600">{config?.labelPlural}</span>
              </div>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-secondary-300 hover:border-primary-300 hover:bg-secondary-50'
                }`}
              >
                <span className="material-symbols-outlined text-[48px] text-secondary-400 mb-2 block">
                  cloud_upload
                </span>
                <p className="text-secondary-700 font-medium mb-1">
                  Arrastra un archivo CSV aquí o haz clic para seleccionar
                </p>
                <p className="text-secondary-500 text-sm">
                  Columnas: {config?.dropzoneColumns}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="mt-3 text-center">
                <button
                  onClick={handleDownloadTemplate}
                  className="text-primary-600 text-sm font-medium hover:text-primary-700 hover:underline transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] align-text-bottom">download</span>
                  {' '}Descargar plantilla CSV
                </button>
              </div>
            </>
          )}

          {/* Step 3: Preview */}
          {status === 'preview' && config && headers.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={reset}
                  className="text-xs text-secondary-500 hover:text-secondary-700 flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                  Cambiar archivo
                </button>
                <span className="text-xs text-secondary-300">|</span>
                <span className="text-xs font-medium text-primary-600">{fileName}</span>
              </div>

              <p className="text-sm font-medium text-secondary-700 mb-2">
                Vista previa — {rows.length} registro{rows.length !== 1 ? 's' : ''}
              </p>
              <div className="overflow-x-auto max-h-[240px] overflow-y-auto border border-secondary-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-secondary-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-secondary-600 font-medium whitespace-nowrap">#</th>
                      {headers.map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-secondary-600 font-medium whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className="border-t border-secondary-100 hover:bg-secondary-50">
                        <td className="px-3 py-2 text-secondary-400 text-xs">{i + 1}</td>
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-2 text-secondary-700 whitespace-nowrap max-w-[200px] truncate">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Loading */}
          {status === 'uploading' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="spinner spinner-md mb-3" />
              <p className="text-secondary-600 text-sm">Importando datos...</p>
            </div>
          )}

          {/* Results */}
          {status === 'done' && uploadResult && config && (
            <div className="mt-2">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium mb-3">
                <span className="material-symbols-outlined text-[18px] align-text-bottom">check_circle</span>
                {' '}Se crearon {uploadResult.created} {uploadResult.created !== 1 ? config.labelPlural.toLowerCase() : config.label.toLowerCase()} correctamente.
                {uploadResult.emailsSent !== undefined && (
                  <span className="block mt-1 text-green-700">
                    Se enviaron {uploadResult.emailsSent} email{uploadResult.emailsSent !== 1 ? 's' : ''} de bienvenida.
                  </span>
                )}
              </div>
              {uploadResult.errors.length > 0 && (
                <div className="rounded-lg border border-red-200 overflow-hidden">
                  <div className="bg-red-50 px-4 py-2 border-b border-red-200 text-sm font-medium text-red-800">
                    Errores ({uploadResult.errors.length})
                  </div>
                  <ul className="divide-y divide-red-100 max-h-[200px] overflow-y-auto">
                    {uploadResult.errors.map((err, i) => (
                      <li key={i} className="px-4 py-2 text-sm text-red-700">
                        Fila {err.row}: <strong>{err.field}</strong> — {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {status === 'select-type' && (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          )}
          {status === 'preview' && (
            <>
              <button
                onClick={reset}
                className="px-4 py-2 text-sm font-medium text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors cursor-pointer"
              >
                Importar
              </button>
            </>
          )}
          {status === 'done' && (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          )}
          {status === 'error' && (
            <button
              onClick={() => setStatus('idle')}
              className="px-4 py-2 text-sm font-medium text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-lg transition-colors cursor-pointer"
            >
              Volver a intentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
