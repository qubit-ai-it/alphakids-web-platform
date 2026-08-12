'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { Icon } from '@/shared/components/ui/Icon';
import { Button } from '@/shared/components/ui/Button';
import { useRouter } from 'next/navigation';
import { studentsService } from '@/features/docente/services/students.service';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/errors';
import { getInstitutionId } from '@/shared/lib/jwt';

interface NotificationInboxProps {
  onClose: () => void;
}

export function NotificationInbox({ onClose }: NotificationInboxProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading, mutate } = useNotifications();
  const [tab, setTab] = useState<'unread' | 'read'>('unread');
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const router = useRouter();
  const { addToast } = useToast();

  const filteredNotifications = notifications.filter(n => tab === 'unread' ? !n.isRead : n.isRead);

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) markAsRead(notif.id);
    if (notif.type === 'STUDENT_PENDING') {
      router.push('/dashboard/director/alumnos?verification=PENDING');
      onClose();
    }
  };

  const handleVerifyAction = async (notif: any, status: 'VERIFIED' | 'REJECTED') => {
    const institutionId = getInstitutionId();
    if (!institutionId || !notif.referenceId) {
      addToast('error', 'Error', 'No se puede procesar la notificación.');
      return;
    }
    setPendingAction(`${notif.id}:${status}`);
    try {
      await studentsService.verify(institutionId, notif.referenceId, { status });
      await markAsRead(notif.id);
      await mutate();
      addToast('success', status === 'VERIFIED' ? 'Estudiante aprobado' : 'Estudiante rechazado');
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      addToast('error', title, message);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-secondary-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Side Panel */}
      <div className="relative w-full max-w-[400px] h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-6 border-b border-secondary-100 flex items-start justify-between bg-white shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900 leading-tight mb-1">Notificaciones</h2>
            <p className="text-secondary-500 text-[14px]">Tu buzón de alertas</p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-[13px] font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-full transition-colors mr-2"
                title="Marcar todo como leído"
              >
                <Icon name="check" size={18} />
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-700 transition-colors p-2 rounded-full hover:bg-secondary-100"
            >
              <Icon name="close" size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-secondary-100 flex items-center gap-2 bg-white shrink-0">
          <button
            onClick={() => setTab('unread')}
            className={`flex-1 py-2 rounded-lg text-[14px] font-semibold transition-all ${
              tab === 'unread' ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-200' : 'text-secondary-600 hover:bg-secondary-100'
            }`}
          >
            Nuevas
          </button>
          <button
            onClick={() => setTab('read')}
            className={`flex-1 py-2 rounded-lg text-[14px] font-semibold transition-all ${
              tab === 'read' ? 'bg-secondary-100 text-secondary-800 shadow-sm border border-secondary-300' : 'text-secondary-600 hover:bg-secondary-100'
            }`}
          >
            Leídas
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto bg-secondary-50/30 p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="spinner border-primary-500 w-8 h-8" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-secondary-400">
                <Icon name="notifications" size={32} />
              </div>
              <p className="text-secondary-600 font-medium">No tienes notificaciones {tab === 'read' ? 'leídas' : 'nuevas'}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer group ${
                    notif.isRead 
                      ? 'bg-white border border-secondary-200 hover:border-secondary-300 shadow-sm hover:shadow-md' 
                      : 'bg-white border-l-4 border-l-primary-500 border border-secondary-200 shadow-md hover:shadow-lg'
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    notif.isRead ? 'bg-secondary-100 text-secondary-500' : 'bg-primary-100 text-primary-600'
                  }`}>
                    <Icon name={notif.type === 'STUDENT_PENDING' ? 'person_add' : 'notifications'} size={20} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className={`text-[14px] font-bold line-clamp-1 ${
                        notif.isRead ? 'text-secondary-700' : 'text-secondary-900'
                      }`}>
                        {notif.title}
                      </h3>
                    </div>
                    <p className="text-[13px] text-secondary-600 leading-relaxed pr-2 mb-2 line-clamp-2">
                      {notif.body}
                    </p>
                    <span className="text-[11px] font-medium text-secondary-400">
                      {new Date(notif.createdAt).toLocaleDateString()} a las {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {notif.type === 'STUDENT_PENDING' && (
                      <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleVerifyAction(notif, 'VERIFIED')}
                          disabled={pendingAction !== null}
                          className="btn btn-sm btn-ghost text-success-600 hover:bg-success-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Aprobar"
                        >
                          {pendingAction === `${notif.id}:VERIFIED` ? 'Aprobando...' : 'Aprobar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerifyAction(notif, 'REJECTED')}
                          disabled={pendingAction !== null}
                          className="btn btn-sm btn-ghost text-error-600 hover:bg-error-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Rechazar"
                        >
                          {pendingAction === `${notif.id}:REJECTED` ? 'Rechazando...' : 'Rechazar'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
