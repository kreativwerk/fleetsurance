-- Zugriffsregeln (RLS) und Trigger.
-- Hilfsfunktionen liegen im Schema „privat“, das nicht über die API erreichbar ist.

create schema if not exists privat;
revoke all on schema privat from public;
grant usage on schema privat to authenticated;

-- Ist der angemeldete Nutzer Makler-Mitarbeiter dieses Maklers?
create or replace function privat.ist_makler_von(p_makler uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.mitgliedschaften m
    where m.user_id = (select auth.uid())
      and m.makler_id = p_makler
      and m.rolle in ('makler_admin', 'makler_mitarbeiter')
  );
$$;

create or replace function privat.ist_makler_admin_von(p_makler uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.mitgliedschaften m
    where m.user_id = (select auth.uid()) and m.makler_id = p_makler and m.rolle = 'makler_admin'
  );
$$;

-- Ist der angemeldete Nutzer Mitglied (DSP-Seite) dieses Unternehmens?
create or replace function privat.ist_mitglied_von(p_unternehmen uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.mitgliedschaften m
    where m.user_id = (select auth.uid())
      and m.unternehmen_id = p_unternehmen
      and m.rolle in ('unternehmen_admin', 'fuhrparkleitung')
  );
$$;

-- Darf der Nutzer die Daten dieses Unternehmens sehen? (eigenes Unternehmen oder betreuender Makler)
create or replace function privat.darf_unternehmen_sehen(p_unternehmen uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select privat.ist_mitglied_von(p_unternehmen)
      or exists (
        select 1 from public.unternehmen u
        where u.id = p_unternehmen and privat.ist_makler_von(u.makler_id)
      );
$$;

-- Welche Seite ist der Nutzer für dieses Unternehmen? (null = keine)
create or replace function privat.seite_fuer(p_unternehmen uuid)
returns public.seite language sql stable security definer set search_path = '' as $$
  select case
    when privat.ist_mitglied_von(p_unternehmen) then 'dsp'::public.seite
    when exists (select 1 from public.unternehmen u where u.id = p_unternehmen and privat.ist_makler_von(u.makler_id))
      then 'makler'::public.seite
  end;
$$;

grant execute on all functions in schema privat to authenticated;

-- ---------------------------------------------------------------------------
-- Trigger: makler_id immer aus dem Unternehmen ableiten (kein Fälschen möglich)
-- ---------------------------------------------------------------------------
create or replace function privat.setze_makler_id()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  select u.makler_id into new.makler_id from public.unternehmen u where u.id = new.unternehmen_id;
  if new.makler_id is null then
    raise exception 'Unbekanntes Unternehmen';
  end if;
  return new;
end;
$$;

create trigger fahrzeuge_makler before insert or update of unternehmen_id on public.fahrzeuge
  for each row execute function privat.setze_makler_id();
create trigger schaeden_makler before insert or update of unternehmen_id on public.schaeden
  for each row execute function privat.setze_makler_id();
create trigger dauer_evb_makler before insert or update of unternehmen_id on public.dauer_evb
  for each row execute function privat.setze_makler_id();
create trigger monatsquoten_makler before insert or update of unternehmen_id on public.monatsquoten
  for each row execute function privat.setze_makler_id();

-- Nachrichten: Unternehmen, Makler, Autor und Seite kommen vom Server, nicht vom Client.
create or replace function privat.nachricht_vorbereiten()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  select s.unternehmen_id, s.makler_id into new.unternehmen_id, new.makler_id
  from public.schaeden s where s.id = new.schaden_id;
  if new.unternehmen_id is null then
    raise exception 'Unbekannter Schaden';
  end if;
  if new.typ = 'nachricht' then
    new.autor_id := (select auth.uid());
    new.seite := privat.seite_fuer(new.unternehmen_id);
    if new.seite is null then
      raise exception 'Kein Zugriff auf diesen Schaden';
    end if;
    if new.sichtbarkeit = 'makler_intern' and new.seite <> 'makler' then
      raise exception 'Interne Notizen sind nur für Makler';
    end if;
  end if;
  new.erstellt_am := now();
  new.zurueckgezogen_am := null;
  return new;
end;
$$;

create trigger nachricht_vorbereiten before insert on public.schaden_nachrichten
  for each row execute function privat.nachricht_vorbereiten();

-- Nachrichten sind unveränderlich; erlaubt ist nur das Zurückziehen der eigenen Nachricht.
create or replace function privat.nachricht_nur_zurueckziehen()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.autor_id is distinct from (select auth.uid()) then
    raise exception 'Nur eigene Nachrichten können zurückgezogen werden';
  end if;
  if old.zurueckgezogen_am is not null then
    raise exception 'Bereits zurückgezogen';
  end if;
  if new.zurueckgezogen_am is null
     or (to_jsonb(new) - 'zurueckgezogen_am') is distinct from (to_jsonb(old) - 'zurueckgezogen_am') then
    raise exception 'Nachrichten können nicht geändert, nur zurückgezogen werden';
  end if;
  new := old;
  new.zurueckgezogen_am := now();
  return new;
end;
$$;

create trigger nachricht_unveraenderlich before update on public.schaden_nachrichten
  for each row execute function privat.nachricht_nur_zurueckziehen();

-- Statuswechsel eines Schadens: Verlauf und Status-Ereignis im Chat automatisch schreiben.
create or replace function privat.schaden_status_protokollieren()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  label text := case new.status
    when 'gemeldet' then 'Gemeldet'
    when 'geprueft' then 'Geprüft'
    when 'beim_versicherer' then 'Beim Versicherer'
    when 'reguliert' then 'Reguliert'
  end;
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.schaden_statusverlauf (schaden_id, status, geaendert_von)
    values (new.id, new.status, (select auth.uid()));
    if tg_op = 'UPDATE' then
      insert into public.schaden_nachrichten (schaden_id, unternehmen_id, makler_id, typ, text)
      values (new.id, new.unternehmen_id, new.makler_id, 'status_ereignis', 'Status geändert: ' || label);
    end if;
  end if;
  return new;
end;
$$;

create trigger schaden_status_protokoll after insert or update of status on public.schaeden
  for each row execute function privat.schaden_status_protokollieren();

-- DSP darf beim Melden keinen anderen Status als „gemeldet“ setzen und danach nichts mehr ändern.
create or replace function privat.schaden_dsp_grenzen()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if privat.seite_fuer(new.unternehmen_id) = 'dsp' then
    if tg_op = 'INSERT' then
      new.status := 'gemeldet';
      new.schadensnummer_versicherer := null;
      new.erstellt_von := (select auth.uid());
    end if;
  end if;
  return new;
end;
$$;

create trigger schaden_dsp_grenzen before insert on public.schaeden
  for each row execute function privat.schaden_dsp_grenzen();

-- Prüfprotokoll für Änderungen an Fachdaten (ohne Inhalte, nur wer/was/wann).
create or replace function privat.protokolliere()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_log (user_id, aktion, tabelle, datensatz_id)
  values ((select auth.uid()), lower(tg_op), tg_table_name,
          coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id', to_jsonb(new) ->> 'unternehmen_id'));
  return coalesce(new, old);
end;
$$;

create trigger audit_fahrzeuge after insert or update or delete on public.fahrzeuge
  for each row execute function privat.protokolliere();
create trigger audit_schaeden after insert or update or delete on public.schaeden
  for each row execute function privat.protokolliere();
create trigger audit_dauer_evb after insert or update or delete on public.dauer_evb
  for each row execute function privat.protokolliere();
create trigger audit_mitgliedschaften after insert or update or delete on public.mitgliedschaften
  for each row execute function privat.protokolliere();

-- ---------------------------------------------------------------------------
-- RLS aktivieren
-- ---------------------------------------------------------------------------
alter table public.makler enable row level security;
alter table public.unternehmen enable row level security;
alter table public.mitgliedschaften enable row level security;
alter table public.einladungen enable row level security;
alter table public.fahrzeuge enable row level security;
alter table public.schaeden enable row level security;
alter table public.schaden_statusverlauf enable row level security;
alter table public.schaden_nachrichten enable row level security;
alter table public.schaden_lesestatus enable row level security;
alter table public.dauer_evb enable row level security;
alter table public.monatsquoten enable row level security;
alter table public.audit_log enable row level security;
-- audit_log: bewusst keine Policy → per API für niemanden lesbar oder schreibbar.

-- Makler: Makler-Mitarbeiter und Mitglieder betreuter Unternehmen sehen den Makler.
create policy makler_lesen on public.makler for select to authenticated using (
  privat.ist_makler_von(id)
  or exists (select 1 from public.unternehmen u where u.makler_id = makler.id and privat.ist_mitglied_von(u.id))
);
create policy makler_aendern on public.makler for update to authenticated
  using (privat.ist_makler_admin_von(id)) with check (privat.ist_makler_admin_von(id));

-- Unternehmen
create policy unternehmen_lesen on public.unternehmen for select to authenticated
  using (privat.darf_unternehmen_sehen(id));
create policy unternehmen_anlegen on public.unternehmen for insert to authenticated
  with check (privat.ist_makler_admin_von(makler_id));
create policy unternehmen_aendern on public.unternehmen for update to authenticated
  using (privat.ist_makler_admin_von(makler_id)) with check (privat.ist_makler_admin_von(makler_id));

-- Mitgliedschaften: eigene sehen; Makler-Admins sehen die ihres Maklers. Anlegen nur über Einladung (Server).
create policy mitgliedschaften_lesen on public.mitgliedschaften for select to authenticated
  using (user_id = (select auth.uid()) or privat.ist_makler_admin_von(makler_id));

-- Einladungen: nur Makler-Admins verwalten sie. Annehmen läuft serverseitig.
create policy einladungen_lesen on public.einladungen for select to authenticated
  using (privat.ist_makler_admin_von(makler_id));
create policy einladungen_anlegen on public.einladungen for insert to authenticated
  with check (privat.ist_makler_admin_von(makler_id) and erstellt_von = (select auth.uid()));

-- Fahrzeuge: sehen beide Seiten; pflegen der DSP (Unternehmens-Admin) und der Makler.
create policy fahrzeuge_lesen on public.fahrzeuge for select to authenticated
  using (privat.darf_unternehmen_sehen(unternehmen_id));
create policy fahrzeuge_schreiben on public.fahrzeuge for insert to authenticated
  with check (privat.darf_unternehmen_sehen(unternehmen_id));
create policy fahrzeuge_aendern on public.fahrzeuge for update to authenticated
  using (privat.darf_unternehmen_sehen(unternehmen_id)) with check (privat.darf_unternehmen_sehen(unternehmen_id));

-- Schäden: beide Seiten lesen und melden; Status und Bearbeitung nur durch den Makler.
create policy schaeden_lesen on public.schaeden for select to authenticated
  using (privat.darf_unternehmen_sehen(unternehmen_id));
create policy schaeden_melden on public.schaeden for insert to authenticated
  with check (privat.darf_unternehmen_sehen(unternehmen_id));
create policy schaeden_bearbeiten on public.schaeden for update to authenticated
  using (privat.ist_makler_von(makler_id)) with check (privat.ist_makler_von(makler_id));

create policy statusverlauf_lesen on public.schaden_statusverlauf for select to authenticated
  using (exists (select 1 from public.schaeden s where s.id = schaden_id and privat.darf_unternehmen_sehen(s.unternehmen_id)));

-- Chat: interne Notizen nur für Makler. Schreiben nur als Nachricht (Status-Ereignisse kommen vom Trigger).
create policy nachrichten_lesen on public.schaden_nachrichten for select to authenticated using (
  privat.darf_unternehmen_sehen(unternehmen_id)
  and (sichtbarkeit = 'alle' or privat.ist_makler_von(makler_id))
);
create policy nachrichten_schreiben on public.schaden_nachrichten for insert to authenticated with check (
  typ = 'nachricht'
  and exists (select 1 from public.schaeden s where s.id = schaden_id and privat.darf_unternehmen_sehen(s.unternehmen_id))
);
create policy nachrichten_zurueckziehen on public.schaden_nachrichten for update to authenticated
  using (autor_id = (select auth.uid()));

-- Lesestatus: jede Seite pflegt nur ihren eigenen.
create policy lesestatus_lesen on public.schaden_lesestatus for select to authenticated
  using (exists (select 1 from public.schaeden s where s.id = schaden_id and privat.darf_unternehmen_sehen(s.unternehmen_id)));
create policy lesestatus_setzen on public.schaden_lesestatus for insert to authenticated
  with check (exists (select 1 from public.schaeden s where s.id = schaden_id and privat.seite_fuer(s.unternehmen_id) = seite));
create policy lesestatus_aktualisieren on public.schaden_lesestatus for update to authenticated
  using (exists (select 1 from public.schaeden s where s.id = schaden_id and privat.seite_fuer(s.unternehmen_id) = seite))
  with check (exists (select 1 from public.schaeden s where s.id = schaden_id and privat.seite_fuer(s.unternehmen_id) = seite));

-- Dauer-eVB und Monatsquoten: beide Seiten lesen, nur der Makler pflegt.
create policy evb_lesen on public.dauer_evb for select to authenticated
  using (privat.darf_unternehmen_sehen(unternehmen_id));
create policy evb_pflegen on public.dauer_evb for all to authenticated
  using (exists (select 1 from public.unternehmen u where u.id = unternehmen_id and privat.ist_makler_von(u.makler_id)))
  with check (exists (select 1 from public.unternehmen u where u.id = unternehmen_id and privat.ist_makler_von(u.makler_id)));

create policy quoten_lesen on public.monatsquoten for select to authenticated
  using (privat.darf_unternehmen_sehen(unternehmen_id));
create policy quoten_pflegen on public.monatsquoten for all to authenticated
  using (exists (select 1 from public.unternehmen u where u.id = unternehmen_id and privat.ist_makler_von(u.makler_id)))
  with check (exists (select 1 from public.unternehmen u where u.id = unternehmen_id and privat.ist_makler_von(u.makler_id)));

-- Keine Rechte für anonyme Zugriffe.
revoke all on all tables in schema public from anon;
grant select, insert, update on all tables in schema public to authenticated;
revoke all on public.audit_log from authenticated;
grant delete on public.dauer_evb, public.monatsquoten to authenticated;
