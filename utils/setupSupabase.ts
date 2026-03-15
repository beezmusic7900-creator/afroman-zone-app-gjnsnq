/**
 * Run this once to set up the Supabase database schema, storage bucket, and seed data.
 * Called automatically on first app load via a flag in AsyncStorage.
 */
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETUP_KEY = 'supabase_setup_v1';

export async function runSupabaseSetup(): Promise<void> {
  try {
    const done = await AsyncStorage.getItem(SETUP_KEY);
    if (done === 'true') return;

    // 1. Create tracks table via RPC (raw SQL)
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tracks (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          title text NOT NULL,
          artist_name text NOT NULL DEFAULT 'OGAfroman',
          description text,
          price numeric(10,2) DEFAULT 0,
          cover_art_url text,
          audio_file_url text NOT NULL,
          file_name text,
          file_type text,
          file_size_bytes bigint,
          duration_seconds integer,
          status text DEFAULT 'draft',
          is_active boolean DEFAULT true,
          uploaded_by text,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
        ALTER TABLE tracks DISABLE ROW LEVEL SECURITY;
      `,
    });

    // 2. Seed tracks (only if table is empty)
    const { count } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true });

    if (!count || count === 0) {
      await supabase.from('tracks').insert([
        {
          title: 'Lagos Nights',
          artist_name: 'OGAfroman',
          description: 'A smooth afrobeats track',
          price: 1.99,
          status: 'published',
          is_active: true,
          cover_art_url: 'https://picsum.photos/seed/track1/400/400',
          audio_file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        },
        {
          title: 'Afro Vibes',
          artist_name: 'OGAfroman',
          description: 'High energy afro fusion',
          price: 1.99,
          status: 'published',
          is_active: true,
          cover_art_url: 'https://picsum.photos/seed/track2/400/400',
          audio_file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        },
        {
          title: 'Street Anthem',
          artist_name: 'OGAfroman',
          description: 'For the streets',
          price: 0,
          status: 'published',
          is_active: true,
          cover_art_url: 'https://picsum.photos/seed/track3/400/400',
          audio_file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        },
      ]);
    }

    await AsyncStorage.setItem(SETUP_KEY, 'true');
    console.log('[Supabase] Setup complete');
  } catch (err) {
    // Setup errors are non-fatal — the migration SQL may already exist
    console.warn('[Supabase] Setup skipped or already done:', err);
  }
}
