import api from './api';

export async function fetchProfileSkills() {
  const response = await api.get('/api/skills/params');
  return response.data.data;
}

export async function fetchRESkills(reId) {
  const response = await api.get(`/api/skills/params?re_id=${reId}`);
  return response.data.data;
}

export async function createSkill(payload) {
  // payload: { skill_name, re_id? }
  const response = await api.post('/api/skills', payload);
  return response.data.data;
}

export async function updateSkill(payload) {
  // payload: { skill_id, skill_name }
  const response = await api.patch('/api/skills', payload);
  return response.data.data;
}

export async function deleteSkill(skillId) {
  const response = await api.delete(`/api/skills?skill_id=${skillId}`);
  return response.data.data;
}
