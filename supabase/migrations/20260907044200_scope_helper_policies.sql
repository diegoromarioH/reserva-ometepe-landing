-- Policies that call privileged helper functions must only be evaluated for
-- signed-in users. Otherwise anonymous public reads can fail after EXECUTE is
-- correctly revoked from the anon role.

do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and 'public' = any (roles)
      and (
        position('is_admin(' in coalesce(qual, '')) > 0
        or position('is_admin(' in coalesce(with_check, '')) > 0
        or position('is_host_for_accommodation(' in coalesce(qual, '')) > 0
        or position('is_host_for_accommodation(' in coalesce(with_check, '')) > 0
      )
  loop
    execute format(
      'alter policy %I on %I.%I to authenticated',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  end loop;
end
$$;
