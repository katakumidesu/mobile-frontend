import * as SecureStore from 'expo-secure-store';

import { API_BASE_URL } from '../config';

const TOKEN_KEY = 'tquest_auth_token';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

type AuthResponse = {
  user: AuthUser;
  token: string;
};

type ApiError = {
  message?: string;
  errors?: Record<string, string[]>;
};

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
  const data = (await response.json()) as T & ApiError;
  if (!response.ok) {
    const firstFieldError = data.errors
      ? Object.values(data.errors).flat()[0]
      : undefined;
    throw new Error(firstFieldError ?? data.message ?? 'Request failed');
  }
  return data;
}

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = await getStoredToken();
  if (!token) {
    return null;
  }

  const response = await safeFetch(`${API_BASE_URL}/api/auth/user`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    await clearSession();
    return null;
  }

  const data = await parseJson<{ user: AuthUser }>(response);
  return data.user;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const response = await safeFetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await parseJson<AuthResponse>(response);
  await SecureStore.setItemAsync(TOKEN_KEY, data.token);
  return data.user;
}

export async function register(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
): Promise<AuthUser> {
  const response = await safeFetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });

  const data = await parseJson<AuthResponse>(response);
  await SecureStore.setItemAsync(TOKEN_KEY, data.token);
  return data.user;
}

export async function logout(): Promise<void> {
  const token = await getStoredToken();
  if (token) {
    await safeFetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  }
  await clearSession();
}
