
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PurchasedContent {
  id: string;
  contentId: string;
  contentType: 'video' | 'song';
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
    try {
      const stored = await AsyncStorage.getItem(PURCHASES_KEY);
      if (stored) {
        const purchases = JSON.parse(stored);
        setPurchasedContent(purchases);
        console.log('Loaded purchases:', purchases.length);
      }
      // TODO: Backend Integration - GET /api/user/purchases → [{ id, contentId, contentType, title, purchaseDate, price }]
    } catch (error) {
      console.log('Error loading purchases:', error);
    }
  };

  const addPurchase = async (content: PurchasedContent) => {
    try {
      const updated = [...purchasedContent, content];
      await AsyncStorage.setItem(PURCHASES_KEY, JSON.stringify(updated));
      setPurchasedContent(updated);
      console.log('Purchase added:', content.title);
      // TODO: Backend Integration - POST /api/purchases with { contentId, contentType, price } → { purchaseId, success }
    } catch (error) {
      console.log('Error adding purchase:', error);
    }
  };

  const isPurchased = (contentId: string): boolean => {
    return purchasedContent.some(item => item.contentId === contentId);
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
