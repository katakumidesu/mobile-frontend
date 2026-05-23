import { apiUrl, authHeaders, parseJson, safeFetch } from './http';

export type DashboardStats = {
  tasks_posted: number;
  tasks_completed: number;
  average_rating: number;
};

export type RecentApplicant = {
  application_id: number;
  task_id: number;
  task_title: string | null;
  worker_id: number;
  name: string;
  avatar_url: string | null;
  average_rating: number;
  created_at: string | null;
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await safeFetch(apiUrl('/dashboard/stats'), {
    headers: await authHeaders(),
  });
  return parseJson<DashboardStats>(response);
}

export async function fetchRecentApplicants(): Promise<RecentApplicant[]> {
  const response = await safeFetch(apiUrl('/dashboard/recent-applicants'), {
    headers: await authHeaders(),
  });
  const data = await parseJson<{ applicants: RecentApplicant[] }>(response);
  return data.applicants;
}
