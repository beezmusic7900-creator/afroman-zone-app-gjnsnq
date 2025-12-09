
import { MerchItem } from '@/types';

export const merchandise: MerchItem[] = [
  {
    id: 'tshirt-1',
    name: 'Afroman Official T-Shirt',
    description: 'Premium quality cotton t-shirt with official Afroman logo',
    price: 39.99,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    type: 'tshirt',
  },
  {
    id: 'hoodie-1',
    name: 'Afroman Official Hoodie',
    description: 'Comfortable and stylish hoodie with official Afroman branding',
    price: 49.99,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    type: 'hoodie',
  },
];
