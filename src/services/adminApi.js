import { getCookie } from '../utils/cookies';

export async function adminApiRequest(endpoint, options = {}) {
  const token = getCookie('adminToken');

  const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData;
  const headers = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint, {
    method: options.method || 'GET',
    headers,
    body: options.body,
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('admin:unauthorized'));
    }

    let message;
    try {
      const body = await response.json();
      message = body.message || body.error || `Request failed with status ${response.status}`;
    } catch {
      message = `Request failed with status ${response.status}`;
    }
    throw new Error(message);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  return response.text();
}
