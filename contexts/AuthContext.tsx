
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAdminLoggedIn: boolean;
  isSubscribed: boolean;
  isGuest: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setGuestMode: (isGuest: boolean) => void;
  subscribe: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'afroman2025';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdminLoggedIn(false);
    setIsSubscribed(false);
    setIsGuest(false);
  };

  const setGuestMode = (guest: boolean) => {
    setIsGuest(guest);
  };

  const subscribe = () => {
    setIsSubscribed(true);
  };

  return (
    <AuthContext.Provider value={{ 
      isAdminLoggedIn, 
      isSubscribed, 
      isGuest, 
      login, 
      logout, 
      setGuestMode,
      subscribe 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
