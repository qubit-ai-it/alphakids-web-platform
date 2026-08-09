import { useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { api, BASE_URL } from '@/shared/lib/api-client';
import { NotificationsResponse } from '@/shared/lib/types';
import { useAuth } from './useAuth';
import { authService } from '@/features/auth/services/auth.service';

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const token = authService.getToken();

  const fetcher = (url: string) => api.get<NotificationsResponse>(url);

  const { data, error, mutate } = useSWR<NotificationsResponse>(
    isAuthenticated ? '/notifications' : null,
    fetcher,
    { refreshInterval: 0, revalidateOnFocus: true }
  );

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // EventSource cannot send authorization headers, so the token remains in the query string for now.
    const url = `${BASE_URL}/notifications/stream?token=${token}`;
    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'STUDENT_PENDING' && parsed.notification) {
          mutate((current) => {
            const notification = parsed.notification;

            if (!current) {
              return {
                items: [notification],
                unreadCount: 1,
                total: 1,
              };
            }

            const alreadyExists = current.items.some((item) => item.id === notification.id);
            const notifications = [notification, ...current.items];
            const uniqueNotifications = Array.from(
              new Map(notifications.map((item) => [item.id, item])).values()
            );

            return {
              ...current,
              items: uniqueNotifications,
              unreadCount: alreadyExists ? current.unreadCount : current.unreadCount + 1,
              total: alreadyExists ? current.total : current.total + 1,
            };
          }, { revalidate: false });
        }
      } catch (e) {
        console.error('Failed to parse SSE', e);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error', err);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [isAuthenticated, token, mutate]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      mutate((current) => {
        if (!current) return current;
        const notification = current.items.find((item) => item.id === id);
        if (!notification || notification.isRead) return current;

        return {
          ...current,
          items: current.items.map((item) => item.id === id ? { ...item, isRead: true } : item),
          unreadCount: Math.max(0, current.unreadCount - 1),
        };
      }, { revalidate: false });

      await api.patch(`/notifications/${id}/read`);
      await mutate();
    } catch (err) {
      console.error('Failed to mark as read', err);
      await mutate();
    }
  }, [mutate]);

  const markAllAsRead = useCallback(async () => {
    mutate((current) => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.map((item) => ({ ...item, isRead: true })),
        unreadCount: 0,
      };
    }, { revalidate: false });

    try {
      await api.patch('/notifications/read-all');
      await mutate();
    } catch (err) {
      console.error('Failed to mark all as read', err);
      await mutate();
    }
  }, [mutate]);

  const notifications = data?.items ?? [];

  return {
    notifications,
    unreadCount: data?.unreadCount ?? 0,
    isLoading: !error && !data,
    isError: error,
    markAsRead,
    markAllAsRead,
  };
}
