import api from './api';

export async function fetchEducation(educationId) {
    const params = educationId === undefined ? undefined : { edu_id: educationId };
    const response = await api.get('/api/education', { params });
    return response.data.data;
}

export async function createEducation(payload) {
    console.log(payload);
    const response = await api.post('/api/education', payload);
    return response.data.data;
}

export async function updateEducation(payload) {
    const response = await api.patch('/api/education', payload);
    return response.data.data;
}

export async function deleteEducation(educationId) {
    const response = await api.delete('/api/education', {
        params: { edu_id: educationId },
    });
    return response.data.data;
}
