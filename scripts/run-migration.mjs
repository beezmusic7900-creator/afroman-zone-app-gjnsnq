/**
 * Applies the tracks table migration directly via the Supabase Management API.
 * Run once: node scripts/run-migration.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY env var OR uses the hardcoded project ref.
 */

const PROJECT_REF = 'isrybftzkcaznszjefrw';

// Service role key — needed for DDL via the management API.
// Set via env: SUPABASE_SERVICE_ROLE_KEY=... node scripts/run-migration.mjs
// Or paste it here temporarily (never commit).
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const MIGRATION_SQL = `
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tracks' AND column_name = 'audio_file_url'
  ) THEN
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
  ELSE
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
  END IF;
END $$;

ALTER TABLE tracks DISABLE ROW LEVEL SECURITY;

INSERT INTO tracks (title, artist_name, description, audio_url, cover_art_url, price, duration_seconds, status, is_active)
SELECT v.title, v.artist_name, v.description, v.audio_url, v.cover_art_url, v.price, v.duration_seconds, v.status, v.is_active
FROM (VALUES
  ('Lagos Nights','OGAfroman','A smooth afrobeats track with deep basslines and melodic hooks.','https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3','https://picsum.photos/seed/ogafroman1/400/400',1.99::numeric(10,2),214,'published',true),
  ('Afro Vibes','OGAfroman','High energy afro fusion guaranteed to get you moving.','https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3','https://picsum.photos/seed/ogafroman2/400/400',1.99::numeric(10,2),187,'published',true)
) AS v(title, artist_name, description, audio_url, cover_art_url, price, duration_seconds, status, is_active)
WHERE NOT EXISTS (SELECT 1 FROM tracks LIMIT 1);
`;

async function runMigration() {
  if (!SERVICE_ROLE_KEY) {
    console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is not set.');
    console.error('Get it from: https://supabase.com/dashboard/project/' + PROJECT_REF + '/settings/api');
    console.error('Then run: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/run-migration.mjs');
    process.exit(1);
  }

  const url = `https://${PROJECT_REF}.supabase.co/rest/v1/rpc/exec_sql`;

  // Try via RPC first
  let res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql: MIGRATION_SQL }),
  });

  if (!res.ok) {
    // Fall back to Management API
    const mgmtUrl = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
    res = await fetch(mgmtUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: MIGRATION_SQL }),
    });
  }

  if (res.ok) {
    console.log('Migration applied successfully.');
  } else {
    const body = await res.text();
    console.error('Migration failed:', res.status, body);
    process.exit(1);
  }
}

runMigration();
