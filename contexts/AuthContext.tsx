
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAdminLoggedIn: boolean;
  isUserLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  userLogin: (username: string, password: string) => boolean;
  logout: () => void;
  userLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'afroman2025';

const USER_USERNAME = 'user';
const USER_PASSWORD = 'afroman123';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const userLogin = (username: string, password: string): boolean => {
    if (username === USER_USERNAME && password === USER_PASSWORD) {
      setIsUserLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdminLoggedIn(false);
  };

  const userLogout = () => {
    setIsUserLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isAdminLoggedIn, isUserLoggedIn, login, userLogin, logout, userLogout }}>
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
