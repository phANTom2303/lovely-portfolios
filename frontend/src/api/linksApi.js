import api from './api';

export async function createLink(payload) {
  const response = await api.post('/api/links', payload);
  return response.data.data;
}

export async function updateLink(payload) {
  const response = await api.patch('/api/links', payload);
  return response.data.data;
}

export async function deleteLink(linkId) {
  const response = await api.delete(`/api/links?link_id=${linkId}`);
  return response.data.data;
}
