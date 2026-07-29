-- Create event_registrations table for tracking event online participants
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  event_title text NOT NULL,
  user_id uuid DEFAULT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  department text NOT NULL DEFAULT '',
  session text NOT NULL DEFAULT '',
  payment_trx text DEFAULT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_registrations" ON event_registrations;
CREATE POLICY "public_read_registrations" ON event_registrations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_registrations" ON event_registrations;
CREATE POLICY "anon_insert_registrations" ON event_registrations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Create membership_payments table for tracking membership fee payments & cards
CREATE TABLE IF NOT EXISTS membership_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT NULL,
  member_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  upazila text DEFAULT NULL,
  department text NOT NULL DEFAULT '',
  session text NOT NULL DEFAULT '',
  amount numeric(10,2) NOT NULL DEFAULT 500.00,
  payment_method text NOT NULL DEFAULT 'bKash', -- 'bKash' | 'Nagad' | 'Rocket' | 'Bank'
  trx_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'paid' | 'pending' | 'expired'
  paid_date timestamptz DEFAULT NULL,
  expiry_date timestamptz DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE membership_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_payments" ON membership_payments;
CREATE POLICY "public_read_payments" ON membership_payments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_payments" ON membership_payments;
CREATE POLICY "authenticated_insert_payments" ON membership_payments FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_payments" ON membership_payments;
CREATE POLICY "admin_update_payments" ON membership_payments FOR UPDATE
  TO authenticated USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
