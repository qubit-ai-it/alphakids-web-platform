'use client';

import React from 'react';
import { useToast } from '@/shared/contexts/ToastContext';

const iconMap: Record<string, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

const typeClassMap: Record<string, string> = {
  success: 'toast-success',
  error: 'toast-error',
  warning: 'toast-warning',
  info: 'toast-info',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-[24px] right-[24px] z-[100] flex flex-col gap-[8px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${typeClassMap[toast.type]} animate-slideIn`}
        >
          <span className={`material-symbols-outlined text-[20px] toast-icon ${
            toast.type === 'error'
              ? 'text-red-500'
              : toast.type === 'success'
                ? 'text-green-600'
                : toast.type === 'warning'
                  ? 'text-amber-600'
                  : 'text-primary-600'
          }`}>
            {iconMap[toast.type]}
          </span>
          <div className="toast-content">
            <p className="toast-title">{toast.title}</p>
            {toast.message && <p className="toast-message">{toast.message}</p>}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-secondary-400 hover:text-secondary-600 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
