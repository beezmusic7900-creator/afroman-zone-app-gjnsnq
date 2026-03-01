
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  isFree: boolean;
  duration?: string;
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

export interface AdminContent {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  isExclusive?: boolean;
  uploadDate: string;
  type: 'video' | 'merch';
  price?: number;
  imageUrl?: string;
  sizes?: string[];
  merchType?: string;
  color?: string;
}

export interface AdminVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  isExclusive: boolean;
  uploadedAt: string;
  uploadedBy: string;
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
