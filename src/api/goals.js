import apiClient from '../utils/apiClient';
import { parseApiError } from './errors';

export async function fetchGoals() {
  const response = await apiClient.get('/goals/');
  if (!response.ok) {
    if (response.status === 404) return [];
    throw await parseApiError(response);
  }
  return response.json();
}

export async function createGoal(data) {
  const response = await apiClient.post('/goals/', data);
  if (!response.ok) throw await parseApiError(response);
  return response.json();
}

export async function updateGoal(id, data) {
  const response = await apiClient.put(`/goals/${id}`, data);
  if (!response.ok) throw await parseApiError(response);
  return response.json();
}

export async function deleteGoal(id) {
  const response = await apiClient.delete(`/goals/${id}`);
  if (!response.ok) throw await parseApiError(response);
}
