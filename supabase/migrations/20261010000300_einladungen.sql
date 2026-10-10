-- Einladung annehmen: Wer sich per Login-Link angemeldet hat, hat seine E-Mail-Adresse bestätigt.
-- Alle offenen, gültigen Einladungen an diese Adresse werden zu Mitgliedschaften.
create or replace function public.einladungen_annehmen()
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_email text := lower(coalesce((select auth.jwt()) ->> 'email', ''));
  v_anzahl integer := 0;
  e record;
begin
  if v_uid is null or v_email = '' then
    raise exception 'Nicht angemeldet';
  end if;
  for e in
    select * from public.einladungen
    where lower(email) = v_email and angenommen_am is null and gueltig_bis > now()
    for update
  loop
    insert into public.mitgliedschaften (user_id, makler_id, unternehmen_id, rolle)
    values (v_uid, e.makler_id, e.unternehmen_id, e.rolle)
    on conflict do nothing;
    update public.einladungen set angenommen_am = now() where id = e.id;
    v_anzahl := v_anzahl + 1;
  end loop;
  return v_anzahl;
end;
$$;

revoke all on function public.einladungen_annehmen() from public, anon;
grant execute on function public.einladungen_annehmen() to authenticated;
