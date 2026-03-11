import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // For HttpOnly refresh-token cookie
  timeout: 25000,         // 25 s – gives Neon cold-start time to wake up
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const getLoginRedirectUrl = (): string => {
  const role    = localStorage.getItem('role');
  const isKiosk = localStorage.getItem('isKiosk') === 'true';
  if (role === 'super_admin') return '/superadmin/login';
  if (isKiosk) return '/kiosk/login';
  return '/login';
};

const clearAuthData = () =>
  ['token', 'user', 'tenant', 'role', 'isKiosk', 'mustChangePassword'].forEach((k) =>
    localStorage.removeItem(k)
  );

// ─── Request interceptor – attach JWT ────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ────────────────────────────────────────────────────

api.interceptors.response.use(
  // SUCCESS: normalise pagination meta so every service can read top-level fields
  (response) => {
    if (response.data?.meta) {
      const m = response.data.meta;
      if (response.data.total       === undefined) response.data.total       = m.total;
      if (response.data.page        === undefined) response.data.page        = m.page;
      if (response.data.per_page    === undefined) response.data.per_page    = m.per_page;
      if (response.data.total_pages === undefined) response.data.total_pages = m.total_pages;
    }
    return response;
  },

  // ERROR HANDLING
  async (error) => {
    const req = error.config;
    if (!req) return Promise.reject(error);

    const url            = req.url ?? '';
    const isAuthEndpoint = url.includes('/auth/login') ||
                           url.includes('/auth/check-email') ||
                           url.includes('/auth/refresh-token');
    const status         = error.response?.status as number | undefined;

    // ── 401: try a token refresh exactly once ──────────────────────────────
    if (status === 401 && !req._authRetried && !isAuthEndpoint) {
      req._authRetried = true;
      try {
        const res    = await api.post('/auth/refresh-token');
        const { token } = res.data.data;
        localStorage.setItem('token', token);
        req.headers['Authorization'] = `Bearer ${token}`;
        return api(req);
      } catch {
        clearAuthData();
        window.dispatchEvent(
          new CustomEvent('api-error', {
            detail: {
              status: 401,
              redirectUrl: getLoginRedirectUrl(),
              message: 'Session expired. Please login again.',
            },
          })
        );
        return Promise.reject(error);
      }
    }

    // ── 429: surface to UI ─────────────────────────────────────────────────
    if (status === 429) {
      const retryAfter = error.response?.headers?.['retry-after'];
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: {
            status: 429,
            message: `Too many attempts. Please try again ${retryAfter ? 'in ' + retryAfter + ' seconds' : 'later'}.`,
          },
        })
      );
      return Promise.reject(error);
    }

    // ── 5xx or network error: retry with exponential back-off ──────────────
    // Covers Neon serverless cold-starts (DB wakes slowly → 503/502/ETIMEDOUT)
    const isServerError  = status !== undefined && status >= 500;
    const isNetworkError = !error.response; // includes Axios timeout (ECONNABORTED)

    if ((isServerError || isNetworkError) && !isAuthEndpoint) {
      req._serverRetries = (req._serverRetries ?? 0) + 1;

      if (req._serverRetries <= 4) {
        // Back-off: 1 s, 2 s, 4 s, 8 s
        const waitMs = Math.min(1000 * 2 ** (req._serverRetries - 1), 8000);
        console.warn(
          `[API] ${isNetworkError ? 'Network/timeout error' : `HTTP ${status}`} – ` +
          `retrying ${url} in ${waitMs} ms (attempt ${req._serverRetries}/4)`
        );
        await sleep(waitMs);
        return api(req);
      }
    }

    return Promise.reject(error);
  }
);

// ─── Utility exports ──────────────────────────────────────────────────────────

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response = await api.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
    const data = response.data;
    if (data && typeof data === 'object') {
      if ('data' in data && (data as any).data && 'available' in (data as any).data)
        return !((data as any).data.available);
      if ('available' in data)
        return !data.available;
    }
    return false;
  } catch {
    return false;
  }
};

export default api;
