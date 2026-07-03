import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { api, BASE_URL } from '@/shared/lib/api-client';
import { Notification, NotificationsResponse } from '@/shared/lib/types';
import { useAuth } from './useAuth';
import { authService } from '@/features/auth/services/auth.service';

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  
  const fetcher = (url: string) => api.get<NotificationsResponse>(url);
  
  const { data, error, mutate } = useSWR<NotificationsResponse>(
    isAuthenticated ? '/notifications' : null,
    fetcher
  );

  const [realtimeNotifications, setRealtimeNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync initial unread count
  useEffect(() => {
    if (data) {
      setUnreadCount(data.unreadCount);
    }
  }, [data]);

  // Connect to SSE
  useEffect(() => {
    const token = authService.getToken();
    if (!isAuthenticated || !token) return;

    // Use EventSource for SSE. We must append token manually since EventSource doesn't support headers natively in browser
    // Wait, since we are sending token in header normally, EventSource native won't work easily with JWT in headers.
    // However, a simple workaround is sending the token in a query param: ?token=...
    // Let's assume we can do that or we use a custom fetch-based SSE if needed.
    // For now, let's use standard EventSource.
    const url = `${BASE_URL}/notifications/stream?token=${token}`;
    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'STUDENT_PENDING' && parsed.notification) {
          setRealtimeNotifications(prev => [parsed.notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      } catch (e) {
        console.error('Failed to parse SSE', e);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isAuthenticated]);

  const allNotifications = [...realtimeNotifications, ...(data?.items || [])];
  // Remove duplicates based on ID (if any)
  const uniqueNotifications = Array.from(new Map(allNotifications.map(item => [item.id, item])).values());
  // Sort by date desc
  uniqueNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const markAsRead = useCallback(async (id: string) => {
    try {
      // Optimizacion UI (Optimistic UI)
      setRealtimeNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      await api.patch(`/notifications/${id}/read`);
      mutate();
    } catch (err) {
      console.error('Failed to mark as read', err);
      // Revertir (idealmente)
      mutate();
    }
  }, [mutate]);

  const markAllAsRead = useCallback(async () => {
    try {
      setRealtimeNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      await api.patch('/notifications/read-all');
      mutate();
    } catch (err) {
      console.error('Failed to mark all as read', err);
      mutate();
    }
  }, [mutate]);

  return {
    notifications: uniqueNotifications,
    unreadCount,
    isLoading: !error && !data,
    isError: error,
    markAsRead,
    markAllAsRead,
  };
}
