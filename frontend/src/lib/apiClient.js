const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_RETRIES = 1;
export const LOCAL_DEMO_TOKEN = 'local-demo-mode';

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getAuthToken() {
  return localStorage.getItem('auth_token');
}

export function isLocalDemoToken(token = getAuthToken()) {
  return token === LOCAL_DEMO_TOKEN;
}

export function setAuthToken(token) {
  if (!token) {
    localStorage.removeItem('auth_token');
    window.dispatchEvent(new Event('auth-token-changed'));
    return;
  }
  localStorage.setItem('auth_token', token);
  window.dispatchEvent(new Event('auth-token-changed'));
}

export async function apiFetch(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured.');
  }

  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const retries = typeof options.retries === 'number' ? options.retries : DEFAULT_RETRIES;
  const timeoutMs = typeof options.timeoutMs === 'number' ? options.timeoutMs : DEFAULT_TIMEOUT_MS;

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);

      const isJson = (response.headers.get('content-type') || '').includes('application/json');
      const payload = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const message =
          (typeof payload === 'object' && payload && payload.message) ||
          (typeof payload === 'string' && payload) ||
          `Request failed with status ${response.status}`;

        if (response.status === 401 && token && !path.startsWith('/auth/')) {
          setAuthToken(null);
        }

        if (response.status >= 500 && attempt < retries) {
          lastError = new Error(message);
          continue;
        }

        throw new Error(message);
      }

      return payload;
    } catch (error) {
      clearTimeout(timer);

      const isAbort = error?.name === 'AbortError';
      const retryableNetworkError = isAbort || error instanceof TypeError;

      if (retryableNetworkError && attempt < retries) {
        lastError = error;
        continue;
      }

      if (isAbort) {
        throw new Error('Request timed out. Please try again.');
      }

      if (error instanceof TypeError) {
        throw new Error(`Cannot reach backend at ${API_BASE_URL}. Start backend and retry.`);
      }

      throw error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('Request failed unexpectedly.');
}
