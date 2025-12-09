
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAdminLoggedIn: boolean;
  isSubscribed: boolean;
  isGuest: boolean;
  paymentPending: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setGuestMode: (isGuest: boolean) => void;
  verifyPayment: (verificationCode: string) => Promise<boolean>;
  setPaymentPending: (pending: boolean) => void;
  checkSubscriptionStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'afroman2025';
const SUBSCRIPTION_KEY = '@afroman_subscription';
const PAYMENT_PENDING_KEY = '@afroman_payment_pending';

// Valid verification codes that would be provided after successful Stripe payment
// In a real app, these would be generated server-side and validated against Stripe
const VALID_VERIFICATION_CODES = [
  'AFROMAN2025',
  'PREMIUM2025',
  'EXCLUSIVE2025',
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [paymentPending, setPaymentPendingState] = useState(false);

  // Load subscription status on mount
  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const subscriptionStatus = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      const pendingStatus = await AsyncStorage.getItem(PAYMENT_PENDING_KEY);
      
      if (subscriptionStatus === 'active') {
        setIsSubscribed(true);
        console.log('Subscription status loaded: active');
      }
      
      if (pendingStatus === 'true') {
        setPaymentPendingState(true);
        console.log('Payment pending status loaded');
      }
    } catch (error) {
      console.log('Error loading subscription status:', error);
    }
  };

  const checkSubscriptionStatus = async () => {
    await loadSubscriptionStatus();
  };

  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      console.log('Admin logged in successfully');
      return true;
    }
    console.log('Login failed: invalid credentials');
    return false;
  };

  const logout = async () => {
    setIsAdminLoggedIn(false);
    setIsSubscribed(false);
    setIsGuest(false);
    setPaymentPendingState(false);
    
    try {
      await AsyncStorage.removeItem(SUBSCRIPTION_KEY);
      await AsyncStorage.removeItem(PAYMENT_PENDING_KEY);
      console.log('User logged out, subscription cleared');
    } catch (error) {
      console.log('Error clearing subscription:', error);
    }
  };

  const setGuestMode = (guest: boolean) => {
    setIsGuest(guest);
    console.log('Guest mode:', guest);
  };

  const setPaymentPending = async (pending: boolean) => {
    setPaymentPendingState(pending);
    try {
      if (pending) {
        await AsyncStorage.setItem(PAYMENT_PENDING_KEY, 'true');
        console.log('Payment marked as pending');
      } else {
        await AsyncStorage.removeItem(PAYMENT_PENDING_KEY);
        console.log('Payment pending status cleared');
      }
    } catch (error) {
      console.log('Error setting payment pending status:', error);
    }
  };

  const verifyPayment = async (verificationCode: string): Promise<boolean> => {
    console.log('Attempting to verify payment with code:', verificationCode);
    
    // Validate the verification code
    const isValid = VALID_VERIFICATION_CODES.includes(verificationCode.toUpperCase().trim());
    
    if (isValid) {
      setIsSubscribed(true);
      setPaymentPendingState(false);
      
      try {
        await AsyncStorage.setItem(SUBSCRIPTION_KEY, 'active');
        await AsyncStorage.removeItem(PAYMENT_PENDING_KEY);
        console.log('Payment verified successfully, subscription activated');
      } catch (error) {
        console.log('Error saving subscription status:', error);
      }
      
      return true;
    }
    
    console.log('Payment verification failed: invalid code');
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      isAdminLoggedIn, 
      isSubscribed, 
      isGuest, 
      paymentPending,
      login, 
      logout, 
      setGuestMode,
      verifyPayment,
      setPaymentPending,
      checkSubscriptionStatus,
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
