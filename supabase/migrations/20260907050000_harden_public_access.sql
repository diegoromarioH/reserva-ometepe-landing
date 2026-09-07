-- Restrict operational data to actual administrators and reduce the RPC surface.
-- Public content reads and anonymous form/event inserts remain available.

alter function public.set_updated_at() set search_path = '';

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_host_for_accommodation(uuid) from public, anon;
revoke all on function public.set_updated_at() from public, anon, authenticated;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_host_for_accommodation(uuid) to authenticated;

drop policy if exists "Staff read contact messages" on public.contact_messages;
create policy "Staff read contact messages"
on public.contact_messages for select to authenticated
using ((select public.is_admin()));

drop policy if exists admin_read_analytics_events on public.analytics_events;
create policy admin_read_analytics_events
on public.analytics_events for select to authenticated
using ((select public.is_admin()));

drop policy if exists admin_read_conversion_funnel_events on public.conversion_funnel_events;
create policy admin_read_conversion_funnel_events
on public.conversion_funnel_events for select to authenticated
using ((select public.is_admin()));

drop policy if exists admin_insert_audit_logs on public.audit_logs;
create policy admin_insert_audit_logs
on public.audit_logs for insert to authenticated
with check ((select public.is_admin()));

drop policy if exists admin_read_audit_logs on public.audit_logs;
create policy admin_read_audit_logs
on public.audit_logs for select to authenticated
using ((select public.is_admin()));

drop policy if exists own_profile_read on public.profiles;
create policy own_profile_read
on public.profiles for select to authenticated
using ((select auth.uid()) = id or (select public.is_admin()));

drop policy if exists "Staff read requests" on public.requests;
create policy "Staff read requests"
on public.requests for select to authenticated
using ((select public.is_admin()));

drop policy if exists "Staff update requests" on public.requests;
create policy "Staff update requests"
on public.requests for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Public insert contact messages" on public.contact_messages;
create policy "Public insert contact messages"
on public.contact_messages for insert to anon, authenticated
with check (true);

drop policy if exists public_insert_analytics_events on public.analytics_events;
create policy public_insert_analytics_events
on public.analytics_events for insert to anon, authenticated
with check (true);

drop policy if exists public_insert_conversion_funnel_events on public.conversion_funnel_events;
create policy public_insert_conversion_funnel_events
on public.conversion_funnel_events for insert to anon, authenticated
with check (true);

drop policy if exists "Public insert requests" on public.requests;
drop policy if exists public_insert_requests on public.requests;
create policy public_insert_requests
on public.requests for insert to anon, authenticated
with check (true);

drop policy if exists public_insert_newsletters on public.newsletters;
create policy public_insert_newsletters
on public.newsletters for insert to anon, authenticated
with check (true);
