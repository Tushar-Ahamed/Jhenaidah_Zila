-- Create albums table for Facebook-style Memory Albums
CREATE TABLE IF NOT EXISTS albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  date text NOT NULL,
  location text NOT NULL DEFAULT '',
  photos text[] NOT NULL DEFAULT '{}',
  video_url text DEFAULT NULL,
  category text NOT NULL DEFAULT 'সাধারণ',
  author_id uuid DEFAULT NULL,
  author_name text NOT NULL DEFAULT '',
  author_photo text DEFAULT NULL,
  author_role text NOT NULL DEFAULT '',
  scope text NOT NULL DEFAULT 'district',
  upazila text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

-- Public can read albums
DROP POLICY IF EXISTS "public_read_albums" ON albums;
CREATE POLICY "public_read_albums" ON albums FOR SELECT
  TO anon, authenticated USING (true);

-- Committee/admin can insert albums
DROP POLICY IF EXISTS "committee_insert_albums" ON albums;
CREATE POLICY "committee_insert_albums" ON albums FOR INSERT
  TO authenticated WITH CHECK (is_committee_or_admin(auth.uid()));

-- Committee/admin can update albums
DROP POLICY IF EXISTS "committee_update_albums" ON albums;
CREATE POLICY "committee_update_albums" ON albums FOR UPDATE
  TO authenticated USING (is_committee_or_admin(auth.uid()))
  WITH CHECK (is_committee_or_admin(auth.uid()));

-- Committee/admin can delete albums
DROP POLICY IF EXISTS "committee_delete_albums" ON albums;
CREATE POLICY "committee_delete_albums" ON albums FOR DELETE
  TO authenticated USING (is_committee_or_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_albums_scope_upazila ON albums(scope, upazila);
