/*
 * Run this SQL in the Supabase SQL Editor before using the app:
 *
 * CREATE TABLE IF NOT EXISTS tracks (
 *   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   title text NOT NULL,
 *   artist_name text NOT NULL,
 *   description text,
 *   audio_url text NOT NULL,
 *   cover_art_url text,
 *   price numeric(10,2) NOT NULL DEFAULT 0,
 *   duration_seconds integer,
 *   status text NOT NULL DEFAULT 'draft',
 *   is_active boolean NOT NULL DEFAULT true,
 *   created_at timestamptz DEFAULT now(),
 *   updated_at timestamptz DEFAULT now()
 * );
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETUP_KEY = 'supabase_setup_v3';

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
          console.warn(`[Supabase] Could not create bucket ${bucketId}:`, error.message);
        }
      } catch (e) {
        // ignore — bucket likely already exists
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
        // Table may not exist yet — that's OK, skip seeding
        console.warn('[Supabase] Could not count tracks (table may not exist yet):', countError.message);
      } else if (!count || count === 0) {
        const { error: seedError } = await supabase.from('tracks').insert([
          {
            title: 'Afrobeat Vibes',
            artist_name: 'OGAfroman',
            description: 'An exclusive afrobeat track',
            audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            cover_art_url: 'https://picsum.photos/seed/track1/400/400',
            price: 4.99,
            duration_seconds: 214,
            status: 'published',
            is_active: true,
          },
          {
            title: 'Lagos Nights',
            artist_name: 'OGAfroman',
            description: 'Late night Lagos energy',
            audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            cover_art_url: 'https://picsum.photos/seed/track2/400/400',
            price: 4.99,
            duration_seconds: 187,
            status: 'published',
            is_active: true,
          },
        ]);
        if (seedError) {
          console.warn('[Supabase] Seed error (table may not exist yet):', seedError.message);
        } else {
          console.log('[Supabase] Sample tracks seeded successfully');
        }
      }
    } catch (e) {
      // Silently ignore — table doesn't exist yet
    }

    await AsyncStorage.setItem(SETUP_KEY, 'true');
    console.log('[Supabase] Setup v3 complete');
  } catch (err) {
    console.warn('[Supabase] Setup skipped or already done:', err);
  }
}
