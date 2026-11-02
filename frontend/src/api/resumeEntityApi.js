import api from './api';
import { uploadImageAsset } from './assetsApi';

export async function fetchResumeEntities(type) {
    const response = await api.get('/api/re', { params: { type } });
    return response.data.data;
}

export async function createResumeEntity(payload) {
    const response = await api.post('/api/re', payload);
    console.log(response.data.data);
    return response.data.data;
}

export async function uploadResumeEntityImages(images, reId) {
    const uploadedImages = [];

    for (const image of images) {
        if (!image.file) continue;

        const formData = new FormData();
        formData.append('title', image.title || 'Image');
        formData.append('asset_type', 'image');
        formData.append('re_id', String(reId));
        if (image.description) formData.append('description', image.description);
        formData.append('assets', image.file);

        uploadedImages.push(await uploadImageAsset(formData));
    }

    return uploadedImages;
}

export async function updateResumeEntity(payload) {
    const response = await api.patch('/api/re', payload);
    return response.data.data;
}

export async function deleteResumeEntity(reId) {
    const response = await api.delete('/api/re', { params: { re_id: reId } });
    return response.data.data;
}
