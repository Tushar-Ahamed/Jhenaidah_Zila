-- Create committee_members table to store year-by-year committee assignments
CREATE TABLE IF NOT EXISTS committee_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session text NOT NULL DEFAULT '২০২৬-২৭',
  scope text NOT NULL DEFAULT 'district', -- 'district' | 'upazila'
  upazila text DEFAULT NULL,
  user_id uuid DEFAULT NULL,
  member_id uuid DEFAULT NULL,
  name text NOT NULL,
  photo_url text DEFAULT NULL,
  position text NOT NULL,
  position_order integer NOT NULL DEFAULT 99,
  department text NOT NULL DEFAULT '',
  student_session text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  assigned_by uuid DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;

-- Public can read committee members
DROP POLICY IF EXISTS "public_read_committee_members" ON committee_members;
CREATE POLICY "public_read_committee_members" ON committee_members FOR SELECT
  TO anon, authenticated USING (true);

-- Committee/admin can insert
DROP POLICY IF EXISTS "committee_insert_members" ON committee_members;
CREATE POLICY "committee_insert_members" ON committee_members FOR INSERT
  TO authenticated WITH CHECK (is_committee_or_admin(auth.uid()));

-- Committee/admin can update
DROP POLICY IF EXISTS "committee_update_members" ON committee_members;
CREATE POLICY "committee_update_members" ON committee_members FOR UPDATE
  TO authenticated USING (is_committee_or_admin(auth.uid()))
  WITH CHECK (is_committee_or_admin(auth.uid()));

-- Committee/admin can delete
DROP POLICY IF EXISTS "committee_delete_members" ON committee_members;
CREATE POLICY "committee_delete_members" ON committee_members FOR DELETE
  TO authenticated USING (is_committee_or_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_committee_session_scope ON committee_members(session, scope, upazila);
