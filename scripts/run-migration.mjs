/**
 * Applies the tracks table migration + storage bucket RLS fix via Supabase APIs.
 * Run once: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/run-migration.mjs
 *
 * Get your service role key from:
 *   https://supabase.com/dashboard/project/isrybftzkcaznszjefrw/settings/api
 */

const PROJECT_REF = 'isrybftzkcaznszjefrw';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const TRACKS_MIGRATION_SQL = `
-- Drop old table and recreate with v3 schema
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

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published tracks" ON tracks;
CREATE POLICY "Public read published tracks"
  ON tracks FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Allow all operations" ON tracks;
CREATE POLICY "Allow all operations"
  ON tracks FOR ALL
  USING (true)
  WITH CHECK (true);

INSERT INTO tracks (title, artist, album, duration, audio_url, cover_url, price, is_exclusive, status, genre, description) VALUES
('Afro Vibes', 'OGAfroman', 'Roots & Rhythms', 214,
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
 'https://picsum.photos/seed/ogafroman1/400/400',
 0.00, false, 'published', 'Afrobeats', 'A smooth afrobeats track with deep rhythms.'),
('Lagos Nights', 'OGAfroman', 'Roots & Rhythms', 187,
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
 'https://picsum.photos/seed/ogafroman2/400/400',
 1.99, false, 'published', 'Afrobeats', 'Inspired by the energy of Lagos nightlife.'),
('Exclusive Heat', 'OGAfroman', 'Members Only', 243,
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
 'https://picsum.photos/seed/ogafroman3/400/400',
 4.99, true, 'published', 'Afropop', 'Exclusive track for premium members only.'),
('Motherland', 'OGAfroman', 'Heritage', 198,
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
 'https://picsum.photos/seed/ogafroman4/400/400',
 0.00, false, 'published', 'Afrobeats', 'A tribute to the African motherland.'),
('Street Anthem', 'OGAfroman', 'Heritage', 221,
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
 'https://picsum.photos/seed/ogafroman5/400/400',
 2.99, false, 'published', 'Afropop', 'The streets speak through this anthem.'),
('VIP Access', 'OGAfroman', 'Members Only', 265,
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
 'https://picsum.photos/seed/ogafroman6/400/400',
 9.99, true, 'published', 'Afrobeats', 'Exclusive VIP-only release.');
`;

// Storage RLS fix — run as a separate statement because the DO $$ block
// must be the only statement in the query for some Supabase SQL endpoints.
const STORAGE_BUCKETS_SQL = `
INSERT INTO storage.buckets (id, name, public)
VALUES ('tracks-audio', 'tracks-audio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('tracks-covers', 'tracks-covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;
`;

const DROP_STORAGE_POLICIES_SQL = `
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
`;

const CREATE_STORAGE_POLICIES_SQL = `
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

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
`;

async function runSQL(sql, label) {
  // Try the Management API (works with service role key as a personal access token)
  const mgmtUrl = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
  const res = await fetch(mgmtUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (res.ok) return { ok: true };

  // Fall back to PostgREST RPC (requires exec_sql function to exist)
  const rpcUrl = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  const res2 = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (res2.ok) return { ok: true };

  const body = await res2.text();
  return { ok: false, status: res2.status, body };
}

async function ensureBucket(bucketId) {
  const url = `${SUPABASE_URL}/storage/v1/bucket`;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  };

  const listRes = await fetch(url, { headers });
  if (listRes.ok) {
    const buckets = await listRes.json();
    if (Array.isArray(buckets) && buckets.find(b => b.id === bucketId)) {
      console.log(`  Bucket "${bucketId}" already exists — ensuring public=true.`);
      // Patch to make sure it's public
      await fetch(`${url}/${bucketId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ public: true }),
      });
      return;
    }
  }

  const createRes = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ id: bucketId, name: bucketId, public: true }),
  });

  if (createRes.ok) {
    console.log(`  Bucket "${bucketId}" created (public).`);
  } else {
    const body = await createRes.text();
    if (body.toLowerCase().includes('already exists')) {
      console.log(`  Bucket "${bucketId}" already exists — skipping.`);
    } else {
      console.warn(`  WARNING: Could not create bucket "${bucketId}": ${createRes.status} ${body}`);
    }
  }
}

async function step(label, sql) {
  process.stdout.write(`  ${label}... `);
  const result = await runSQL(sql, label);
  if (result.ok) {
    console.log('OK');
  } else {
    console.log(`FAILED (${result.status})`);
    console.error(`  Error: ${result.body}`);
    console.error('\n  Tip: Paste MIGRATION.sql directly into the Supabase SQL Editor:');
    console.error(`  https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
    process.exit(1);
  }
}

async function main() {
  if (!SERVICE_ROLE_KEY) {
    console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is not set.');
    console.error(`Get it from: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api`);
    console.error('Then run:');
    console.error('  SUPABASE_SERVICE_ROLE_KEY=<your-key> node scripts/run-migration.mjs');
    process.exit(1);
  }

  console.log('=== OGAfroman Supabase Setup ===\n');

  console.log('1. Applying tracks table migration...');
  await step('tracks table + RLS + seed data', TRACKS_MIGRATION_SQL);
  console.log();

  console.log('2. Ensuring storage buckets exist...');
  await ensureBucket('tracks-audio');
  await ensureBucket('tracks-covers');
  console.log();

  console.log('3. Fixing storage RLS policies...');
  await step('Insert bucket rows into storage.buckets', STORAGE_BUCKETS_SQL);
  await step('Drop all existing storage.objects policies', DROP_STORAGE_POLICIES_SQL);
  await step('Create permissive policies for tracks-audio + tracks-covers', CREATE_STORAGE_POLICIES_SQL);
  console.log();

  console.log('=== Setup complete ===');
  console.log('tracks table    : ready (RLS enabled, 6 seed tracks inserted)');
  console.log('tracks-audio    : public bucket, open RLS policies');
  console.log('tracks-covers   : public bucket, open RLS policies');
  console.log('\nUnauthenticated uploads to both buckets will now succeed.');
}

main();
