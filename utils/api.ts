
/**
 * API Utility for Backend Communication
 * 
 * This file contains all API calls for the music upload and content management system.
 * All endpoints are marked with TODO comments for backend integration.
 * 
 * CRITICAL: All uploaded content is stored permanently in cloud storage and database.
 * Content remains visible until manually deleted or unpublished by admin.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-backend-url.com';

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`API Request: ${options.method || 'GET'} ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`API Error: ${response.status}`, errorData);
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`API Response: ${endpoint}`, data);
    return data;
  } catch (error) {
    console.error(`API Request Failed: ${endpoint}`, error);
    throw error;
  }
}

// ============================================================================
// FILE UPLOAD ENDPOINTS
// ============================================================================

/**
 * Upload audio file to permanent cloud storage
 * TODO: Backend Integration - POST /api/admin/upload/audio
 * Accepts: multipart/form-data with 'audioFile' field
 * Max size: 100MB
 * Accepted types: audio/mpeg, audio/mp3, audio/wav, audio/m4a
 * Returns: { audioFileUrl: string, fileName: string, fileType: string, fileSizeBytes: number, durationSeconds: number }
 */
export async function uploadAudioFile(file: {
  uri: string;
  name: string;
  type: string;
  size?: number;
}): Promise<{
  audioFileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  durationSeconds: number;
}> {
  console.log('Uploading audio file to permanent storage:', file.name);
  
  const formData = new FormData();
  formData.append('audioFile', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  // TODO: Backend Integration - POST /api/admin/upload/audio
  // This endpoint MUST upload to permanent cloud storage (S3-compatible)
  // The returned URL MUST be permanent and never expire
  // The backend MUST extract audio duration from file metadata
  
  // Temporary mock response (remove when backend is ready)
  return {
    audioFileUrl: file.uri, // Will be replaced with permanent cloud URL
    fileName: file.name,
    fileType: file.type,
    fileSizeBytes: file.size || 0,
    durationSeconds: 0, // Backend will extract this
  };
  
  // Uncomment when backend is ready:
  // return apiRequest('/api/admin/upload/audio', {
  //   method: 'POST',
  //   body: formData,
  // });
}

/**
 * Upload cover art image to permanent cloud storage
 * TODO: Backend Integration - POST /api/admin/upload/cover-art
 * Accepts: multipart/form-data with 'coverArt' field
 * Max size: 10MB
 * Accepted types: image/jpeg, image/jpg, image/png, image/webp
 * Returns: { coverArtUrl: string, fileName: string }
 */
export async function uploadCoverArt(file: {
  uri: string;
  name: string;
  type: string;
}): Promise<{
  coverArtUrl: string;
  fileName: string;
}> {
  console.log('Uploading cover art to permanent storage:', file.name);
  
  const formData = new FormData();
  formData.append('coverArt', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  // TODO: Backend Integration - POST /api/admin/upload/cover-art
  // This endpoint MUST upload to permanent cloud storage
  // The returned URL MUST be permanent and never expire
  
  // Temporary mock response
  return {
    coverArtUrl: file.uri, // Will be replaced with permanent cloud URL
    fileName: file.name,
  };
  
  // Uncomment when backend is ready:
  // return apiRequest('/api/admin/upload/cover-art', {
  //   method: 'POST',
  //   body: formData,
  // });
}

/**
 * Upload thumbnail image to permanent cloud storage
 * TODO: Backend Integration - POST /api/admin/upload/thumbnail
 */
export async function uploadThumbnail(file: {
  uri: string;
  name: string;
  type: string;
}): Promise<{
  thumbnailUrl: string;
  fileName: string;
}> {
  console.log('Uploading thumbnail to permanent storage:', file.name);
  
  const formData = new FormData();
  formData.append('thumbnail', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  // TODO: Backend Integration - POST /api/admin/upload/thumbnail
  
  // Temporary mock response
  return {
    thumbnailUrl: file.uri,
    fileName: file.name,
  };
}

// ============================================================================
// TRACK MANAGEMENT ENDPOINTS (ADMIN)
// ============================================================================

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
  durationSeconds?: number;
  status: 'published' | 'unpublished' | 'archived';
  isActive: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create new track in database
 * TODO: Backend Integration - POST /api/admin/tracks
 * Body: { title, artistName, description, price, coverArtUrl, audioFileUrl, fileName, fileType, fileSizeBytes, durationSeconds, status, isActive }
 * Returns: created track object with all fields including id, createdAt, updatedAt
 * CRITICAL: This is a transactional operation - if DB write fails, return error
 * CRITICAL: After successful creation, track MUST immediately appear in GET /api/tracks
 */
export async function createTrack(trackData: {
  title: string;
  artistName: string;
  description: string;
  price: number;
  coverArtUrl: string;
  audioFileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeBytes?: number;
  durationSeconds?: number;
  status: 'published' | 'unpublished';
  isActive: boolean;
  uploadedBy: string;
}): Promise<ExclusiveTrack> {
  console.log('Creating track in database:', trackData.title);
  
  // TODO: Backend Integration - POST /api/admin/tracks
  // CRITICAL: Set status='published' and isActive=true by default
  // CRITICAL: After successful creation, track MUST immediately appear in GET /api/tracks
  
  // Temporary mock response
  const newTrack: ExclusiveTrack = {
    id: `track-${Date.now()}`,
    ...trackData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  console.log('Track created successfully:', newTrack.id);
  console.log('Track is now LIVE and will appear in Music tab immediately');
  
  return newTrack;
  
  // Uncomment when backend is ready:
  // return apiRequest('/api/admin/tracks', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(trackData),
  // });
}

/**
 * Get all tracks for admin management (includes unpublished and archived)
 * TODO: Backend Integration - GET /api/admin/tracks/all
 * Returns: [{ id, title, artistName, description, price, coverArtUrl, audioFileUrl, fileName, status, isActive, uploadedBy, createdAt, updatedAt }]
 * Ordered by: createdAt DESC (newest first)
 */
export async function getAllTracksAdmin(): Promise<ExclusiveTrack[]> {
  console.log('Fetching all tracks for admin management');
  
  // TODO: Backend Integration - GET /api/admin/tracks/all
  // Returns ALL tracks (published, unpublished, archived)
  
  // Temporary mock response
  return [];
  
  // Uncomment when backend is ready:
  // return apiRequest('/api/admin/tracks/all', {
  //   method: 'GET',
  // });
}

/**
 * Update track metadata
 * TODO: Backend Integration - PATCH /api/admin/tracks/:id
 */
export async function updateTrack(
  trackId: string,
  updates: Partial<ExclusiveTrack>
): Promise<ExclusiveTrack> {
  console.log('Updating track:', trackId, updates);
  
  // TODO: Backend Integration - PATCH /api/admin/tracks/:id
  
  // Temporary mock response
  return {
    id: trackId,
    ...updates,
    updatedAt: new Date().toISOString(),
  } as ExclusiveTrack;
}

/**
 * Publish track (make it live in Music tab)
 * TODO: Backend Integration - PATCH /api/admin/tracks/:id/publish
 * CRITICAL: After this call, track MUST appear in GET /api/tracks (public endpoint)
 */
export async function publishTrack(trackId: string): Promise<{ success: boolean; track: ExclusiveTrack }> {
  console.log('Publishing track:', trackId);
  console.log('Track will now appear in Music tab for all users');
  
  // TODO: Backend Integration - PATCH /api/admin/tracks/:id/publish
  // Sets status='published' AND isActive=true
  
  // Temporary mock response
  return {
    success: true,
    track: {
      id: trackId,
      status: 'published',
      isActive: true,
      updatedAt: new Date().toISOString(),
    } as ExclusiveTrack,
  };
}

/**
 * Unpublish track (remove from Music tab)
 * TODO: Backend Integration - PATCH /api/admin/tracks/:id/unpublish
 * CRITICAL: After this call, track MUST be removed from GET /api/tracks (public endpoint)
 */
export async function unpublishTrack(trackId: string): Promise<{ success: boolean; track: ExclusiveTrack }> {
  console.log('Unpublishing track:', trackId);
  console.log('Track will be removed from Music tab');
  
  // TODO: Backend Integration - PATCH /api/admin/tracks/:id/unpublish
  // Sets status='unpublished' AND isActive=false
  
  // Temporary mock response
  return {
    success: true,
    track: {
      id: trackId,
      status: 'unpublished',
      isActive: false,
      updatedAt: new Date().toISOString(),
    } as ExclusiveTrack,
  };
}

/**
 * Delete track (soft delete - archives it)
 * TODO: Backend Integration - DELETE /api/admin/tracks/:id
 * CRITICAL: After this call, track MUST be removed from GET /api/tracks (public endpoint)
 */
export async function deleteTrack(trackId: string): Promise<{ success: boolean; message: string }> {
  console.log('Deleting (archiving) track:', trackId);
  console.log('Track will be removed from Music tab');
  
  // TODO: Backend Integration - DELETE /api/admin/tracks/:id
  // Soft delete - sets status='archived' AND isActive=false
  
  // Temporary mock response
  return {
    success: true,
    message: 'Track archived successfully',
  };
}

// ============================================================================
// VIDEO MANAGEMENT ENDPOINTS (ADMIN)
// ============================================================================

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

/**
 * Create new video in database
 * TODO: Backend Integration - POST /api/admin/videos
 */
export async function createVideo(videoData: {
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  videoUrl: string;
  fileName?: string;
  fileType?: string;
  status: 'published' | 'unpublished';
  isActive: boolean;
  isExclusive: boolean;
  uploadedBy: string;
}): Promise<ExclusiveVideo> {
  console.log('Creating video in database:', videoData.title);
  
  // TODO: Backend Integration - POST /api/admin/videos
  
  const newVideo: ExclusiveVideo = {
    id: `video-${Date.now()}`,
    ...videoData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  console.log('Video created successfully:', newVideo.id);
  console.log('Video is now LIVE and will appear in Movies tab immediately');
  
  return newVideo;
}

/**
 * Get all videos for admin management
 * TODO: Backend Integration - GET /api/admin/videos/all
 */
export async function getAllVideosAdmin(): Promise<ExclusiveVideo[]> {
  console.log('Fetching all videos for admin management');
  
  // TODO: Backend Integration - GET /api/admin/videos/all
  
  return [];
}

/**
 * Delete video (soft delete)
 * TODO: Backend Integration - DELETE /api/admin/videos/:id
 */
export async function deleteVideo(videoId: string): Promise<{ success: boolean; message: string }> {
  console.log('Deleting (archiving) video:', videoId);
  
  // TODO: Backend Integration - DELETE /api/admin/videos/:id
  
  return {
    success: true,
    message: 'Video archived successfully',
  };
}

// ============================================================================
// PUBLIC ENDPOINTS (for Music and Movies tabs)
// ============================================================================

/**
 * Get published tracks for Music tab
 * TODO: Backend Integration - GET /api/tracks
 * Returns: [{ id, title, artistName, description, price, coverArtUrl, audioFileUrl, fileName, fileType, durationSeconds, createdAt, updatedAt }]
 * Filter: ONLY returns tracks where status='published' AND isActive=true
 * Ordered by: createdAt DESC (newest first)
 * CRITICAL: This endpoint MUST return tracks immediately after admin uploads them with status='published'
 */
export async function getPublishedTracks(): Promise<ExclusiveTrack[]> {
  console.log('Fetching published tracks from database');
  console.log('This will load all tracks uploaded by admin that are marked as published');
  
  // TODO: Backend Integration - GET /api/tracks
  // Filter: status='published' AND isActive=true
  // Order: createdAt DESC
  
  // Temporary mock response
  return [];
  
  // Uncomment when backend is ready:
  // return apiRequest('/api/tracks', {
  //   method: 'GET',
  // });
}

/**
 * Get published videos for Movies tab
 * TODO: Backend Integration - GET /api/videos
 * Filter: ONLY returns videos where status='published' AND isActive=true
 */
export async function getPublishedVideos(): Promise<ExclusiveVideo[]> {
  console.log('Fetching published videos from database');
  
  // TODO: Backend Integration - GET /api/videos
  
  return [];
}

/**
 * Get single track by ID
 * TODO: Backend Integration - GET /api/tracks/:id
 */
export async function getTrackById(trackId: string): Promise<ExclusiveTrack> {
  console.log('Fetching track by ID:', trackId);
  
  // TODO: Backend Integration - GET /api/tracks/:id
  
  throw new Error('Track not found');
}

/**
 * Get single video by ID
 * TODO: Backend Integration - GET /api/videos/:id
 */
export async function getVideoById(videoId: string): Promise<ExclusiveVideo> {
  console.log('Fetching video by ID:', videoId);
  
  // TODO: Backend Integration - GET /api/videos/:id
  
  throw new Error('Video not found');
}

// ============================================================================
// PURCHASE TRACKING ENDPOINTS
// ============================================================================

export interface UserPurchase {
  id: string;
  userEmail: string;
  contentId: string;
  contentType: 'track' | 'video';
  title: string;
  price: number;
  purchaseDate: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  stripePaymentId?: string;
}

/**
 * Record a purchase
 * TODO: Backend Integration - POST /api/purchases
 */
export async function recordPurchase(purchaseData: {
  userEmail: string;
  contentId: string;
  contentType: 'track' | 'video';
  title: string;
  price: number;
  stripePaymentId?: string;
}): Promise<{ success: boolean; purchase: UserPurchase }> {
  console.log('Recording purchase:', purchaseData);
  
  // TODO: Backend Integration - POST /api/purchases
  
  return {
    success: true,
    purchase: {
      id: `purchase-${Date.now()}`,
      ...purchaseData,
      purchaseDate: new Date().toISOString(),
      paymentStatus: 'completed',
    },
  };
}

/**
 * Get user purchases
 * TODO: Backend Integration - GET /api/purchases/:userEmail
 */
export async function getUserPurchases(userEmail: string): Promise<UserPurchase[]> {
  console.log('Fetching purchases for user:', userEmail);
  
  // TODO: Backend Integration - GET /api/purchases/:userEmail
  
  return [];
}

// Export all types
export type { ExclusiveTrack, ExclusiveVideo, UserPurchase };
