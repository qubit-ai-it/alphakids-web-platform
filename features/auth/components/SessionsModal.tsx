'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Icon } from '@/shared/components/ui/Icon';
import { authService } from '@/features/auth/services/auth.service';
import type { Session } from '@/shared/lib/types';
import { useToast } from '@/shared/contexts/ToastContext';

interface SessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SessionsModal({ isOpen, onClose }: SessionsModalProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await authService.getSessions();
      setSessions(data);
    } catch (err) {
      addToast('error', 'Error', 'Error al cargar las sesiones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen]);

  const handleRevoke = async (id: string) => {
    try {
      await authService.revokeSession(id);
      setSessions(sessions.filter((s) => s.id !== id));
      addToast('success', 'Sesión revocada', 'El dispositivo ha sido desconectado.');
    } catch {
      addToast('error', 'Error', 'Error al revocar la sesión');
    }
  };

  const handleRevokeOther = async () => {
    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) return;
    try {
      await authService.revokeOtherSessions(refreshToken);
      fetchSessions();
      addToast('success', 'Sesiones revocadas', 'Todos los demás dispositivos han sido desconectados.');
    } catch {
      addToast('error', 'Error', 'Error al revocar otras sesiones');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal>
      <div className="w-full max-w-[604px] bg-white p-[32px] sm:p-[48px] rounded-[32px] shadow-xl flex flex-col relative font-sans">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-[32px] right-[32px] text-secondary-900 hover:text-secondary-600 active:scale-90 transition-all duration-200 cursor-pointer"
        >
          <Icon name="close" className="text-[28px]" />
        </button>

        <div className="text-center mb-[32px]">
          <h1 className="text-[36px] font-bold text-secondary-900 leading-tight mb-[8px]">
            Dispositivos Activos
          </h1>
          <div className="flex items-center justify-center gap-[8px] text-[16px] text-primary-600 font-medium bg-primary-100 w-fit mx-auto px-[16px] py-[4px] rounded-full">
            <Icon name="security" className="text-[20px]" />
            Seguridad
          </div>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="spinner spinner-lg" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Tus sesiones ({sessions.length})
              </h2>
              {sessions.length > 1 && (
                <button
                  onClick={handleRevokeOther}
                  className="text-sm px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium border border-red-200"
                >
                  Cerrar sesión en otros dispositivos
                </button>
              )}
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {sessions.map((session, index) => {
                const current = index === 0;

                return (
                  <div
                    key={session.id}
                    className={`group flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-xl border transition-all ${
                      current
                        ? 'bg-primary-50/50 border-primary-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full flex-shrink-0 ${current ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                        {session.deviceName?.toLowerCase().includes('mac') || session.deviceName?.toLowerCase().includes('windows') ? (
                          <span className="material-symbols-outlined text-[24px]">desktop_windows</span>
                        ) : (
                          <span className="material-symbols-outlined text-[24px]">smartphone</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          {session.deviceName || 'Dispositivo desconocido'}
                          {current && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              Este dispositivo
                            </span>
                          )}
                        </h3>
                        <div className="text-sm text-slate-500 mt-1 flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">language</span>
                            {session.ipAddress}
                          </span>
                          <span>
                            Última vez: {new Date(session.lastActiveAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!current && (
                      <button
                        onClick={() => handleRevoke(session.id)}
                        className="mt-4 sm:mt-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                        title="Revocar acceso"
                      >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
