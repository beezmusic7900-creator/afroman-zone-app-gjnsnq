/*
 * Runs once on app launch to ensure storage buckets exist and seed data is present.
 *
 * If the tracks table doesn't exist yet, run MIGRATION.sql first:
 *   https://supabase.com/dashboard/project/isrybftzkcaznszjefrw/sql/new
 *
 * Or run the automated script:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/run-migration.mjs
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Bump this key whenever the schema changes to force re-setup on next launch.
const SETUP_KEY = 'supabase_setup_v4';

const SEED_TRACKS = [
  {
    title: 'Afro Vibes',
    artist: 'OGAfroman',
    album: 'Roots & Rhythms',
    duration: 214,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover_url: 'https://picsum.photos/seed/ogafroman1/400/400',
    price: 0.00,
    is_exclusive: false,
    status: 'published',
    genre: 'Afrobeats',
    description: 'A smooth afrobeats track with deep rhythms.',
  },
  {
    title: 'Lagos Nights',
    artist: 'OGAfroman',
    album: 'Roots & Rhythms',
    duration: 187,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover_url: 'https://picsum.photos/seed/ogafroman2/400/400',
    price: 1.99,
    is_exclusive: false,
    status: 'published',
    genre: 'Afrobeats',
    description: 'Inspired by the energy of Lagos nightlife.',
  },
  {
    title: 'Exclusive Heat',
    artist: 'OGAfroman',
    album: 'Members Only',
    duration: 243,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover_url: 'https://picsum.photos/seed/ogafroman3/400/400',
    price: 4.99,
    is_exclusive: true,
    status: 'published',
    genre: 'Afropop',
    description: 'Exclusive track for premium members only.',
  },
  {
    title: 'Motherland',
    artist: 'OGAfroman',
    album: 'Heritage',
    duration: 198,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    cover_url: 'https://picsum.photos/seed/ogafroman4/400/400',
    price: 0.00,
    is_exclusive: false,
    status: 'published',
    genre: 'Afrobeats',
    description: 'A tribute to the African motherland.',
  },
  {
    title: 'Street Anthem',
    artist: 'OGAfroman',
    album: 'Heritage',
    duration: 221,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    cover_url: 'https://picsum.photos/seed/ogafroman5/400/400',
    price: 2.99,
    is_exclusive: false,
    status: 'published',
    genre: 'Afropop',
    description: 'The streets speak through this anthem.',
  },
  {
    title: 'VIP Access',
    artist: 'OGAfroman',
    album: 'Members Only',
    duration: 265,
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    cover_url: 'https://picsum.photos/seed/ogafroman6/400/400',
    price: 9.99,
    is_exclusive: true,
    status: 'published',
    genre: 'Afrobeats',
    description: 'Exclusive VIP-only release.',
  },
];

export async function runSupabaseSetup(): Promise<void> {
  try {
    const done = await AsyncStorage.getItem(SETUP_KEY);
    if (done === 'true') return;

    // -------------------------------------------------------------------------
    // 1. Ensure storage buckets exist
    // -------------------------------------------------------------------------
    for (const bucketId of ['tracks-audio', 'tracks-covers']) {
      try {
        const { error } = await supabase.storage.createBucket(bucketId, { public: true });
        if (error && !error.message.toLowerCase().includes('already exists')) {
          console.warn(`[Supabase] Could not create bucket "${bucketId}":`, error.message);
        }
      } catch {
        // Bucket likely already exists — ignore
      }
    }

    // -------------------------------------------------------------------------
    // 2. Seed sample tracks only if the table is empty
    // -------------------------------------------------------------------------
    try {
      const { count, error: countError } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        // Table may not exist yet — run MIGRATION.sql first
        console.warn('[Supabase] tracks table not ready:', countError.message);
        console.warn('[Supabase] Run MIGRATION.sql in the Supabase SQL Editor first.');
      } else if (!count || count === 0) {
        const { error: seedError } = await supabase.from('tracks').insert(SEED_TRACKS);
        if (seedError) {
          console.warn('[Supabase] Seed error:', seedError.message);
        } else {
          console.log('[Supabase] 6 sample tracks seeded successfully.');
        }
      }
    } catch (e) {
      console.warn('[Supabase] Seeding skipped:', e);
    }

    await AsyncStorage.setItem(SETUP_KEY, 'true');
    console.log('[Supabase] Setup v4 complete.');
  } catch (err) {
    console.warn('[Supabase] Setup error:', err);
  }
}
