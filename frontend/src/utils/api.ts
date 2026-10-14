/**
 * Helper to obtain the normalized base API URL for the digital twin backend.
 * Ensures compatibility across local development, Docker, and Render production.
 */
export const getApiUrl = (): string => {
  let url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').trim().replace(/\/+$/, '');
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }
  return url;
};
