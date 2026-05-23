import { API_BASE_URL } from '../config';
import { getStoredToken } from './auth';

export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getStoredToken();
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function safeFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error(
        'Connection timed out. Make sure the backend server is running.',
      );
    }
    throw new Error('Could not connect to the server.');
  } finally {
    clearTimeout(timeout);
  }
}

export async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    const firstFieldError = data.errors
      ? Object.values(data.errors as Record<string, string[]>).flat()[0]
      : undefined;
    throw new Error(firstFieldError ?? data.message ?? 'Request failed');
  }
  return data as T;
}

export function apiUrl(path: string): string {
  return `${API_BASE_URL}/api${path}`;
}
