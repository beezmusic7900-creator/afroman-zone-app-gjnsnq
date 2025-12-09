
import { Video } from '@/types';

export const freeVideos: Video[] = [
  {
    id: '1',
    title: 'Because I Got High',
    description: 'Official Music Video',
    thumbnailUrl: 'https://img.youtube.com/vi/WeYsTmIzjkw/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/WeYsTmIzjkw',
    isFree: true,
    duration: '3:18',
  },
  {
    id: '2',
    title: 'Crazy Rap',
    description: 'Official Music Video',
    thumbnailUrl: 'https://img.youtube.com/vi/SIMcktul77c/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/SIMcktul77c',
    isFree: true,
    duration: '4:32',
  },
];

export const premiumVideos: Video[] = [
  {
    id: '3',
    title: 'Exclusive Content 1',
    description: 'Premium content for subscribers only',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    videoUrl: '',
    isFree: false,
  },
  {
    id: '4',
    title: 'Exclusive Content 2',
    description: 'Premium content for subscribers only',
    thumbnailUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    videoUrl: '',
    isFree: false,
  },
];
