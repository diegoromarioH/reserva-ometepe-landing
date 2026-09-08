create schema if not exists private;

alter table public.requests
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists requests_user_id_created_at_idx
  on public.requests (user_id, created_at desc);

create or replace function private.link_request_to_guest()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id is null and new.customer_email is not null then
    select u.id into new.user_id
    from auth.users u
    where lower(u.email) = lower(new.customer_email)
    limit 1;
  end if;
  return new;
end;
$$;

revoke all on function private.link_request_to_guest() from public, anon, authenticated;

drop trigger if exists requests_link_guest_before_insert on public.requests;
create trigger requests_link_guest_before_insert
before insert on public.requests
for each row execute function private.link_request_to_guest();

create or replace function private.link_existing_requests_to_new_guest()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.requests
  set user_id = new.id, updated_at = now()
  where user_id is null
    and customer_email is not null
    and lower(customer_email) = lower(new.email);
  return new;
end;
$$;

revoke all on function private.link_existing_requests_to_new_guest() from public, anon, authenticated;

drop trigger if exists auth_user_link_existing_requests on auth.users;
create trigger auth_user_link_existing_requests
after insert on auth.users
for each row execute function private.link_existing_requests_to_new_guest();

drop policy if exists customer_read_own_requests on public.requests;
create policy customer_read_own_requests
on public.requests
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists public_insert_requests on public.requests;
create policy public_insert_requests
on public.requests
for insert
to anon, authenticated
with check (
  (user_id is null or user_id = (select auth.uid()))
  and status = 'received'
  and assigned_to is null
  and proposal = '{}'::jsonb
  and payment_proof_url is null
);

grant select, insert on public.requests to anon, authenticated;
