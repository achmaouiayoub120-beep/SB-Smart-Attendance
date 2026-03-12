/**
 * Authentication Context
 * 
 * Provides authentication state management for the entire application.
 * Uses React Context + AsyncStorage for session persistence.
 * 
 * In a production environment, this would connect to a backend API.
 * Currently uses mock users for demonstration purposes.
 * 
 * Usage:
 *   Wrap your app with <AuthProvider> in _layout.tsx
 *   Access auth state with: const { user, login, logout } = useAuth();
 * 
 * @module context/auth-context
 */
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Student, Professor, Admin } from '@/src/types';

// ─────────────────────────────────────────────
// Mock Users (replace with API calls in production)
// ─────────────────────────────────────────────
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'student@estsb.ma',
    firstName: 'Ahmed',
    lastName: 'El Amrani',
    role: 'student',
    studentId: 'S2023001',
    department: 'Informatique',
    createdAt: new Date('2023-09-01'),
  } as Student,
  {
    id: '2',
    email: 'prof@estsb.ma',
    firstName: 'Dr. Fatima',
    lastName: 'Benali',
    role: 'professor',
    department: 'Informatique',
    createdAt: new Date('2020-09-01'),
  } as Professor,
  {
    id: '3',
    email: 'admin@estsb.ma',
    firstName: 'Mohammed',
    lastName: 'Tahiri',
    role: 'admin',
    createdAt: new Date('2018-01-01'),
  } as Admin,
];

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

// ─────────────────────────────────────────────
// Context + Provider
// ─────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Custom hook to access authentication context.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Authentication provider component.
 * Manages login, logout, profile updates, and password changes.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Load stored auth state on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('estsb_user');
        if (storedUser) {
          const user = JSON.parse(storedUser) as User;
          setState({
            user,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    void loadAuthState();
  }, []);

  /**
   * Authenticate a user with email and password.
   * In production, this would call a backend authentication endpoint.
   */
  const login = useCallback(async (email: string, password: string, rememberMe = false): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate network delay (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find matching user in mock database
      const user = MOCK_USERS.find(u => u.email === email);

      if (!user || password !== 'password') {
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }

      // Persist session if "remember me" is enabled
      if (rememberMe) {
        await AsyncStorage.setItem('estsb_user', JSON.stringify(user));
      }

      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Une erreur est survenue' };
    }
  }, []);

  /**
   * Log the current user out and clear persisted session.
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('estsb_user');
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  /**
   * Update the current user's profile information.
   */
  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      if (!state.user) return;

      const updatedUser = { ...state.user, ...data };
      await AsyncStorage.setItem('estsb_user', JSON.stringify(updatedUser));

      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      console.error('Update profile error:', error);
    }
  }, [state.user]);

  /**
   * Change the current user's password.
   * Validates the old password before applying the change.
   */
  const changePassword = useCallback(async (oldPassword: string, _newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      if (oldPassword !== 'password') {
        return { success: false, error: 'Ancien mot de passe incorrect' };
      }

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Une erreur est survenue' };
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    ...state,
    login,
    logout,
    updateProfile,
    changePassword,
  }), [state, login, logout, updateProfile, changePassword]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
