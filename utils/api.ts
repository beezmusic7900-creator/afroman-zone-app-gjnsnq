import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

// ============================================================================
// TYPE DEFINITIONS
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
  status: 'draft' | 'published';
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
  userEmail: string;
  contentId: string;
  contentType: 'track' | 'video';
  title: string;
  price: number;
  purchaseDate: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  stripePaymentId?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function mapTrack(row: any): ExclusiveTrack {
  return {
    id: row.id,
    title: row.title,
    artistName: row.artist_name,
    description: row.description ?? '',
    price: row.price ?? 0,
    coverArtUrl: row.cover_art_url ?? '',
    audioFileUrl: row.audio_file_url,
    fileName: row.file_name ?? '',
    fileType: row.file_type ?? '',
    fileSizeBytes: row.file_size_bytes ?? 0,
    durationSeconds: row.duration_seconds ?? 0,
    status: row.status,
    isActive: row.is_active,
    uploadedBy: row.uploaded_by ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// PUBLIC TRACK ENDPOINTS
// ============================================================================

export async function getPublishedTracks(): Promise<ExclusiveTrack[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('status', 'published')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTrack);
}

export async function getTrackById(trackId: string): Promise<ExclusiveTrack> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', trackId)
    .single();
  if (error) throw error;
  return mapTrack(data);
}

// ============================================================================
// ADMIN TRACK ENDPOINTS
// ============================================================================

export async function getAllTracksAdmin(): Promise<ExclusiveTrack[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTrack);
}

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
  status: 'draft' | 'published';
  isActive?: boolean;
  uploadedBy?: string;
}): Promise<ExclusiveTrack> {
  const { data, error } = await supabase
    .from('tracks')
    .insert({
      title: trackData.title,
      artist_name: trackData.artistName,
      description: trackData.description,
      price: trackData.price,
      cover_art_url: trackData.coverArtUrl,
      audio_file_url: trackData.audioFileUrl,
      file_name: trackData.fileName,
      file_type: trackData.fileType,
      file_size_bytes: trackData.fileSizeBytes ?? 0,
      duration_seconds: trackData.durationSeconds ?? 0,
      status: trackData.status,
      is_active: trackData.isActive ?? true,
      uploaded_by: trackData.uploadedBy ?? '',
    })
    .select()
    .single();
  if (error) throw error;
  return mapTrack(data);
}

export async function updateTrack(
  trackId: string,
  updates: Partial<ExclusiveTrack>
): Promise<ExclusiveTrack> {
  const dbUpdates: any = { updated_at: new Date().toISOString() };
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.artistName !== undefined) dbUpdates.artist_name = updates.artistName;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.coverArtUrl !== undefined) dbUpdates.cover_art_url = updates.coverArtUrl;
  if (updates.audioFileUrl !== undefined) dbUpdates.audio_file_url = updates.audioFileUrl;
  if (updates.fileName !== undefined) dbUpdates.file_name = updates.fileName;
  if (updates.fileType !== undefined) dbUpdates.file_type = updates.fileType;
  if (updates.fileSizeBytes !== undefined) dbUpdates.file_size_bytes = updates.fileSizeBytes;
  if (updates.durationSeconds !== undefined) dbUpdates.duration_seconds = updates.durationSeconds;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('tracks')
    .update(dbUpdates)
    .eq('id', trackId)
    .select()
    .single();
  if (error) throw error;
  return mapTrack(data);
}

export async function publishTrack(trackId: string): Promise<{ success: boolean; track: ExclusiveTrack }> {
  const { data, error } = await supabase
    .from('tracks')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', trackId)
    .select()
    .single();
  if (error) throw error;
  return { success: true, track: mapTrack(data) };
}

export async function unpublishTrack(trackId: string): Promise<{ success: boolean; track: ExclusiveTrack }> {
  const { data, error } = await supabase
    .from('tracks')
    .update({ status: 'draft', updated_at: new Date().toISOString() })
    .eq('id', trackId)
    .select()
    .single();
  if (error) throw error;
  return { success: true, track: mapTrack(data) };
}

export async function deleteTrack(trackId: string): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase
    .from('tracks')
    .delete()
    .eq('id', trackId);
  if (error) throw error;
  return { success: true, message: 'Track deleted successfully' };
}

// ============================================================================
// FILE UPLOAD (Supabase Storage)
// ============================================================================

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
  const base64 = await FileSystem.readAsStringAsync(file.uri, {
    encoding: 'base64',
  });
  const arrayBuffer = decode(base64);
  const fileExt = file.name.split('.').pop() ?? 'mp3';
  const filePath = `audio/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from('tracks')
    .upload(filePath, arrayBuffer, { contentType: `audio/${fileExt}`, upsert: false });
  if (error) throw error;

  const { data: urlData } = supabase.storage.from('tracks').getPublicUrl(filePath);
  return {
    audioFileUrl: urlData.publicUrl,
    fileName: file.name,
    fileType: `audio/${fileExt}`,
    fileSizeBytes: arrayBuffer.byteLength,
    durationSeconds: 0,
  };
}

export async function uploadCoverArt(file: {
  uri: string;
  name: string;
  type: string;
}): Promise<{ coverArtUrl: string; fileName: string }> {
  const base64 = await FileSystem.readAsStringAsync(file.uri, {
    encoding: 'base64',
  });
  const arrayBuffer = decode(base64);
  const fileExt = file.name.split('.').pop() ?? 'jpg';
  const filePath = `covers/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from('tracks')
    .upload(filePath, arrayBuffer, { contentType: `image/${fileExt}`, upsert: false });
  if (error) throw error;

  const { data: urlData } = supabase.storage.from('tracks').getPublicUrl(filePath);
  return { coverArtUrl: urlData.publicUrl, fileName: file.name };
}

export async function uploadThumbnail(file: {
  uri: string;
  name: string;
  type: string;
}): Promise<{ thumbnailUrl: string; fileName: string }> {
  const base64 = await FileSystem.readAsStringAsync(file.uri, {
    encoding: 'base64',
  });
  const arrayBuffer = decode(base64);
  const fileExt = file.name.split('.').pop() ?? 'jpg';
  const filePath = `thumbnails/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from('tracks')
    .upload(filePath, arrayBuffer, { contentType: `image/${fileExt}`, upsert: false });
  if (error) throw error;

  const { data: urlData } = supabase.storage.from('tracks').getPublicUrl(filePath);
  return { thumbnailUrl: urlData.publicUrl, fileName: file.name };
}

// ============================================================================
// VIDEO STUBS (no videos table yet — return empty arrays)
// ============================================================================

export async function getPublishedVideos(): Promise<ExclusiveVideo[]> {
  return [];
}

export async function getVideoById(_videoId: string): Promise<ExclusiveVideo> {
  throw new Error('Videos not yet implemented');
}

export async function getAllVideosAdmin(): Promise<ExclusiveVideo[]> {
  return [];
}

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
  throw new Error('Videos not yet implemented');
}

export async function deleteVideo(_videoId: string): Promise<{ success: boolean; message: string }> {
  throw new Error('Videos not yet implemented');
}

// ============================================================================
// PURCHASE STUBS
// ============================================================================

export async function recordPurchase(purchaseData: {
  userEmail: string;
  contentId: string;
  contentType: 'track' | 'video';
  title: string;
  price: number;
  stripePaymentId?: string;
}): Promise<{ success: boolean; purchase: UserPurchase }> {
  throw new Error('Purchases not yet implemented');
}

export async function getUserPurchases(_userEmail: string): Promise<UserPurchase[]> {
  return [];
}

export type { ExclusiveTrack, ExclusiveVideo, UserPurchase };
