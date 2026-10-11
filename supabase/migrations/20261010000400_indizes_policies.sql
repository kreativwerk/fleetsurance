-- Hinweise der Supabase-Advisors (Performance):
-- 1. Fremdschlüssel, die in Zugriffsregeln und beim Löschen genutzt werden, bekommen einen Index.
-- 2. „for all“-Policies überlappen beim Lesen mit den Lese-Policies; daher getrennt nach Aktion.

create index if not exists einladungen_makler_idx on public.einladungen (makler_id);
create index if not exists einladungen_unternehmen_idx on public.einladungen (unternehmen_id, makler_id);
create index if not exists mitgliedschaften_makler_idx on public.mitgliedschaften (makler_id);
create index if not exists mitgliedschaften_unternehmen_idx on public.mitgliedschaften (unternehmen_id, makler_id);
create index if not exists schaeden_fahrzeug_idx on public.schaeden (fahrzeug_id, unternehmen_id);
create index if not exists nachrichten_unternehmen_idx on public.schaden_nachrichten (unternehmen_id);
create index if not exists nachrichten_makler_idx on public.schaden_nachrichten (makler_id);
create index if not exists dauer_evb_makler_idx on public.dauer_evb (makler_id);
create index if not exists monatsquoten_makler_idx on public.monatsquoten (makler_id);

drop policy evb_pflegen on public.dauer_evb;
create policy evb_anlegen on public.dauer_evb for insert to authenticated
  with check (exists (select 1 from public.unternehmen u where u.id = unternehmen_id and privat.ist_makler_von(u.makler_id)));
create policy evb_aendern on public.dauer_evb for update to authenticated
  using (exists (select 1 from public.unternehmen u where u.id = unternehmen_id and privat.ist_makler_von(u.makler_id)))
  with check (exists (select 1 from public.unternehmen u where u.id = unternehmen_id and privat.ist_makler_von(u.makler_id)));
create policy evb_loeschen on public.dauer_evb for delete to authenticated
  using (exists (select 1 from public.unternehmen u where u.id = unternehmen_id and privat.ist_makler_von(u.makler_id)));

drop policy quoten_pflegen on public.monatsquoten;
create policy quoten_anlegen on public.monatsquoten for insert to authenticated
  with check (exists (select 1 from public.unternehmen u where u.id = unternehmen_id and privat.ist_makler_von(u.makler_id)));
create policy quoten_aendern on public.monatsquoten for update to authenticated
  using (exists (select 1 from public.unternehmen u where u.id = unternehmen_id and privat.ist_makler_von(u.makler_id)))
  with check (exists (select 1 from public.unternehmen u where u.id = unternehmen_id and privat.ist_makler_von(u.makler_id)));
create policy quoten_loeschen on public.monatsquoten for delete to authenticated
  using (exists (select 1 from public.unternehmen u where u.id = unternehmen_id and privat.ist_makler_von(u.makler_id)));
