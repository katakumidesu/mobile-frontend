import { apiUrl, authHeaders, parseJson, safeFetch } from './http';
import type { UserApplication } from './tasks';

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
  rejection_reason?: string | null;
  responded_at?: string | null;
  created_at: string | null;
  applicant: ApplicantSummary;
};

export type TaskApplicationsResponse = {
  task: { id: number; title: string; status: string };
  applications: TaskApplication[];
};

export async function fetchTaskApplications(
  taskId: number,
): Promise<TaskApplicationsResponse> {
  const response = await safeFetch(apiUrl(`/tasks/${taskId}/applications`), {
    headers: await authHeaders(),
  });
  return parseJson<TaskApplicationsResponse>(response);
}

export function canRespondToApplication(
  applicationStatus: string,
  taskStatus: string,
): boolean {
  const taskOpen = taskStatus === 'open';
  const pending = applicationStatus === 'applied' || applicationStatus === 'pending';
  return taskOpen && pending;
}

export async function applyToTask(
  taskId: number,
  payload: { message: string; proposed_price: number },
): Promise<{
  message: string;
  application: UserApplication;
  display_status: string;
}> {
  const response = await safeFetch(apiUrl(`/tasks/${taskId}/applications`), {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJson<{
    message: string;
    application: UserApplication;
    display_status: string;
  }>(response);
}

export async function fetchApplication(
  applicationId: number,
): Promise<
  TaskApplication & {
    task: { id: number; title: string; price: string; status: string };
  }
> {
  const response = await safeFetch(apiUrl(`/applications/${applicationId}`), {
    headers: await authHeaders(),
  });
  const data = await parseJson<{
    application: TaskApplication & {
      task: { id: number; title: string; price: string; status: string };
    };
  }>(response);
  return data.application;
}

export async function hireApplicant(applicationId: number): Promise<{ message: string }> {
  const response = await safeFetch(apiUrl(`/applications/${applicationId}/hire`), {
    method: 'POST',
    headers: await authHeaders(),
  });
  return parseJson<{ message: string }>(response);
}

export async function rejectApplicant(
  applicationId: number,
  reason: string,
): Promise<{ message: string }> {
  const response = await safeFetch(apiUrl(`/applications/${applicationId}/reject`), {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ reason }),
  });
  return parseJson<{ message: string }>(response);
}
