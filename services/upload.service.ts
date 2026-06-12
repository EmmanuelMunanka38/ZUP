<<<<<<< HEAD
import { API_ORIGIN, api } from './api';

const toAbsoluteUrl = (url: string) => {
  if (/^https?:\/\//i.test(url)) return url;
  return new URL(url, API_ORIGIN).toString();
};
=======
import { api } from './api';
>>>>>>> main

export const uploadService = {
  async uploadImage(uri: string): Promise<string> {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'photo.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

<<<<<<< HEAD
    formData.append('image', {
=======
    formData.append('file', {
>>>>>>> main
      uri,
      name: filename,
      type: mimeType,
    } as any);

<<<<<<< HEAD
    formData.append('type', 'menu');

=======
>>>>>>> main
    const { data } = await api.post<{ data: { url: string } }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

<<<<<<< HEAD
    return toAbsoluteUrl(data.data.url);
=======
    return data.data.url;
>>>>>>> main
  },
};
