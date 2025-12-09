
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
  videoUrl: string;
  thumbnailUrl: string;
  uploadDate: string;
}
