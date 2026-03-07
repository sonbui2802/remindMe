import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

import authService from '../services/auth.service';
// --- 1. Define the TypeScript Interfaces ---
export interface User {
  user_id: number;
  username: string;
  gmail: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (loginInput: string, password: string) => Promise<any>;
  signup: (username: string, gmail: string, password: string) => Promise<any>;
  logout: () => void;
}

// --- 2. Initialize Context with the Type ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 3. Type the Provider Props ---
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Hydrate user on initial load if token exists
useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error('Session hydration failed:', error);
      authService.logout();
    } finally {
      setLoading(false);
    }
  };

  initAuth();
}, [])

  // 2. Login Action
  const login = async (loginInput: string, password: string) => {
  setLoading(true);
  try {
    const { user } = await authService.login(loginInput, password);
    setUser(user);
  } finally {
    setLoading(false);
  }
};

  // 3. Signup Action
  const signup = async (username: string, gmail: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.signup(username, gmail, password);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 4. Logout Action
  const logout = () => {
    authService.logout(); 
    setUser(null);        
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      signup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- 4. Export the Typed Custom Hook ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider. Wrap your <App /> in <AuthProvider>.');
  }
  return context;
};