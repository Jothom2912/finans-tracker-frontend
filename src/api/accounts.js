import apiClient from '../utils/apiClient';
import { parseApiError } from './errors';

export async function fetchAccounts() {
  const response = await apiClient.get('/accounts');
  if (!response.ok) throw await parseApiError(response);
  return response.json();
}

export async function createAccount(data) {
  const response = await apiClient.post('/accounts', data);
  if (!response.ok) throw await parseApiError(response);
  return response.json();
}
