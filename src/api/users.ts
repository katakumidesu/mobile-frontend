import { ApplicantSummary } from './applications';
import { apiUrl, authHeaders, parseJson, safeFetch } from './http';

export async function fetchUserProfile(userId: number): Promise<ApplicantSummary> {
  const response = await safeFetch(apiUrl(`/users/${userId}`), {
    headers: await authHeaders(),
  });
  const data = await parseJson<{ user: ApplicantSummary }>(response);
  return data.user;
}
