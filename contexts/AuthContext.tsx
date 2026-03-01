
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAdminLoggedIn: boolean;
  isMusicDistributorLoggedIn: boolean;
  isSubscribed: boolean;
  isGuest: boolean;
  paymentPending: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setGuestMode: (isGuest: boolean) => void;
  verifyPayment: (verificationCode: string) => Promise<boolean>;
  setPaymentPending: (pending: boolean) => void;
  checkSubscriptionStatus: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'hungry.hustler@yahoo.com';
const ADMIN_PASSWORD = 'Afroman420!!';
const MUSIC_DISTRIBUTOR_EMAIL = 'contactacmgroup@gmail.com';
const MUSIC_DISTRIBUTOR_PASSWORD = 'cannabis123';
const SUBSCRIPTION_KEY = '@afroman_subscription';
const PAYMENT_PENDING_KEY = '@afroman_payment_pending';
const ADMIN_SESSION_KEY = '@afroman_admin_session';
const MUSIC_DISTRIBUTOR_SESSION_KEY = '@afroman_music_distributor_session';
const USER_EMAIL_KEY = '@afroman_user_email';
const ADMIN_PASSWORD_KEY = '@afroman_admin_password';
const DISTRIBUTOR_PASSWORD_KEY = '@afroman_distributor_password';

// Valid verification codes that would be provided after successful Stripe payment
const VALID_VERIFICATION_CODES = [
  'AFROMAN2025',
  'PREMIUM2025',
  'EXCLUSIVE2025',
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isMusicDistributorLoggedIn, setIsMusicDistributorLoggedIn] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [paymentPending, setPaymentPendingState] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState(ADMIN_PASSWORD);
  const [distributorPassword, setDistributorPassword] = useState(MUSIC_DISTRIBUTOR_PASSWORD);

  // Load subscription and admin status on mount
  useEffect(() => {
    loadSubscriptionStatus();
    loadAdminSession();
    loadMusicDistributorSession();
    loadStoredPasswords();
  }, []);

  const loadStoredPasswords = async () => {
    try {
      const storedAdminPassword = await AsyncStorage.getItem(ADMIN_PASSWORD_KEY);
      const storedDistributorPassword = await AsyncStorage.getItem(DISTRIBUTOR_PASSWORD_KEY);
      
      if (storedAdminPassword) {
        setAdminPassword(storedAdminPassword);
        console.log('Admin password loaded from storage');
      }
      
      if (storedDistributorPassword) {
        setDistributorPassword(storedDistributorPassword);
        console.log('Distributor password loaded from storage');
      }
    } catch (error) {
      console.log('Error loading stored passwords:', error);
    }
  };

  const loadAdminSession = async () => {
    try {
      const adminSession = await AsyncStorage.getItem(ADMIN_SESSION_KEY);
      const email = await AsyncStorage.getItem(USER_EMAIL_KEY);
      if (adminSession === 'active') {
        setIsAdminLoggedIn(true);
        setUserEmail(email || ADMIN_EMAIL);
        console.log('Admin session restored');
      }
    } catch (error) {
      console.log('Error loading admin session:', error);
    }
  };

  const loadMusicDistributorSession = async () => {
    try {
      const distributorSession = await AsyncStorage.getItem(MUSIC_DISTRIBUTOR_SESSION_KEY);
      const email = await AsyncStorage.getItem(USER_EMAIL_KEY);
      if (distributorSession === 'active') {
        setIsMusicDistributorLoggedIn(true);
        setUserEmail(email || MUSIC_DISTRIBUTOR_EMAIL);
        console.log('Music distributor session restored');
      }
    } catch (error) {
      console.log('Error loading music distributor session:', error);
    }
  };

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

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login attempt with email:', email);
    
    if (email === ADMIN_EMAIL && password === adminPassword) {
      setIsAdminLoggedIn(true);
      setIsMusicDistributorLoggedIn(false);
      setUserEmail(email);
      try {
        await AsyncStorage.setItem(ADMIN_SESSION_KEY, 'active');
        await AsyncStorage.setItem(USER_EMAIL_KEY, email);
        await AsyncStorage.removeItem(MUSIC_DISTRIBUTOR_SESSION_KEY);
        console.log('Admin logged in successfully');
      } catch (error) {
        console.log('Error saving admin session:', error);
      }
      // TODO: Backend Integration - POST /api/admin/login with { email, password } → { success, token }
      return true;
    }
    
    if (email === MUSIC_DISTRIBUTOR_EMAIL && password === distributorPassword) {
      setIsMusicDistributorLoggedIn(true);
      setIsAdminLoggedIn(false);
      setUserEmail(email);
      try {
        await AsyncStorage.setItem(MUSIC_DISTRIBUTOR_SESSION_KEY, 'active');
        await AsyncStorage.setItem(USER_EMAIL_KEY, email);
        await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
        console.log('Music distributor logged in successfully');
      } catch (error) {
        console.log('Error saving music distributor session:', error);
      }
      // TODO: Backend Integration - POST /api/distributor/login with { email, password } → { success, token }
      return true;
    }
    
    console.log('Login failed: invalid credentials');
    return false;
  };

  const logout = async () => {
    setIsAdminLoggedIn(false);
    setIsMusicDistributorLoggedIn(false);
    setIsSubscribed(false);
    setIsGuest(false);
    setPaymentPendingState(false);
    setUserEmail(null);
    
    try {
      await AsyncStorage.removeItem(SUBSCRIPTION_KEY);
      await AsyncStorage.removeItem(PAYMENT_PENDING_KEY);
      await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
      await AsyncStorage.removeItem(MUSIC_DISTRIBUTOR_SESSION_KEY);
      await AsyncStorage.removeItem(USER_EMAIL_KEY);
      console.log('User logged out, all sessions cleared');
    } catch (error) {
      console.log('Error clearing sessions:', error);
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

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    console.log('Password change attempt for user:', userEmail);
    
    // Validate current password
    if (isAdminLoggedIn && currentPassword === adminPassword) {
      setAdminPassword(newPassword);
      try {
        await AsyncStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
        console.log('Admin password changed successfully');
        // TODO: Backend Integration - POST /api/user/change-password with { currentPassword, newPassword } → { success }
        return true;
      } catch (error) {
        console.log('Error saving new admin password:', error);
        return false;
      }
    }
    
    if (isMusicDistributorLoggedIn && currentPassword === distributorPassword) {
      setDistributorPassword(newPassword);
      try {
        await AsyncStorage.setItem(DISTRIBUTOR_PASSWORD_KEY, newPassword);
        console.log('Distributor password changed successfully');
        // TODO: Backend Integration - POST /api/user/change-password with { currentPassword, newPassword } → { success }
        return true;
      } catch (error) {
        console.log('Error saving new distributor password:', error);
        return false;
      }
    }
    
    console.log('Password change failed: incorrect current password');
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      isAdminLoggedIn,
      isMusicDistributorLoggedIn,
      isSubscribed, 
      isGuest, 
      paymentPending,
      userEmail,
      login, 
      logout, 
      setGuestMode,
      verifyPayment,
      setPaymentPending,
      checkSubscriptionStatus,
      changePassword,
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
