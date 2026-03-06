
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PurchasedContent {
  id: string;
  contentId: string;
  contentType: 'video' | 'song' | 'track';
  title: string;
  purchaseDate: string;
  price: number;
}

interface PurchaseContextType {
  purchasedContent: PurchasedContent[];
  addPurchase: (content: PurchasedContent) => Promise<void>;
  isPurchased: (contentId: string) => boolean;
  loadPurchases: () => Promise<void>;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

const PURCHASES_KEY = '@afroman_purchases';

export function PurchaseProvider({ children }: { children: ReactNode }) {
  const [purchasedContent, setPurchasedContent] = useState<PurchasedContent[]>([]);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    console.log('PurchaseContext: Loading user purchases');
    
    try {
      // TODO: Backend Integration - GET /api/user/purchases
      // Returns: [{ id, contentId, contentType, title, price, purchaseDate, paymentStatus }]
      // Filter: Only returns purchases where userId matches authenticated user
      
      // Temporary: Load from AsyncStorage (will be replaced by backend)
      const stored = await AsyncStorage.getItem(PURCHASES_KEY);
      if (stored) {
        const purchases = JSON.parse(stored);
        setPurchasedContent(purchases);
        console.log('PurchaseContext: Loaded purchases from local storage:', purchases.length);
      } else {
        console.log('PurchaseContext: No purchases found in local storage');
      }
    } catch (error) {
      console.error('PurchaseContext: Error loading purchases:', error);
    }
  };

  const addPurchase = async (content: PurchasedContent) => {
    console.log('PurchaseContext: Adding purchase:', content.title);
    
    try {
      // TODO: Backend Integration - POST /api/purchases
      // Body: { contentId, contentType: 'track' | 'video', title, price, stripePaymentId? }
      // Sets userId from authenticated user
      // Sets purchaseDate to current timestamp
      // Returns: { purchaseId: string, success: true }
      
      // Temporary: Save to AsyncStorage (will be replaced by backend)
      const updated = [...purchasedContent, content];
      await AsyncStorage.setItem(PURCHASES_KEY, JSON.stringify(updated));
      setPurchasedContent(updated);
      console.log('PurchaseContext: Purchase added successfully');
    } catch (error) {
      console.error('PurchaseContext: Error adding purchase:', error);
      throw error;
    }
  };

  const isPurchased = (contentId: string): boolean => {
    const purchased = purchasedContent.some(item => item.contentId === contentId);
    console.log('PurchaseContext: Checking if content is purchased:', contentId, '→', purchased);
    return purchased;
  };

  return (
    <PurchaseContext.Provider value={{
      purchasedContent,
      addPurchase,
      isPurchased,
      loadPurchases,
    }}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase() {
  const context = useContext(PurchaseContext);
  if (context === undefined) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  return context;
}
