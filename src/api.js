const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE_URL = configuredApiUrl
  ? configuredApiUrl.replace(/\/+$/, '')
  : import.meta.env.DEV
    ? 'http://localhost:8080'
    : '';

export async function apiFetch(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('Backend API URL is not configured. Set VITE_API_URL and redeploy.');
  }

  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem('token');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('user');
    localStorage.removeItem('signId');
    localStorage.removeItem('token');
  }

  return response;
}

export { API_BASE_URL };
