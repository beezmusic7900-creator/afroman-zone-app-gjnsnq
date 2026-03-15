-- ============================================================================
-- OGAfroman Music Tracks — Database Migration
-- Run this once in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/isrybftzkcaznszjefrw/sql/new
-- ============================================================================

-- 1. Migrate existing tracks table (audio_file_url → audio_url) OR create fresh
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tracks' AND column_name = 'audio_file_url'
  ) THEN
    -- Migrate from v1 schema
    ALTER TABLE tracks ADD COLUMN IF NOT EXISTS audio_url text;
    UPDATE tracks SET audio_url = audio_file_url WHERE audio_url IS NULL;
    ALTER TABLE tracks DROP COLUMN IF EXISTS audio_file_url;
    ALTER TABLE tracks DROP COLUMN IF EXISTS file_name;
    ALTER TABLE tracks DROP COLUMN IF EXISTS file_type;
    ALTER TABLE tracks DROP COLUMN IF EXISTS file_size_bytes;
    ALTER TABLE tracks DROP COLUMN IF EXISTS uploaded_by;
    ALTER TABLE tracks ALTER COLUMN audio_url SET NOT NULL;
    ALTER TABLE tracks ALTER COLUMN artist_name SET NOT NULL;
    ALTER TABLE tracks ALTER COLUMN price SET NOT NULL;
    ALTER TABLE tracks ALTER COLUMN status SET NOT NULL;
    ALTER TABLE tracks ALTER COLUMN is_active SET NOT NULL;
    RAISE NOTICE 'Migrated tracks table from v1 to v2 schema.';
  ELSE
    -- Create fresh v2 table
    CREATE TABLE IF NOT EXISTS tracks (
      id               uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
      title            text           NOT NULL,
      artist_name      text           NOT NULL,
      description      text,
      audio_url        text           NOT NULL,
      cover_art_url    text,
      price            numeric(10,2)  NOT NULL DEFAULT 0,
      duration_seconds integer,
      status           text           NOT NULL DEFAULT 'draft',
      is_active        boolean        NOT NULL DEFAULT true,
      created_at       timestamptz    DEFAULT now(),
      updated_at       timestamptz    DEFAULT now()
    );
    RAISE NOTICE 'Created fresh tracks table (v2 schema).';
  END IF;
END $$;

-- 2. Disable RLS (admin mutations enforced at the API layer)
ALTER TABLE tracks DISABLE ROW LEVEL SECURITY;

-- 3. Seed 2 sample tracks (only if table is empty)
INSERT INTO tracks (title, artist_name, description, audio_url, cover_art_url, price, duration_seconds, status, is_active)
SELECT v.title, v.artist_name, v.description, v.audio_url, v.cover_art_url, v.price, v.duration_seconds, v.status, v.is_active
FROM (VALUES
  (
    'Lagos Nights',
    'OGAfroman',
    'A smooth afrobeats track with deep basslines and melodic hooks.',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://picsum.photos/seed/ogafroman1/400/400',
    1.99::numeric(10,2),
    214,
    'published',
    true
  ),
  (
    'Afro Vibes',
    'OGAfroman',
    'High energy afro fusion guaranteed to get you moving.',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://picsum.photos/seed/ogafroman2/400/400',
    1.99::numeric(10,2),
    187,
    'published',
    true
  )
) AS v(title, artist_name, description, audio_url, cover_art_url, price, duration_seconds, status, is_active)
WHERE NOT EXISTS (SELECT 1 FROM tracks LIMIT 1);

-- 4. Storage buckets — run these separately if the SQL editor doesn't support storage API:
--    Dashboard → Storage → New bucket → "tracks-audio" (public)
--    Dashboard → Storage → New bucket → "tracks-covers" (public)
--
--    Or via the Supabase JS client (already handled in setupSupabase.ts on first app load).

SELECT 'Migration complete. tracks table is ready.' AS result;
