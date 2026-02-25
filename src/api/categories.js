import apiClient from '../utils/apiClient';
import { parseApiError } from './errors';

export async function fetchCategories() {
  const response = await apiClient.get('/categories/');
  if (!response.ok) throw await parseApiError(response);
  return response.json();
}

export async function createCategory(data) {
  const response = await apiClient.post('/categories/', data);
  if (!response.ok) throw await parseApiError(response);
  return response.json();
}

export async function updateCategory(id, data) {
  const response = await apiClient.put(`/categories/${id}`, data);
  if (!response.ok) throw await parseApiError(response);
  return response.json();
}

export async function deleteCategory(id) {
  const response = await apiClient.delete(`/categories/${id}`);
  if (!response.ok) throw await parseApiError(response);
}
