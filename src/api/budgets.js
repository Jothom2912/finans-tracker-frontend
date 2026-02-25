import apiClient from '../utils/apiClient';
import { parseApiError } from './errors';

export async function fetchBudgets(params = {}) {
  const query = new URLSearchParams();
  if (params.year) query.set('year', params.year);

  const url = `/budgets/${query.toString() ? `?${query}` : ''}`;
  const response = await apiClient.get(url);
  if (!response.ok) {
    if (response.status === 404) return [];
    throw await parseApiError(response);
  }
  return response.json();
}

export async function createBudget(data) {
  const response = await apiClient.post('/budgets/', data);
  if (!response.ok) throw await parseApiError(response);
  return response.json();
}

export async function updateBudget(id, data) {
  const response = await apiClient.put(`/budgets/${id}`, data);
  if (!response.ok) throw await parseApiError(response);
  return response.json();
}

export async function deleteBudget(id) {
  const response = await apiClient.delete(`/budgets/${id}`);
  if (!response.ok) throw await parseApiError(response);
}

export async function fetchBudgetSummary({ month, year }) {
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  const response = await apiClient.get(`/budgets/summary?month=${m}&year=${y}`);
  if (!response.ok) throw await parseApiError(response);
  return response.json();
}
