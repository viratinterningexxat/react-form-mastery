import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export type UserRole = 'student' | 'approver' | 'clinical_site' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  university?: string;
  organization?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  university?: string;
  organization?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useLocalStorage<User | null>('auth_user', null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock authentication - in real app, this would call an API
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data based on email
      let mockUser: User;
      if (email.includes('student')) {
        mockUser = {
          id: '1',
          email,
          name: 'John Student',
          role: 'student',
          university: 'University of Example'
        };
      } else if (email.includes('approver')) {
        mockUser = {
          id: '2',
          email,
          name: 'Jane Approver',
          role: 'approver',
          organization: 'Example Hospital'
        };
      } else if (email.includes('clinical')) {
        mockUser = {
          id: '3',
          email,
          name: 'Bob Clinical',
          role: 'clinical_site',
          organization: 'Clinical Partners Inc'
        };
      } else {
        mockUser = {
          id: '4',
          email,
          name: 'Admin User',
          role: 'admin'
        };
      }

      setUser(mockUser);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        university: userData.university,
        organization: userData.organization,
      };

      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}