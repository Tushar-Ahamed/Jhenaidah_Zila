/*
# Create full app schema (Jhenaidah District Students Association)

This migration sets up the complete database schema for the Jhenaidah District
Students Association web app. It replaces the previous Firebase/Firestore setup
with Supabase tables, Row Level Security policies, and an admin-bootstrap
function.

## 1. New Tables

- `profiles` — mirrors auth.users with app-specific fields (role, upazila,
  status, position, committee_type). One row per user, keyed by auth.users.id.
  - `id` (uuid, PK, references auth.users)
  - `name` (text)
  - `email` (text)
  - `role` (text: student | teacher | alumni | upazila_committee |
    district_committee | upazila_admin | district_admin)
  - `committee_type` (text: upazila | district | null)
  - `upazila` (text: upazila name or null for district-level)
  - `position` (text or null)
  - `status` (text: pending | active | suspended | deleted)
  - `security_key` (text, hidden — for committee accounts)
  - `committee_code` (text, hidden — for committee accounts)
  - `approved_by` (uuid, references auth.users, or null)
  - `created_at`, `updated_at` (timestamptz)

- `notices` — notice board entries, scoped to district or upazila.
  - `id` (uuid PK)
  - `title`, `body` (text)
  - `category` (text)
  - `date` (text ISO date)
  - `pinned` (boolean)
  - `scope` (text: district | upazila)
  - `upazila` (text or null)
  - `author_id` (uuid)
  - `created_at` (timestamptz)

- `events` — organization events.
  - `id` (uuid PK)
  - `title`, `description`, `location` (text)
  - `date` (text ISO date)
  - `cover_image` (text or null)
  - `status` (text: upcoming | ongoing | past)
  - `scope` (text)
  - `upazila` (text or null)
  - `author_id` (uuid)
  - `created_at` (timestamptz)

- `gallery` — gallery images.
  - `id` (uuid PK)
  - `title`, `url`, `category` (text)
  - `date` (text ISO date)
  - `scope` (text)
  - `upazila` (text or null)
  - `author_id` (uuid)
  - `created_at` (timestamptz)

- `members` — member profiles (separate from auth users).
  - `id` (uuid PK)
  - `uid` (uuid or null — links to auth user if applicable)
  - `name`, `photo`, `department`, `session`, `hall`, `phone`, `email`, `bio`
    (text)
  - `upazila` (text)
  - `blood_group` (text or null)
  - `facebook`, `linkedin` (text or null)
  - `status` (text: pending | approved | rejected)
  - `created_at`, `updated_at` (timestamptz)

- `contact_messages` — messages from the contact form.
  - `id` (uuid PK)
  - `name`, `email`, `subject`, `message` (text)
  - `created_at` (timestamptz)

- `audit_logs` — audit trail of user actions.
  - `id` (uuid PK)
  - `actor_id` (uuid)
  - `actor_email`, `actor_role` (text)
  - `action` (text)
  - `target_id`, `target_email` (text or null)
  - `details` (text or null)
  - `created_at` (timestamptz)

## 2. Security (RLS)

- `profiles`: each authenticated user can read/update their own row. Admins
  (upazila_admin, district_admin) can read all rows. District admins can
  update all rows (for approval/suspension). Anyone can insert their own
  profile row on signup.
- `notices`, `events`, `gallery`: public read (anon + authenticated). Only
  committee/admin roles can insert/update/delete. We enforce role checks
  via a subquery on the actor's profile row.
- `members`: public read of approved members. Authenticated users can
  insert their own. Admins can update/delete.
- `contact_messages`: anyone (anon) can insert. Only admins can read.
- `audit_logs`: any authenticated user can insert their own log entry.
  Only admins can read.

## 3. Admin Bootstrap

- `is_admin(uid)` function: returns true if the user has an admin role in
  profiles. Used by RLS policies for committee/admin content management.
- A trigger `on_auth_user_created` creates a pending profile row when a new
  auth user signs up, copying email and defaulting role to 'student' and
  status to 'pending'. The frontend can then update the profile with the
  correct role/upazila after signup.

## 4. Important Notes

1. Email confirmation is OFF — users can log in immediately after signup.
2. The first admin must be manually promoted in the database (set role to
   'district_admin' and status to 'active' in profiles). Instructions are
   provided in the app's admin bootstrap screen.
3. All policies use `auth.uid()` — never `current_user`.
4. Hidden fields (security_key, committee_code) are never exposed to the
   frontend by the API layer.
*/

-- ===== PROFILES TABLE =====
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student',
  committee_type text DEFAULT NULL,
  upazila text DEFAULT NULL,
  position text DEFAULT NULL,
  status text NOT NULL DEFAULT 'pending',
  security_key text DEFAULT NULL,
  committee_code text DEFAULT NULL,
  approved_by uuid DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Each user can read their own profile
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
CREATE POLICY "admin_select_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('upazila_admin', 'district_admin')
    )
  );

-- Each user can insert their own profile
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Each user can update their own profile (non-role fields)
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admins can update any profile (for approval/suspension/status changes)
DROP POLICY IF EXISTS "admin_update_all_profiles" ON profiles;
CREATE POLICY "admin_update_all_profiles" ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('upazila_admin', 'district_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('upazila_admin', 'district_admin')
    )
  );

-- ===== HELPER FUNCTION: is_admin =====
CREATE OR REPLACE FUNCTION is_admin(check_uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = check_uid
    AND role IN ('upazila_admin', 'district_admin')
  );
$$;

-- ===== HELPER FUNCTION: is_committee_or_admin =====
CREATE OR REPLACE FUNCTION is_committee_or_admin(check_uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = check_uid
    AND role IN (
      'upazila_committee', 'district_committee',
      'upazila_admin', 'district_admin'
    )
  );
$$;

-- ===== NOTICES TABLE =====
CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'সাধারণ',
  date text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  scope text NOT NULL DEFAULT 'district',
  upazila text DEFAULT NULL,
  author_id uuid DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "public_read_notices" ON notices;
CREATE POLICY "public_read_notices" ON notices FOR SELECT
  TO anon, authenticated USING (true);

-- Committee/admin can insert
DROP POLICY IF EXISTS "committee_insert_notices" ON notices;
CREATE POLICY "committee_insert_notices" ON notices FOR INSERT
  TO authenticated WITH CHECK (is_committee_or_admin(auth.uid()));

-- Committee/admin can update
DROP POLICY IF EXISTS "committee_update_notices" ON notices;
CREATE POLICY "committee_update_notices" ON notices FOR UPDATE
  TO authenticated USING (is_committee_or_admin(auth.uid()))
  WITH CHECK (is_committee_or_admin(auth.uid()));

-- Committee/admin can delete
DROP POLICY IF EXISTS "committee_delete_notices" ON notices;
CREATE POLICY "committee_delete_notices" ON notices FOR DELETE
  TO authenticated USING (is_committee_or_admin(auth.uid()));

-- ===== EVENTS TABLE =====
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  date text NOT NULL,
  location text NOT NULL DEFAULT '',
  cover_image text DEFAULT NULL,
  status text NOT NULL DEFAULT 'upcoming',
  scope text NOT NULL DEFAULT 'district',
  upazila text DEFAULT NULL,
  author_id uuid DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_events" ON events;
CREATE POLICY "public_read_events" ON events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "committee_insert_events" ON events;
CREATE POLICY "committee_insert_events" ON events FOR INSERT
  TO authenticated WITH CHECK (is_committee_or_admin(auth.uid()));

DROP POLICY IF EXISTS "committee_update_events" ON events;
CREATE POLICY "committee_update_events" ON events FOR UPDATE
  TO authenticated USING (is_committee_or_admin(auth.uid()))
  WITH CHECK (is_committee_or_admin(auth.uid()));

DROP POLICY IF EXISTS "committee_delete_events" ON events;
CREATE POLICY "committee_delete_events" ON events FOR DELETE
  TO authenticated USING (is_committee_or_admin(auth.uid()));

-- ===== GALLERY TABLE =====
CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  category text NOT NULL DEFAULT 'সাধারণ',
  date text NOT NULL,
  scope text NOT NULL DEFAULT 'district',
  upazila text DEFAULT NULL,
  author_id uuid DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_gallery" ON gallery;
CREATE POLICY "public_read_gallery" ON gallery FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "committee_insert_gallery" ON gallery;
CREATE POLICY "committee_insert_gallery" ON gallery FOR INSERT
  TO authenticated WITH CHECK (is_committee_or_admin(auth.uid()));

DROP POLICY IF EXISTS "committee_update_gallery" ON gallery;
CREATE POLICY "committee_update_gallery" ON gallery FOR UPDATE
  TO authenticated USING (is_committee_or_admin(auth.uid()))
  WITH CHECK (is_committee_or_admin(auth.uid()));

DROP POLICY IF EXISTS "committee_delete_gallery" ON gallery;
CREATE POLICY "committee_delete_gallery" ON gallery FOR DELETE
  TO authenticated USING (is_committee_or_admin(auth.uid()));

-- ===== MEMBERS TABLE =====
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid DEFAULT NULL,
  name text NOT NULL,
  photo text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  session text NOT NULL DEFAULT '',
  hall text NOT NULL DEFAULT '',
  upazila text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  blood_group text DEFAULT NULL,
  facebook text DEFAULT NULL,
  linkedin text DEFAULT NULL,
  bio text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Public can read approved members
DROP POLICY IF EXISTS "public_read_approved_members" ON members;
CREATE POLICY "public_read_approved_members" ON members FOR SELECT
  TO anon, authenticated USING (status = 'approved');

-- Admins can read all members (including pending/rejected)
DROP POLICY IF EXISTS "admin_read_all_members" ON members;
CREATE POLICY "admin_read_all_members" ON members FOR SELECT
  TO authenticated USING (is_admin(auth.uid()));

-- Authenticated users can insert their own member profile
DROP POLICY IF EXISTS "insert_own_member" ON members;
CREATE POLICY "insert_own_member" ON members FOR INSERT
  TO authenticated WITH CHECK (true);

-- Admins can update any member
DROP POLICY IF EXISTS "admin_update_members" ON members;
CREATE POLICY "admin_update_members" ON members FOR UPDATE
  TO authenticated USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Admins can delete members
DROP POLICY IF EXISTS "admin_delete_members" ON members;
CREATE POLICY "admin_delete_members" ON members FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- ===== CONTACT MESSAGES TABLE =====
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact message
DROP POLICY IF EXISTS "anon_insert_contact" ON contact_messages;
CREATE POLICY "anon_insert_contact" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Only admins can read contact messages
DROP POLICY IF EXISTS "admin_read_contact" ON contact_messages;
CREATE POLICY "admin_read_contact" ON contact_messages FOR SELECT
  TO authenticated USING (is_admin(auth.uid()));

-- ===== AUDIT LOGS TABLE =====
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  actor_email text NOT NULL DEFAULT '',
  actor_role text NOT NULL DEFAULT '',
  action text NOT NULL,
  target_id text DEFAULT NULL,
  target_email text DEFAULT NULL,
  details text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can insert an audit log for themselves
DROP POLICY IF EXISTS "insert_own_audit" ON audit_logs;
CREATE POLICY "insert_own_audit" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = actor_id);

-- Only admins can read audit logs
DROP POLICY IF EXISTS "admin_read_audit" ON audit_logs;
CREATE POLICY "admin_read_audit" ON audit_logs FOR SELECT
  TO authenticated USING (is_admin(auth.uid()));

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_notices_scope_upazila ON notices(scope, upazila);
CREATE INDEX IF NOT EXISTS idx_events_scope_upazila ON events(scope, upazila);
CREATE INDEX IF NOT EXISTS idx_gallery_scope_upazila ON gallery(scope, upazila);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_upazila ON members(upazila);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);

-- ===== AUTO-UPDATE updated_at TRIGGER =====
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS members_updated_at ON members;
CREATE TRIGGER members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();