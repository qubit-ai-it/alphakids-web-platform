'use client';

import React from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'default';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const confirmBtnClass =
    variant === 'danger'
      ? 'btn btn-danger cursor-pointer'
      : 'btn btn-primary cursor-pointer';

  return (
    <Modal>
      <div className="modal-content max-w-[420px] w-full">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>
        <div className="modal-body">
          <p className="text-secondary-700 text-[14px]">{message}</p>
        </div>
        <div className="modal-footer flex justify-end gap-[12px]">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="btn btn-secondary cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={confirmBtnClass}
          >
            {isLoading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
