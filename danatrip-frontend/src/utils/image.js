const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

export const getImageUrl = (url) => {
  if (!url) return '/images/placeholder.jpg';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};
