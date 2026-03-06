
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl?: string;
  audioUrl?: string;
  isFree: boolean;
  duration?: string;
  price?: number;
  isExclusive?: boolean;
  type?: 'video' | 'audio';
  fileName?: string;
}

export interface MerchItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: any;
  sizes: string[];
  type: 'tshirt' | 'hoodie';
  color: string;
}

export interface CartItem {
  merchItem: MerchItem;
  size: string;
  quantity: number;
}

// New production-ready data models for backend integration
export interface ExclusiveTrack {
  id: string;
  title: string;
  artistName: string;
  description: string;
  price: number;
  coverArtUrl: string;
  audioFileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeBytes?: number;
  duration?: number;
  status: 'published' | 'unpublished' | 'archived';
  isActive: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExclusiveVideo {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  videoUrl: string;
  fileName?: string;
  fileType?: string;
  status: 'published' | 'unpublished' | 'archived';
  isActive: boolean;
  isExclusive: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPurchase {
  id: string;
  userId: string;
  contentId: string;
  contentType: 'track' | 'video';
  title: string;
  price: number;
  purchaseDate: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  stripePaymentId?: string;
}

// Legacy interfaces (kept for backward compatibility)
export interface AdminContent {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  isExclusive?: boolean;
  uploadDate: string;
  type: 'video' | 'audio' | 'merch';
  price?: number;
  imageUrl?: string;
  sizes?: string[];
  merchType?: string;
  color?: string;
  fileName?: string;
}

export interface AdminVideo {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  audioUrl?: string;
  thumbnailUrl: string;
  isExclusive: boolean;
  price?: number;
  uploadedAt: string;
  uploadedBy: string;
  type: 'video' | 'audio';
  fileName?: string;
}

export interface AdminMerchandise {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  sizes: string[];
  type: string;
  color: string;
  uploadedAt: string;
}

export interface PurchasedContent {
  id: string;
  contentId: string;
  contentType: 'video' | 'song' | 'audio';
  title: string;
  purchaseDate: string;
  price: number;
}
