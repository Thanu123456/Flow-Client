import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For HttpOnly cookies
});

// Request interceptor for adding the auth token (if stored in localStorage/memory instead of cookies)
// Requirements say HttpOnly secure cookies, so we might not need to attach Authorization header manually
// but often standard JWT implementations still use the header. Use cookie for refresh token.
// Let's assume we might need it, or we rely on cookies. The generic requirement mentions "Generate JWT token".
// Usually, access token is sent via Header, Refresh token via Cookie.
// Let's add the interceptor to be safe, checking localStorage.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt refresh
        const response = await api.post('/auth/refresh-token');
        const { token } = response.data.data; // Adjust based on actual response structure
        localStorage.setItem('token', token);
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      // You might want to expose this to the UI via a custom event or store
      const event = new CustomEvent('api-error', { 
        detail: { 
          status: 429, 
          message: `Too many attempts. Please try again ${retryAfter ? 'in ' + retryAfter + ' seconds' : 'later'}.` 
        } 
      });
      window.dispatchEvent(event);
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// Check email existence
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response = await api.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
    // API returns { available: boolean } or { data: { available: boolean } }
    // If available is true, it does NOT exist.
    const data = response.data;
    if (data && typeof data === 'object') {
       if ('data' in data && (data as any).data && 'available' in (data as any).data) {
           return !((data as any).data.available);
       }
       if ('available' in data) {
           return !(data.available); // available: true -> exists: false
       }
    }
    return false;
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
};

export default api;
