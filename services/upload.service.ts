import { api } from './api';

export const uploadService = {
  async uploadImage(uri: string): Promise<string> {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'photo.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    formData.append('file', {
      uri,
      name: filename,
      type: mimeType,
    } as any);

    const { data } = await api.post<{ data: { url: string } }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.data.url;
  },
};
