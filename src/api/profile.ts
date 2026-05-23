import { apiUrl, authHeaders, parseJson, safeFetch } from './http';

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  average_rating: number;
  review_count: number;
  total_earned: number;
  tasks_done: number;
  success_rate: number;
  tasks_posted: number;
  tasks_completed: number;
};

export async function fetchProfile(): Promise<UserProfile> {
  const response = await safeFetch(apiUrl('/profile'), {
    headers: await authHeaders(),
  });
  const data = await parseJson<{ profile: UserProfile }>(response);
  return data.profile;
}

export async function updateProfile(payload: {
  name?: string;
  phone?: string | null;
  bio?: string | null;
  location?: string | null;
  avatar_url?: string | null;
}): Promise<UserProfile> {
  const response = await safeFetch(apiUrl('/profile'), {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ profile: UserProfile }>(response);
  return data.profile;
}
