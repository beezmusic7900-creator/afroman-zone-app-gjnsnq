-- ============================================================
-- Fix RLS policies for tracks-audio and tracks-covers buckets
-- ============================================================

-- 1. Create buckets if they don't exist, set public
INSERT INTO storage.buckets (id, name, public)
VALUES ('tracks-audio', 'tracks-audio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('tracks-covers', 'tracks-covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop ALL existing policies on storage.objects for these buckets
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

-- 3. Create fully permissive policies for tracks-audio
CREATE POLICY "tracks-audio: public select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tracks-audio');

CREATE POLICY "tracks-audio: public insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tracks-audio');

CREATE POLICY "tracks-audio: public update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tracks-audio');

CREATE POLICY "tracks-audio: public delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tracks-audio');

-- 4. Create fully permissive policies for tracks-covers
CREATE POLICY "tracks-covers: public select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tracks-covers');

CREATE POLICY "tracks-covers: public insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tracks-covers');

CREATE POLICY "tracks-covers: public update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tracks-covers');

CREATE POLICY "tracks-covers: public delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tracks-covers');

-- 5. Fix tracks table: ensure permissive INSERT without auth
-- Drop any restrictive insert policies first
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tracks'
      AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.tracks', pol.policyname);
  END LOOP;
END $$;

-- Allow anyone to insert into tracks
CREATE POLICY "tracks: public insert"
  ON public.tracks FOR INSERT
  WITH CHECK (true);

-- Also ensure SELECT is open (needed for reads after insert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tracks'
      AND cmd = 'SELECT' AND policyname = 'tracks: public select'
  ) THEN
    EXECUTE 'CREATE POLICY "tracks: public select" ON public.tracks FOR SELECT USING (true)';
  END IF;
END $$;
