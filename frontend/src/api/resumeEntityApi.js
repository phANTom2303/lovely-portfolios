import api from './api';

export async function fetchResumeEntities(type) {
  const response = await api.get('/api/re', { params: { type } });
  return response.data.data;
}

export async function createResumeEntity(payload) {
  const response = await api.post('/api/re', payload);
  return response.data.data;
}

export async function updateResumeEntity(payload) {
  const response = await api.patch('/api/re', payload);
  return response.data.data;
}

export async function deleteResumeEntity(reId) {
  const response = await api.delete('/api/re', { params: { re_id: reId } });
  return response.data.data;
}
