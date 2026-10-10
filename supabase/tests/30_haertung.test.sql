-- Tests zu den Befunden aus dem Sicherheits-Review (2026-10-10).

-- 1) Makler A lädt in ein Unternehmen von Makler B ein → abgelehnt.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
set role authenticated;
select test.verboten($$insert into public.einladungen (makler_id, unternehmen_id, email, rolle)
  values ('10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-0000000000b1', 'alias@example.test', 'unternehmen_admin')$$,
  'Makler A lädt in fremdes Unternehmen ein');

-- Einladung: Laufzeit und Status setzt der Server.
insert into public.einladungen (makler_id, unternehmen_id, email, rolle, gueltig_bis, angenommen_am)
values ('10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-0000000000a2', ' Zweiter@Example.test ',
        'fuhrparkleitung', now() + interval '10 years', now());
select test.gleich(
  (select count(*) from public.einladungen where email = 'zweiter@example.test' and angenommen_am is null
     and gueltig_bis < now() + interval '8 days' and erstellt_von = '00000000-0000-0000-0000-00000000000a'),
  1, 'Einladung: Laufzeit, Status und Ersteller vom Server');

-- 2) makler_id lässt sich per Update nicht umbiegen; Unternehmen ist unveränderlich.
update public.fahrzeuge set makler_id = '10000000-0000-0000-0000-00000000000b'
where id = '30000000-0000-0000-0000-0000000000a1';
select test.gleich(
  (select count(*) from public.fahrzeuge where id = '30000000-0000-0000-0000-0000000000a1' and makler_id = '10000000-0000-0000-0000-00000000000a'),
  1, 'makler_id bleibt beim Update korrekt');
select test.verboten($$update public.schaeden set unternehmen_id = '20000000-0000-0000-0000-0000000000a2'
  where id = '40000000-0000-0000-0000-0000000000a1'$$, 'Schaden in anderes Unternehmen verschieben');
reset role;

-- 3) Schaden mit Fahrzeug eines anderen Unternehmens → abgelehnt.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', false);
set role authenticated;
select test.verboten($$insert into public.schaeden (unternehmen_id, makler_id, fahrzeug_id, am, art)
  values ('20000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-00000000000a',
          '30000000-0000-0000-0000-0000000000b1', now(), 'Fremdes Fahrzeug')$$, 'Schaden mit fremdem Fahrzeug');

-- 4) Anhang-Pfad vom Client wird verworfen.
insert into public.schaden_nachrichten (schaden_id, text, anhang_pfad, anhang_name)
values ('40000000-0000-0000-0000-0000000000a1', 'mit Anhang', 'makler-b/b1/geheim.pdf', 'geheim.pdf');
select test.gleich(
  (select count(*) from public.schaden_nachrichten where text = 'mit Anhang' and anhang_pfad is null and anhang_name is null),
  1, 'Anhang-Pfad vom Client wird verworfen');

-- Fuhrparkleitung pflegt keine Fahrzeuge (das machen Unternehmens-Admin, Makler und Importe).
select test.verboten($$insert into public.fahrzeuge (unternehmen_id, makler_id, kennzeichen, hersteller, modell, halterart)
  values ('20000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-00000000000a', 'BML9999', 'Ford', 'Transit', 'eigentum')$$,
  'Fuhrparkleitung legt Fahrzeug an');
reset role;

-- 6) Rechte: anon hat auf keine Tabelle Zugriff, authenticated darf nirgends löschen (außer eVB/Quoten).
select test.gleich(
  (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r'
     and (has_table_privilege('anon', c.oid, 'select') or has_table_privilege('anon', c.oid, 'insert'))),
  0, 'anon hat keine Tabellenrechte');
select test.gleich(
  (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r'
     and c.relname not in ('dauer_evb', 'monatsquoten')
     and (has_table_privilege('authenticated', c.oid, 'delete') or has_table_privilege('authenticated', c.oid, 'truncate'))),
  0, 'authenticated kann nichts löschen oder leeren');
select test.gleich(
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute')),
  0, 'anon darf keine Funktionen in public ausführen');

-- 7) Unbestätigte Adresse nimmt keine Einladung an.
insert into auth.users (id, email, email_confirmed_at) values ('00000000-0000-0000-0000-0000000000c2', 'zweiter@example.test', null);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c2', false);
select set_config('request.jwt.claims', '{"email":"zweiter@example.test"}', false);
set role authenticated;
select test.verboten($$select public.einladungen_annehmen()$$, 'Unbestätigte Adresse nimmt Einladung an');
reset role;
