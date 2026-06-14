import { API_ORIGIN, api } from './api';

const toAbsoluteUrl = (url: string) => {
  if (/^https?:\/\//i.test(url)) return url;
  return new URL(url, API_ORIGIN).toString();
};

export const uploadService = {
  async uploadImage(uri: string): Promise<string> {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'photo.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    formData.append('image', {
      uri,
      name: filename,
      type: mimeType,
    } as any);

    formData.append('type', 'menu');

    const { data } = await api.post<{ data: { url: string } }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return toAbsoluteUrl(data.data.url);
  },
};
