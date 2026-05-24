import { API_BASE_URL } from '../config';
import { getStoredToken } from './auth';
import type { TaskPermissions } from '../utils/taskPermissions';

export type UserApplication = {
  id: number;
  status: 'applied' | 'pending' | 'accepted' | 'declined';
  proposed_price: string;
  message?: string;
  rejection_reason?: string | null;
  responded_at?: string | null;
  created_at: string | null;
};

export type Task = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  price: string;
  location: string;
  deadline: string | null;
  status: 'open' | 'occupied' | 'in_progress' | 'completed' | 'paid' | 'applied';
  category: string | null;
  created_at: string;
  user?: { id: number; name: string };
  user_application?: UserApplication | null;
  display_status?: string;
  permissions?: import('../utils/taskPermissions').TaskPermissions;
};

export type HiredWorker = {
  application_id: number;
  user: {
    id: number;
    name: string;
    avatar_url: string | null;
    average_rating: number;
    review_count: number;
  };
};

export type TaskDetailResponse = {
  task: Task;
  permissions: TaskPermissions;
  user_application: UserApplication | null;
  display_status: string;
  hired_worker?: HiredWorker | null;
};

export type CompleteTaskPayload = {
  rating: number;
  comment: string;
};

export type UpdateTaskPayload = {
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  deadline?: string | null;
  category?: string | null;
  status?: Task['status'];
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

export async function fetchTaskDetail(id: number): Promise<TaskDetailResponse> {
  const headers = await authHeaders();
  const response = await safeFetch(`${API_BASE_URL}/api/tasks/${id}`, { headers });
  return parseJson<TaskDetailResponse>(response);
}

export async function fetchTask(id: number): Promise<Task> {
  const { task } = await fetchTaskDetail(id);
  return task;
}

export async function updateTask(
  id: number,
  payload: UpdateTaskPayload,
): Promise<TaskDetailResponse> {
  const headers = await authHeaders();
  const response = await safeFetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  return parseJson<TaskDetailResponse>(response);
}

export async function completeTask(
  id: number,
  payload: CompleteTaskPayload,
): Promise<{ message: string; task: Task }> {
  const headers = await authHeaders();
  const response = await safeFetch(`${API_BASE_URL}/api/tasks/${id}/complete`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return parseJson<{ message: string; task: Task }>(response);
}

export async function deleteTask(id: number): Promise<void> {
  const headers = await authHeaders();
  const response = await safeFetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE',
    headers,
  });
  await parseJson<{ message: string }>(response);
}
