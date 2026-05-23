import { API_BASE_URL } from '../config';
import { getStoredToken } from './auth';

export type Task = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  price: string;
  location: string;
  deadline: string | null;
  status: 'open' | 'in_progress' | 'completed';
  category: string | null;
  created_at: string;
  user?: { id: number; name: string };
};

export type PaginatedTasks = {
  data: Task[];
  current_page: number;
  last_page: number;
  total: number;
};

export type CreateTaskPayload = {
  title: string;
  description: string;
  price: number;
  location: string;
  deadline?: string | null;
  category?: string | null;
};

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getStoredToken();
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function safeFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return response;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error(
        'Connection timed out. Make sure the backend server is running and your device is on the same Wi-Fi network.',
      );
    }
    throw new Error(
      'Could not connect to the server. Please check that:\n• The backend is running (php artisan serve --host=0.0.0.0)\n• Your phone is on the same Wi-Fi network as your PC',
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    const firstFieldError = data.errors
      ? Object.values(data.errors as Record<string, string[]>).flat()[0]
      : undefined;
    throw new Error(firstFieldError ?? data.message ?? 'Request failed');
  }
  return data as T;
}

export async function fetchTasks(params?: {
  search?: string;
  category?: string;
  mine?: boolean;
}): Promise<PaginatedTasks> {
  const headers = await authHeaders();
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.category) qs.set('category', params.category);
  if (params?.mine) qs.set('mine', '1');

  const url = `${API_BASE_URL}/api/tasks${qs.toString() ? `?${qs}` : ''}`;
  const response = await safeFetch(url, { headers });
  return parseJson<PaginatedTasks>(response);
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const headers = await authHeaders();
  const response = await safeFetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ task: Task }>(response);
  return data.task;
}

export async function fetchTask(id: number): Promise<Task> {
  const headers = await authHeaders();
  const response = await safeFetch(`${API_BASE_URL}/api/tasks/${id}`, { headers });
  const data = await parseJson<{ task: Task }>(response);
  return data.task;
}
