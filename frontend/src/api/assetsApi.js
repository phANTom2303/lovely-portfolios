import api from './api';

export async function getAllAssets() {
  const response = await api.get('/api/assets');
  return response.data.data;
}

export async function createYoutubeAsset(payload) {
  // payload: { title, asset_type: 'youtube', link, re_id?, description? }
  const response = await api.post('/api/assets', payload);
  return response.data.data;
}

export async function uploadImageAsset(formPayload) {
  // formPayload is a FormData object
  const response = await api.post('/api/assets/image', formPayload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function updateAsset(payload) {
  // payload: { asset_id, title?, link?, description?, asset_type? }
  const response = await api.patch('/api/assets', payload);
  return response.data.data;
}

export async function deleteAsset(assetId) {
  const response = await api.delete(`/api/assets?asset_id=${assetId}`);
  return response.data.data;
}
