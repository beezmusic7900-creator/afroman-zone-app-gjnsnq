import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Dedicated client for storage uploads — explicitly sets the Authorization header
// so RLS policies that check auth.role() = 'anon' are satisfied even when there
// is no active session on the device.
const SUPABASE_URL = 'https://isrybftzkcaznszjefrw.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzcnliZnR6a2Nhem5zemplZnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODY0NjYsImV4cCI6MjA4OTE2MjQ2Nn0.xCBPjjwDUA7CcEzglMBk1V3c088eok50UwO7r08GR-M';

const uploadClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  global: { headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Canonical Track type — matches the OpenAPI spec exactly. */
export interface Track {
  id: string;
  title: string;
  artist_name: string;
  description: string | null;
  audio_url: string;
  cover_art_url: string | null;
  price: number;
  duration_seconds: number | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

/**
 * @deprecated Use Track instead.
 * Kept for backward-compat with screens that still reference ExclusiveTrack.
 */
export interface ExclusiveTrack {
  id: string;
  title: string;
  artistName: string;
  description: string;
  price: number;
  coverArtUrl: string;
  audioFileUrl: string;
  /** @deprecated always empty string */
  fileName: string;
  /** @deprecated always empty string */
  fileType: string;
  fileSizeBytes?: number;
  durationSeconds?: number;
  status: 'draft' | 'published';
  /** @deprecated always empty string */
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

/** Map a raw Supabase row to the canonical Track type. */
function mapTrackRow(row: any): Track {
  return {
    id: row.id,
    title: row.title,
    artist_name: row.artist_name,
    description: row.description ?? null,
    audio_url: row.audio_url,
    cover_art_url: row.cover_art_url ?? null,
    price: Number(row.price ?? 0),
    duration_seconds: row.duration_seconds ?? null,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** Map a canonical Track to the legacy ExclusiveTrack shape for backward compat. */
function trackToExclusive(t: Track): ExclusiveTrack {
  return {
    id: t.id,
    title: t.title,
    artistName: t.artist_name,
    description: t.description ?? '',
    price: t.price,
    coverArtUrl: t.cover_art_url ?? '',
    audioFileUrl: t.audio_url,
    fileName: '',
    fileType: '',
    fileSizeBytes: 0,
    durationSeconds: t.duration_seconds ?? 0,
    status: t.status,
    uploadedBy: '',
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  };
}

// ============================================================================
// PUBLIC TRACK ENDPOINTS  (GET /api/tracks)
// ============================================================================

/** List all published, active tracks ordered newest first. */
export async function listPublishedTracks(): Promise<Track[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTrackRow);
}

/** @deprecated Use listPublishedTracks() — returns ExclusiveTrack for backward compat. */
export async function getPublishedTracks(): Promise<ExclusiveTrack[]> {
  const tracks = await listPublishedTracks();
  return tracks.map(trackToExclusive);
}

/** Get a single track by id. */
export async function getTrack(id: string): Promise<Track> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return mapTrackRow(data);
}

/** @deprecated Use getTrack() — returns ExclusiveTrack for backward compat. */
export async function getTrackById(trackId: string): Promise<ExclusiveTrack> {
  return trackToExclusive(await getTrack(trackId));
}

// ============================================================================
// ADMIN TRACK ENDPOINTS  (GET /api/tracks?admin=true)
// ============================================================================

/** List ALL tracks regardless of status (admin). */
export async function listAllTracksAdmin(): Promise<Track[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTrackRow);
}

/** @deprecated Use listAllTracksAdmin() — returns ExclusiveTrack for backward compat. */
export async function getAllTracksAdmin(): Promise<ExclusiveTrack[]> {
  const tracks = await listAllTracksAdmin();
  return tracks.map(trackToExclusive);
}

// ============================================================================
// CREATE  (POST /api/tracks)
// ============================================================================

export interface CreateTrackInput {
  title: string;
  artist_name: string;
  description?: string;
  audio_url: string;
  cover_art_url?: string;
  price: number;
  duration_seconds?: number;
  status?: 'draft' | 'published';
}

export async function createTrackV2(input: CreateTrackInput): Promise<Track> {
  const { data, error } = await supabase
    .from('tracks')
    .insert({
      title: input.title,
      artist_name: input.artist_name,
      description: input.description ?? null,
      audio_url: input.audio_url,
      cover_art_url: input.cover_art_url ?? null,
      price: input.price,
      duration_seconds: input.duration_seconds ?? null,
      status: input.status ?? 'draft',
    })
    .select()
    .single();
  if (error) throw error;
  return mapTrackRow(data);
}

/**
 * @deprecated Use createTrackV2() with the new field names.
 * Kept for backward compat with the admin upload screen.
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
      audio_url: trackData.audioFileUrl,
      duration_seconds: trackData.durationSeconds ?? null,
      status: trackData.status,
    })
    .select()
    .single();
  if (error) throw error;
  return trackToExclusive(mapTrackRow(data));
}

// ============================================================================
// UPDATE  (PATCH /api/tracks/:id)
// ============================================================================

export interface UpdateTrackInput {
  title?: string;
  artist_name?: string;
  description?: string;
  audio_url?: string;
  cover_art_url?: string;
  price?: number;
  duration_seconds?: number;
  status?: 'draft' | 'published';
}

export async function updateTrackV2(id: string, input: UpdateTrackInput): Promise<Track> {
  const patch: any = { updated_at: new Date().toISOString() };
  if (input.title !== undefined) patch.title = input.title;
  if (input.artist_name !== undefined) patch.artist_name = input.artist_name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.audio_url !== undefined) patch.audio_url = input.audio_url;
  if (input.cover_art_url !== undefined) patch.cover_art_url = input.cover_art_url;
  if (input.price !== undefined) patch.price = input.price;
  if (input.duration_seconds !== undefined) patch.duration_seconds = input.duration_seconds;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await supabase
    .from('tracks')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapTrackRow(data);
}

/** @deprecated Use updateTrackV2() with the new field names. */
export async function updateTrack(
  trackId: string,
  updates: Partial<ExclusiveTrack>
): Promise<ExclusiveTrack> {
  const patch: any = { updated_at: new Date().toISOString() };
  if (updates.title !== undefined) patch.title = updates.title;
  if (updates.artistName !== undefined) patch.artist_name = updates.artistName;
  if (updates.description !== undefined) patch.description = updates.description;
  if (updates.price !== undefined) patch.price = updates.price;
  if (updates.coverArtUrl !== undefined) patch.cover_art_url = updates.coverArtUrl;
  if (updates.audioFileUrl !== undefined) patch.audio_url = updates.audioFileUrl;
  if (updates.durationSeconds !== undefined) patch.duration_seconds = updates.durationSeconds;
  if (updates.status !== undefined) patch.status = updates.status;

  const { data, error } = await supabase
    .from('tracks')
    .update(patch)
    .eq('id', trackId)
    .select()
    .single();
  if (error) throw error;
  return trackToExclusive(mapTrackRow(data));
}

// ============================================================================
// PUBLISH / UNPUBLISH  (POST /api/tracks/:id/publish|unpublish)
// ============================================================================

export async function publishTrack(trackId: string): Promise<Track> {
  const { data, error } = await supabase
    .from('tracks')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', trackId)
    .select()
    .single();
  if (error) throw error;
  return mapTrackRow(data);
}

export async function unpublishTrack(trackId: string): Promise<Track> {
  const { data, error } = await supabase
    .from('tracks')
    .update({ status: 'draft', updated_at: new Date().toISOString() })
    .eq('id', trackId)
    .select()
    .single();
  if (error) throw error;
  return mapTrackRow(data);
}

// ============================================================================
// DELETE  (DELETE /api/tracks/:id)
// ============================================================================

export async function deleteTrack(trackId: string): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('tracks')
    .delete()
    .eq('id', trackId);
  if (error) throw error;
  return { success: true };
}

// ============================================================================
// FILE UPLOAD  (POST /api/upload/audio  |  POST /api/upload/cover)
// ============================================================================

/**
 * Upload an audio file to the `tracks-audio` bucket.
 * Uses fetch(uri).blob() to preserve binary data and correct MIME type.
 * Returns the public URL.
 */
export async function uploadAudio(file: {
  uri: string;
  name: string;
  type: string;
}): Promise<{ url: string }> {
  console.log('[uploadAudio] Fetching blob from URI:', file.uri);
  let blob: Blob;
  try {
    const response = await fetch(file.uri);
    blob = await response.blob();
    console.log('[uploadAudio] Blob ready — size:', blob.size, 'type:', blob.type);
  } catch (readErr: any) {
    console.error('[uploadAudio] Failed to fetch blob from URI:', readErr);
    throw new Error(`Could not read audio file: ${readErr?.message ?? String(readErr)}`);
  }

  const filePath = `${Date.now()}-${file.name}`;
  console.log('[uploadAudio] Uploading to Supabase storage — path:', filePath);

  const { data, error } = await uploadClient.storage
    .from('tracks-audio')
    .upload(filePath, blob, { upsert: true });
  if (error) {
    console.error('[uploadAudio] Supabase storage error:', error);
    throw new Error(`Audio upload failed: ${error.message}`);
  }

  const { data: urlData } = uploadClient.storage.from('tracks-audio').getPublicUrl(filePath);
  console.log('[uploadAudio] Upload successful, public URL:', urlData.publicUrl);
  return { url: urlData.publicUrl };
}

/**
 * Upload a cover art image to the `tracks-covers` bucket.
 * Uses fetch(uri).blob() to preserve binary data and correct MIME type.
 * Returns the public URL.
 */
export async function uploadCover(file: {
  uri: string;
  name: string;
  type: string;
}): Promise<{ url: string }> {
  console.log('[uploadCover] Fetching blob from URI:', file.uri);
  let blob: Blob;
  try {
    const response = await fetch(file.uri);
    blob = await response.blob();
    console.log('[uploadCover] Blob ready — size:', blob.size, 'type:', blob.type);
  } catch (readErr: any) {
    console.error('[uploadCover] Failed to fetch blob from URI:', readErr);
    throw new Error(`Could not read cover art file: ${readErr?.message ?? String(readErr)}`);
  }

  const filePath = `${Date.now()}-${file.name}`;
  console.log('[uploadCover] Uploading to Supabase storage — path:', filePath);

  const { data, error } = await uploadClient.storage
    .from('tracks-covers')
    .upload(filePath, blob, { upsert: true });
  if (error) {
    console.error('[uploadCover] Supabase storage error:', error);
    throw new Error(`Cover art upload failed: ${error.message}`);
  }

  const { data: urlData } = uploadClient.storage.from('tracks-covers').getPublicUrl(filePath);
  console.log('[uploadCover] Upload successful, public URL:', urlData.publicUrl);
  return { url: urlData.publicUrl };
}

// ============================================================================
// LEGACY UPLOAD ALIASES  (used by existing admin screen)
// ============================================================================

/** @deprecated Use uploadAudio() */
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
  const { url } = await uploadAudio(file);
  return {
    audioFileUrl: url,
    fileName: file.name,
    fileType: file.type,
    fileSizeBytes: 0,
    durationSeconds: 0,
  };
}

/** @deprecated Use uploadCover() */
export async function uploadCoverArt(file: {
  uri: string;
  name: string;
  type: string;
}): Promise<{ coverArtUrl: string; fileName: string }> {
  const { url } = await uploadCover(file);
  return { coverArtUrl: url, fileName: file.name };
}

/** @deprecated Use uploadCover() */
export async function uploadThumbnail(file: {
  uri: string;
  name: string;
  type: string;
}): Promise<{ thumbnailUrl: string; fileName: string }> {
  const { url } = await uploadCover(file);
  return { thumbnailUrl: url, fileName: file.name };
}

// ============================================================================
// VIDEO STUBS
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
