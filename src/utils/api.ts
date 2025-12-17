import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090/api/v1';

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
    return Promise.reject(error);
  }
);

export default api;
