import axios from 'axios';
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';

// Export the key here to avoid circular dependencies with auth.service
export const TOKEN_KEY = 'accessToken';

const api = axios.create({
  baseURL:'https://remindme-backend-5sr5.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token if present (but do NOT manage its lifecycle)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Pass responses through untouched. 
// (Auth-specific error handling is injected by auth.service.ts)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => Promise.reject(error)
);

export default api;