/**
 * Utilitaire pour formater correctement les URLs des images
 * Résout les chemins relatifs /uploads/... vers l'hôte backend (http://localhost:5000)
 */

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const BACKEND_HOST = API_URL.replace(/\/api\/?$/, '');

export const getImageUrl = (url, fallback = '') => {
  if (!url || typeof url !== 'string') return fallback;
  
  // URLs distantes, données base64 ou blobs locaux
  if (
    url.startsWith('blob:') ||
    url.startsWith('data:') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }

  let clean = url.replace(/\\/g, '/');
  if (!clean.startsWith('/')) {
    clean = '/' + clean;
  }

  return `${BACKEND_HOST}${clean}`;
};

export default getImageUrl;
