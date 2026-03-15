/**
 * Applies the tracks table migration + creates storage buckets via Supabase APIs.
 * Run once: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/run-migration.mjs
 *
 * Get your service role key from:
 *   https://supabase.com/dashboard/project/isrybftzkcaznszjefrw/settings/api
 */

const PROJECT_REF = 'isrybftzkcaznszjefrw';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const MIGRATION_SQL = `
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

-- Enable RLS
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Public read for published tracks
DROP POLICY IF EXISTS "Public read published tracks" ON tracks;
CREATE POLICY "Public read published tracks"
  ON tracks FOR SELECT
  USING (status = 'published');

-- Permissive full-access policy (no auth required for now)
DROP POLICY IF EXISTS "Allow all operations" ON tracks;
CREATE POLICY "Allow all operations"
  ON tracks FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed sample tracks
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

async function runSQL(sql) {
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

  // Check if bucket already exists
  const listRes = await fetch(url, { headers });
  if (listRes.ok) {
    const buckets = await listRes.json();
    if (Array.isArray(buckets) && buckets.find(b => b.id === bucketId)) {
      console.log(`  Bucket "${bucketId}" already exists — skipping.`);
      return;
    }
  }

  // Create the bucket
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

async function main() {
  if (!SERVICE_ROLE_KEY) {
    console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is not set.');
    console.error(`Get it from: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api`);
    console.error('Then run:');
    console.error('  SUPABASE_SERVICE_ROLE_KEY=<your-key> node scripts/run-migration.mjs');
    process.exit(1);
  }

  console.log('=== OGAfroman Supabase Setup ===\n');

  // 1. Run SQL migration
  console.log('1. Applying tracks table migration...');
  const result = await runSQL(MIGRATION_SQL);
  if (result.ok) {
    console.log('   Migration applied successfully.\n');
  } else {
    console.error(`   Migration FAILED (${result.status}): ${result.body}`);
    console.error('\n   Tip: If the Management API rejects your key, paste MIGRATION.sql');
    console.error('   directly into the Supabase SQL Editor:');
    console.error(`   https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
    process.exit(1);
  }

  // 2. Create storage buckets
  console.log('2. Ensuring storage buckets exist...');
  await ensureBucket('tracks-audio');
  await ensureBucket('tracks-covers');

  console.log('\n=== Setup complete ===');
  console.log('tracks table: ready (RLS enabled, 6 seed tracks inserted)');
  console.log('tracks-audio: public bucket');
  console.log('tracks-covers: public bucket');
}

main();
