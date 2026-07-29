alter table public.audit_logs enable row level security;

create policy if not exists "audit_logs_select_admin"
  on public.audit_logs
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('district_admin', 'upazila_admin')
    )
  );

create policy if not exists "audit_logs_insert_self_or_admin"
  on public.audit_logs
  for insert
  with check (
    auth.uid() = actor_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('district_admin', 'upazila_admin')
    )
  );
