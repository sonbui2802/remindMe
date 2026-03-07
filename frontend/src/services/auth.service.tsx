import api, { TOKEN_KEY } from './api';
import axios from 'axios';

// -------- Types --------

export interface User {
  user_id: number;
  username: string;
  gmail: string;
  role: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface RegisterResponse {
  userId: number;
}

export interface AuthError {
  type: 'UNAUTHORIZED' | 'VALIDATION' | 'NETWORK' | 'UNKNOWN';
  message: string;
}

// -------- Helpers --------

const parseAuthError = (error: any): AuthError => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message || error.response?.data?.error;

    if (status === 401) {
      return { type: 'UNAUTHORIZED', message: backendMessage || 'Invalid credentials or session expired' };
    }

    if (status === 400) {
      return { type: 'VALIDATION', message: backendMessage || 'Invalid input data' };
    }

    return { type: 'NETWORK', message: 'Server unreachable' };
  }

  return { type: 'UNKNOWN', message: 'Unexpected error' };
};

// -------- Service --------

const authService = {
  async login(loginInput: string, password: string): Promise<LoginResponse> {
    try {
      const res = await api.post('/auth/login', {
        loginInput,
        password,
      });

      const { user, accessToken } = res.data.data;

      localStorage.setItem(TOKEN_KEY, accessToken);

      return { user, accessToken };
    } catch (err) {
      throw parseAuthError(err);
    }
  },

  async signup(
    username: string,
    gmail: string,
    password: string
  ): Promise<RegisterResponse> {
    try {
      const res = await api.post('/auth/register', {
        username,
        gmail,
        password,
      });

      return { userId: res.data.data.userId };
    } catch (err) {
      throw parseAuthError(err);
    }
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  async getCurrentUser(): Promise<User> {
    try {
      const res = await api.get('/users/me');
      return res.data.data;
    } catch (err) {
      const parsed = parseAuthError(err);

      if (parsed.type === 'UNAUTHORIZED') {
        authService.logout();
      }

      throw parsed;
    }
  },
};

// -------- Global 401 Interceptor Injection --------
api.interceptors.response.use(
  (response: any) => response, 
  (error: any) => {            
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const originalRequestUrl = error.config?.url || '';
      
      // GUARD: Only auto-logout for session-based endpoints, not auth endpoints
      const isAuthEndpoint = originalRequestUrl.includes('/auth/login') || originalRequestUrl.includes('/auth/register');

      if (!isAuthEndpoint) {
        authService.logout();
        
        // Kick the user back to the login page if their token dies mid-session
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default authService;