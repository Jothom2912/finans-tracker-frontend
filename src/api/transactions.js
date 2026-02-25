import apiClient from '../utils/apiClient';
import { parseApiError } from './errors';

export async function fetchTransactions({ startDate, endDate, categoryId } = {}) {
  let url = `/transactions/?start_date=${startDate}&end_date=${endDate}`;
  if (categoryId) url += `&category_id=${categoryId}`;

  const response = await apiClient.get(url);
  if (!response.ok) throw await parseApiError(response);
  return response.json();
}

export async function createTransaction(data) {
  const response = await apiClient.post('/transactions/', data);
  if (!response.ok) throw await parseApiError(response);
  return response.json();
}

export async function updateTransaction(id, data) {
  const response = await apiClient.put(`/transactions/${id}`, data);
  if (!response.ok) throw await parseApiError(response);
  return response.json();
}

export async function deleteTransaction(id) {
  const response = await apiClient.delete(`/transactions/${id}`);
  if (!response.ok) throw await parseApiError(response);
}

export async function uploadTransactionsCsv(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.fetch('/transactions/upload-csv/', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw await parseApiError(response);
  return response.json();
}
