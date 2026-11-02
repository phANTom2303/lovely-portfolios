import api from './api';

export async function updateUser(payload) {
  const response = await api.patch('/api/user', payload);
  return response.data.data;
}