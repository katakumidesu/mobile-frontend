import { apiUrl, authHeaders, parseJson, safeFetch } from './http';

export type ApplicantSummary = {
  id: number;
  name: string;
  avatar_url: string | null;
  average_rating: number;
  review_count: number;
  bio: string | null;
  location: string | null;
  tasks_done: number;
  success_rate: number;
  total_earned: number;
};

export type TaskApplication = {
  id: number;
  task_id: number;
  message: string | null;
  proposed_price: string | null;
  status: string;
  created_at: string | null;
  applicant: ApplicantSummary;
};

export async function fetchTaskApplications(
  taskId: number,
): Promise<TaskApplication[]> {
  const response = await safeFetch(apiUrl(`/tasks/${taskId}/applications`), {
    headers: await authHeaders(),
  });
  const data = await parseJson<{ applications: TaskApplication[] }>(response);
  return data.applications;
}

export async function applyToTask(
  taskId: number,
  payload: { message: string; proposed_price: number },
): Promise<{ message: string }> {
  const response = await safeFetch(apiUrl(`/tasks/${taskId}/applications`), {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJson<{ message: string }>(response);
}

export async function fetchApplication(
  applicationId: number,
): Promise<TaskApplication & { task: { id: number; title: string; price: string } }> {
  const response = await safeFetch(apiUrl(`/applications/${applicationId}`), {
    headers: await authHeaders(),
  });
  const data = await parseJson<{ application: TaskApplication & { task: { id: number; title: string; price: string } } }>(response);
  return data.application;
}
