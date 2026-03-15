-- ============================================================================
-- OGAfroman Music Tracks — Database Migration (v3 schema)
-- Run this in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/isrybftzkcaznszjefrw/sql/new
-- ============================================================================

-- 1. Drop old table if it exists with the legacy schema, then create fresh
DROP TABLE IF EXISTS tracks;

CREATE TABLE tracks (
  id           uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text           NOT NULL,
  artist       text           NOT NULL,
  album        text,
  duration     integer,
  audio_url    text,
  cover_url    text,
  price        numeric(10,2)  DEFAULT 0,
  is_exclusive boolean        DEFAULT false,
  status       text           DEFAULT 'draft',
  genre        text,
  description  text,
  created_at   timestamptz    DEFAULT now(),
  updated_at   timestamptz    DEFAULT now()
);

-- 2. Enable RLS on tracks
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- 3. Policies on tracks
DROP POLICY IF EXISTS "Public read published tracks" ON tracks;
CREATE POLICY "Public read published tracks"
  ON tracks FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Allow all operations" ON tracks;
CREATE POLICY "Allow all operations"
  ON tracks FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Seed sample tracks
INSERT INTO tracks (title, artist, album, duration, audio_url, cover_url, price, is_exclusive, status, genre, description) VALUES
(
  'Afro Vibes', 'OGAfroman', 'Roots & Rhythms', 214,
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://picsum.photos/seed/ogafroman1/400/400',
  0.00, false, 'published', 'Afrobeats',
  'A smooth afrobeats track with deep rhythms.'
),
(
  'Lagos Nights', 'OGAfroman', 'Roots & Rhythms', 187,
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://picsum.photos/seed/ogafroman2/400/400',
  1.99, false, 'published', 'Afrobeats',
  'Inspired by the energy of Lagos nightlife.'
),
(
  'Exclusive Heat', 'OGAfroman', 'Members Only', 243,
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://picsum.photos/seed/ogafroman3/400/400',
  4.99, true, 'published', 'Afropop',
  'Exclusive track for premium members only.'
),
(
  'Motherland', 'OGAfroman', 'Heritage', 198,
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://picsum.photos/seed/ogafroman4/400/400',
  0.00, false, 'published', 'Afrobeats',
  'A tribute to the African motherland.'
),
(
  'Street Anthem', 'OGAfroman', 'Heritage', 221,
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://picsum.photos/seed/ogafroman5/400/400',
  2.99, false, 'published', 'Afropop',
  'The streets speak through this anthem.'
),
(
  'VIP Access', 'OGAfroman', 'Members Only', 265,
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  'https://picsum.photos/seed/ogafroman6/400/400',
  9.99, true, 'published', 'Afrobeats',
  'Exclusive VIP-only release.'
);

-- ============================================================================
-- 5. Storage buckets — ensure they exist
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('tracks-audio', 'tracks-audio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('tracks-covers', 'tracks-covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================================================
-- 6. Storage RLS — drop ALL existing policies on storage.objects, then
--    recreate permissive ones for tracks-audio and tracks-covers so that
--    unauthenticated uploads succeed without RLS violations.
-- ============================================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- tracks-audio: fully open (no auth required)
CREATE POLICY "tracks-audio: allow select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tracks-audio');

CREATE POLICY "tracks-audio: allow insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tracks-audio');

CREATE POLICY "tracks-audio: allow update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tracks-audio')
  WITH CHECK (bucket_id = 'tracks-audio');

CREATE POLICY "tracks-audio: allow delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tracks-audio');

-- tracks-covers: fully open (no auth required)
CREATE POLICY "tracks-covers: allow select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tracks-covers');

CREATE POLICY "tracks-covers: allow insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tracks-covers');

CREATE POLICY "tracks-covers: allow update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tracks-covers')
  WITH CHECK (bucket_id = 'tracks-covers');

CREATE POLICY "tracks-covers: allow delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tracks-covers');

SELECT 'Migration v3 + storage RLS fix complete.' AS result;
