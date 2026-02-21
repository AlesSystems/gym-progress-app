import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { initializeAuth, getCurrentUser, isFirebaseConfigured } from '../../lib/firebase';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirebaseEnabled: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseEnabled] = useState(isFirebaseConfigured());

  useEffect(() => {
    const init = async () => {
      try {
        if (!isFirebaseEnabled) {
          console.log('[Auth] Firebase not configured - running in offline mode');
          setIsLoading(false);
          return;
        }

        const authenticatedUser = await initializeAuth();
        setUser(authenticatedUser);
      } catch (error) {
        console.error('[Auth] Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [isFirebaseEnabled]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isFirebaseEnabled,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
