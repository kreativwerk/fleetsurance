-- RLS-Tests: Mandantentrennung, interne Notizen, Rechte je Seite.
-- Alle Daten sind synthetisch.

create schema test;
grant usage on schema test to authenticated, anon;

create function test.gleich(ist bigint, soll bigint, was text) returns void language plpgsql as $$
begin
  if ist is distinct from soll then
    raise exception 'FEHLER: % (ist %, soll %)', was, ist, soll;
  end if;
  raise notice 'ok: %', was;
end;
$$;

-- Erwartet, dass eine Anweisung scheitert (RLS oder Trigger).
create function test.verboten(sql text, was text) returns void language plpgsql as $$
declare
  zeilen bigint;
begin
  begin
    execute sql;
    get diagnostics zeilen = row_count;
  exception when others then
    raise notice 'ok (abgelehnt): %', was;
    return;
  end;
  if zeilen = 0 then
    raise notice 'ok (0 Zeilen): %', was;
    return;
  end if;
  raise exception 'FEHLER: % wurde erlaubt (% Zeilen)', was, zeilen;
end;
$$;
grant execute on all functions in schema test to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Testdaten (als Superuser, RLS greift hier nicht)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'makler.a@example.test'),
  ('00000000-0000-0000-0000-00000000000b', 'makler.b@example.test'),
  ('00000000-0000-0000-0000-0000000000a1', 'dsp.a1@example.test'),
  ('00000000-0000-0000-0000-0000000000a2', 'dsp.a2@example.test'),
  ('00000000-0000-0000-0000-0000000000b1', 'dsp.b1@example.test');

insert into public.makler (id, name) values
  ('10000000-0000-0000-0000-00000000000a', 'Makler A'),
  ('10000000-0000-0000-0000-00000000000b', 'Makler B');

insert into public.unternehmen (id, makler_id, name) values
  ('20000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-00000000000a', 'Firma A1'),
  ('20000000-0000-0000-0000-0000000000a2', '10000000-0000-0000-0000-00000000000a', 'Firma A2'),
  ('20000000-0000-0000-0000-0000000000b1', '10000000-0000-0000-0000-00000000000b', 'Firma B1');

insert into public.mitgliedschaften (user_id, makler_id, unternehmen_id, rolle) values
  ('00000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000a', null, 'makler_admin'),
  ('00000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-00000000000b', null, 'makler_admin'),
  ('00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-0000000000a1', 'fuhrparkleitung'),
  ('00000000-0000-0000-0000-0000000000a2', '10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-0000000000a2', 'fuhrparkleitung'),
  ('00000000-0000-0000-0000-0000000000b1', '10000000-0000-0000-0000-00000000000b', '20000000-0000-0000-0000-0000000000b1', 'fuhrparkleitung');

-- makler_id absichtlich falsch angegeben: der Trigger muss ihn korrigieren.
insert into public.fahrzeuge (id, unternehmen_id, makler_id, kennzeichen, kennzeichen_ort, hersteller, modell, halterart) values
  ('30000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-00000000000b', 'BML3021', 'B', 'Mercedes-Benz', 'eSprinter', 'arval_leasing'),
  ('30000000-0000-0000-0000-0000000000b1', '20000000-0000-0000-0000-0000000000b1', '10000000-0000-0000-0000-00000000000b', 'MXY1234', 'M', 'Ford', 'Transit', 'eigentum');

select test.gleich(
  (select count(*) from public.fahrzeuge where id = '30000000-0000-0000-0000-0000000000a1' and makler_id = '10000000-0000-0000-0000-00000000000a'),
  1, 'makler_id wird aus dem Unternehmen abgeleitet');

insert into public.schaeden (id, nummer, unternehmen_id, makler_id, fahrzeug_id, am, art) values
  ('40000000-0000-0000-0000-0000000000a1', 'SF-TEST-A1', '20000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-00000000000a',
   '30000000-0000-0000-0000-0000000000a1', now() - interval '1 day', 'Parkschaden'),
  ('40000000-0000-0000-0000-0000000000b1', 'SF-TEST-B1', '20000000-0000-0000-0000-0000000000b1', '10000000-0000-0000-0000-00000000000b',
   '30000000-0000-0000-0000-0000000000b1', now() - interval '1 day', 'Glasbruch');

insert into public.dauer_evb (unternehmen_id, makler_id, art, nummer) values
  ('20000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-00000000000a', 'arval', '7Q4K2M9'),
  ('20000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-00000000000a', 'allgemein', '3HX8P5T');

-- ---------------------------------------------------------------------------
-- Anonym: sieht nichts
-- ---------------------------------------------------------------------------
set role anon;
select test.verboten('select * from public.fahrzeuge', 'anon liest Fahrzeuge');
reset role;

-- ---------------------------------------------------------------------------
-- DSP A1
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', false);
set role authenticated;

select test.gleich((select count(*) from public.fahrzeuge), 1, 'DSP A1 sieht nur eigene Fahrzeuge');
select test.gleich((select count(*) from public.schaeden), 1, 'DSP A1 sieht nur eigene Schäden');
select test.gleich((select count(*) from public.unternehmen), 1, 'DSP A1 sieht nur das eigene Unternehmen');
select test.gleich((select count(*) from public.makler), 1, 'DSP A1 sieht nur den eigenen Makler');
select test.gleich((select count(*) from public.dauer_evb), 2, 'DSP A1 sieht beide Dauer-eVB');
select test.gleich((select count(*) from public.mitgliedschaften), 1, 'DSP A1 sieht nur die eigene Mitgliedschaft');

-- Nachricht schreiben: Seite und Autor werden vom Server gesetzt.
insert into public.schaden_nachrichten (schaden_id, unternehmen_id, makler_id, text, seite)
values ('40000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-0000000000b1', '10000000-0000-0000-0000-00000000000b', 'Foto folgt', 'makler');
select test.gleich(
  (select count(*) from public.schaden_nachrichten where text = 'Foto folgt' and seite = 'dsp'
     and autor_id = '00000000-0000-0000-0000-0000000000a1' and unternehmen_id = '20000000-0000-0000-0000-0000000000a1'),
  1, 'Seite, Autor und Mandant der Nachricht kommen vom Server');

select test.verboten($$insert into public.schaden_nachrichten (schaden_id, text, sichtbarkeit)
  values ('40000000-0000-0000-0000-0000000000a1', 'heimlich', 'makler_intern')$$, 'DSP schreibt interne Notiz');
select test.verboten($$insert into public.schaden_nachrichten (schaden_id, text, typ)
  values ('40000000-0000-0000-0000-0000000000a1', 'Status geändert: Reguliert', 'status_ereignis')$$, 'DSP fälscht Status-Ereignis');
select test.verboten($$insert into public.schaden_nachrichten (schaden_id, text)
  values ('40000000-0000-0000-0000-0000000000b1', 'fremd')$$, 'DSP schreibt in fremden Schaden');
select test.verboten($$update public.schaeden set status = 'reguliert' where id = '40000000-0000-0000-0000-0000000000a1'$$,
  'DSP ändert Schadenstatus');
select test.verboten($$update public.dauer_evb set nummer = 'AAAAAAA'$$, 'DSP ändert Dauer-eVB');
select test.verboten($$update public.mitgliedschaften set rolle = 'makler_admin'$$, 'DSP macht sich zum Makler-Admin');
select test.verboten($$insert into public.mitgliedschaften (user_id, makler_id, unternehmen_id, rolle)
  values ('00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-00000000000b', '20000000-0000-0000-0000-0000000000b1', 'fuhrparkleitung')$$,
  'DSP verschafft sich Zugang zu fremdem Unternehmen');
select test.verboten($$select * from public.audit_log$$, 'DSP liest Prüfprotokoll');

-- Schaden melden: Status wird auf „gemeldet“ erzwungen.
insert into public.schaeden (nummer, unternehmen_id, makler_id, fahrzeug_id, am, art, status, schadensnummer_versicherer)
values ('SF-TEST-A1-NEU', '20000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-00000000000a',
        '30000000-0000-0000-0000-0000000000a1', now(), 'Glasbruch', 'reguliert', 'GEFAELSCHT');
select test.gleich(
  (select count(*) from public.schaeden where art = 'Glasbruch' and status = 'gemeldet' and schadensnummer_versicherer is null),
  1, 'DSP-Meldung startet immer als „gemeldet“');
select test.gleich(
  (select count(*) from public.schaeden where art = 'Glasbruch' and nummer ~ '^SF-[0-9]{4}-[0-9A-F]{8}$'),
  1, 'Schadennummer vergibt der Server, nicht der Client');
select test.verboten($$insert into public.schaeden (nummer, unternehmen_id, makler_id, fahrzeug_id, am, art)
  values ('SF-TEST-FREMD', '20000000-0000-0000-0000-0000000000b1', '10000000-0000-0000-0000-00000000000b',
          '30000000-0000-0000-0000-0000000000b1', now(), 'Diebstahl')$$, 'DSP meldet Schaden für fremdes Unternehmen');

-- Nachricht ändern ist nicht erlaubt, nur zurückziehen.
select test.verboten($$update public.schaden_nachrichten set text = 'geändert' where text = 'Foto folgt'$$,
  'DSP ändert den Text einer Nachricht');
update public.schaden_nachrichten set zurueckgezogen_am = now() where text = 'Foto folgt';
select test.gleich(
  (select count(*) from public.schaden_nachrichten where text = 'Foto folgt' and zurueckgezogen_am is not null),
  1, 'Nachricht wird nur zurückgezogen, der Text bleibt');

reset role;

-- ---------------------------------------------------------------------------
-- DSP A2 (gleicher Makler, anderes Unternehmen)
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a2', false);
set role authenticated;
select test.gleich((select count(*) from public.fahrzeuge), 0, 'DSP A2 sieht keine Fahrzeuge von A1 (gleicher Makler)');
select test.gleich((select count(*) from public.schaden_nachrichten), 0, 'DSP A2 sieht keine Nachrichten von A1');
reset role;

-- ---------------------------------------------------------------------------
-- Makler A
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
set role authenticated;

select test.gleich((select count(*) from public.unternehmen), 2, 'Makler A sieht seine zwei Unternehmen');
select test.gleich((select count(*) from public.fahrzeuge), 1, 'Makler A sieht keine Fahrzeuge von Makler B');

insert into public.schaden_nachrichten (schaden_id, text, sichtbarkeit)
values ('40000000-0000-0000-0000-0000000000a1', 'Intern: Rückruf vereinbart', 'makler_intern');
select test.gleich((select count(*) from public.schaden_nachrichten where sichtbarkeit = 'makler_intern'), 1,
  'Makler sieht seine interne Notiz');

update public.schaeden set status = 'beim_versicherer', schadensnummer_versicherer = 'VS-1'
where id = '40000000-0000-0000-0000-0000000000a1';
select test.gleich(
  (select count(*) from public.schaden_statusverlauf where schaden_id = '40000000-0000-0000-0000-0000000000a1'), 2,
  'Statuswechsel landet im Verlauf');
select test.gleich(
  (select count(*) from public.schaden_nachrichten
   where schaden_id = '40000000-0000-0000-0000-0000000000a1' and typ = 'status_ereignis' and text = 'Status geändert: Beim Versicherer'),
  1, 'Statuswechsel erscheint als Ereignis im Chat');

update public.dauer_evb set nummer = 'K8M2Q4Z' where art = 'arval';
select test.gleich((select count(*) from public.dauer_evb where nummer = 'K8M2Q4Z'), 1, 'Makler pflegt Dauer-eVB');

select test.verboten($$update public.schaeden set status = 'reguliert' where id = '40000000-0000-0000-0000-0000000000b1'$$,
  'Makler A ändert Schaden von Makler B');
reset role;

-- Zurück zum DSP: interne Notiz bleibt unsichtbar, Status-Ereignis ist sichtbar.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', false);
set role authenticated;
select test.gleich((select count(*) from public.schaden_nachrichten where sichtbarkeit = 'makler_intern'), 0,
  'DSP sieht interne Makler-Notizen nicht');
select test.gleich((select count(*) from public.schaden_nachrichten where typ = 'status_ereignis'), 1,
  'DSP sieht das Status-Ereignis');

insert into public.schaden_lesestatus (schaden_id, seite) values ('40000000-0000-0000-0000-0000000000a1', 'dsp');
select test.verboten($$insert into public.schaden_lesestatus (schaden_id, seite)
  values ('40000000-0000-0000-0000-0000000000a1', 'makler')$$, 'DSP setzt Lesestatus der Makler-Seite');
reset role;

-- ---------------------------------------------------------------------------
-- Makler B: keinerlei Einblick in Makler A
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', false);
set role authenticated;
select test.gleich((select count(*) from public.schaeden where makler_id = '10000000-0000-0000-0000-00000000000a'), 0,
  'Makler B sieht keine Schäden von Makler A');
select test.gleich((select count(*) from public.schaden_nachrichten where makler_id = '10000000-0000-0000-0000-00000000000a'), 0,
  'Makler B sieht keine Nachrichten von Makler A');
select test.gleich((select count(*) from public.mitgliedschaften where makler_id = '10000000-0000-0000-0000-00000000000a'), 0,
  'Makler B sieht keine Mitglieder von Makler A');
reset role;

-- Prüfprotokoll wurde geschrieben (Superuser-Sicht).
select test.gleich((select count(*) > 0 from public.audit_log)::int, 1, 'Prüfprotokoll enthält Einträge');
