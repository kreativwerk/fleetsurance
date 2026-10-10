-- Einladungen: nur Makler-Admins laden ein, angenommen wird per bestätigter E-Mail.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000c1', 'neu@example.test');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
set role authenticated;
insert into public.einladungen (makler_id, unternehmen_id, email, rolle, erstellt_von)
values ('10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-0000000000a1', 'Neu@Example.test',
        'fuhrparkleitung', '00000000-0000-0000-0000-00000000000a');
select test.gleich((select count(*) from public.einladungen), 1, 'Makler-Admin legt Einladung an');
reset role;

-- DSP darf niemanden einladen.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', false);
set role authenticated;
select test.verboten($$insert into public.einladungen (makler_id, unternehmen_id, email, rolle, erstellt_von)
  values ('10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-0000000000a1', 'x@example.test',
          'makler_admin', '00000000-0000-0000-0000-0000000000a1')$$, 'DSP lädt jemanden ein');
reset role;

-- Fremde Adresse nimmt nichts an.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', false);
select set_config('request.jwt.claims', '{"email":"dsp.b1@example.test"}', false);
set role authenticated;
select test.gleich(public.einladungen_annehmen()::bigint, 0, 'Andere Adresse übernimmt keine Einladung');
reset role;

-- Eingeladene Person nimmt an (Groß-/Kleinschreibung egal).
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', false);
select set_config('request.jwt.claims', '{"email":"neu@example.test"}', false);
set role authenticated;
select test.gleich(public.einladungen_annehmen()::bigint, 1, 'Eingeladene Person nimmt an');
select test.gleich((select count(*) from public.fahrzeuge), 1, 'Nach Annahme sieht sie die Fahrzeuge ihres Unternehmens');
select test.gleich(public.einladungen_annehmen()::bigint, 0, 'Einladung gilt nur einmal');
reset role;

