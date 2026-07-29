-- Enable RLS on profiles table
alter table public.profiles enable row level security;

-- Allow users to read their own profile and allow admins to read all profiles
create policy if not exists "profiles_select_own_or_admin"
  on public.profiles
  for select
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('district_admin', 'upazila_admin')
    )
  );

-- Allow district admins to insert/update profiles for committee accounts
create policy if not exists "profiles_insert_by_district_admin"
  on public.profiles
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'district_admin'
    )
  );

-- Allow district admins and upazila admins to update relevant profiles
create policy if not exists "profiles_update_by_admin"
  on public.profiles
  for update
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('district_admin', 'upazila_admin')
    )
  );

-- Prevent non-admins from inserting arbitrary profiles
create policy if not exists "profiles_no_insert_for_others"
  on public.profiles
  for insert
  with check (
    auth.uid() = id
  );
