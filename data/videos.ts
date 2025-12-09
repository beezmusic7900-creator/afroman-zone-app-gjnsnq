
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

export const premiumVideos: Video[] = [];
