/**
 * Unified API Client for centralized network requests.
 * Handles automatic JWT injection and base URL resolution.
 */

const getBaseUrl = () => {
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
  return rawApiUrl.startsWith('http') ? rawApiUrl : `https://${rawApiUrl}`;
};

const getAuthHeaders = (isFormData: boolean) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do NOT set Content-Type for FormData, the browser handles the multipart boundary automatically
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

const handleResponse = async (res: Response) => {
  // If the response has no content (e.g. 204 No Content), return null
  if (res.status === 204) return null;

  // Global 401 Interceptor: Expired or missing tokens
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const fallbackMessage = "A network anomaly occurred. Please try again or contact support.";
    throw new Error((data && data.message) || fallbackMessage);
  }

  return data;
};

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  post: async (endpoint: string, body: any) => {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },

  put: async (endpoint: string, body: any) => {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },

  delete: async (endpoint: string) => {
    const res = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  }
};
