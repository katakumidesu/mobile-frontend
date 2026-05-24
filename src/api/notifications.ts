import { apiUrl, authHeaders, parseJson, safeFetch } from './http';

export type AppNotification = {
  id: number;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, any> | null;
  read_at: string | null;
  created_at: string;
};

export async function fetchNotifications(): Promise<{
  unread_count: number;
  notifications: AppNotification[];
}> {
  const response = await safeFetch(apiUrl('/notifications'), {
    headers: await authHeaders(),
  });
  return parseJson<{
    unread_count: number;
    notifications: AppNotification[];
  }>(response);
}

export async function markNotificationRead(id: number): Promise<void> {
  const response = await safeFetch(apiUrl(`/notifications/${id}/read`), {
    method: 'POST',
    headers: await authHeaders(),
  });
  await parseJson<{ message: string }>(response);
}

export async function markAllNotificationsRead(): Promise<void> {
  const response = await safeFetch(apiUrl('/notifications/read-all'), {
    method: 'POST',
    headers: await authHeaders(),
  });
  await parseJson<{ message: string }>(response);
}

