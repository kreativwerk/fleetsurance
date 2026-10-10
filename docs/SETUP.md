# Einrichtung: Supabase und Vercel

Reihenfolge: **A** Supabase → **B** Vercel → **C** beides verbinden → **D** erster Zugang.
Geheime Schlüssel (`service_role`, `secret`) nie in den Chat, in Code oder in Commits kopieren.

## A. Supabase (Datenbank und Login)

1. **Projekt anlegen**
   - [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
   - Organization: **Kreativwerk Agentur**
   - Name: **Fleetsurance**
   - Database Password: **Generate a password** und im Passwort-Manager speichern
   - Region: **Central EU (Frankfurt)**
   - **Create new project**, dann etwa 2 Minuten warten
2. **Registrierung abschalten** (Konten nur per Einladung)
   - Authentication → **Sign In / Providers** → „**Allow new users to sign up**“ **aus** → Save
   - Unter **Email**: „Enable Email provider“ an, „Confirm email“ an
3. **Login-Link-Gültigkeit**
   - Authentication → Sign In / Providers → Email → „Email OTP Expiration“: **3600** Sekunden (1 Stunde)
4. **Schlüssel notieren** (für Vercel)
   - Project Settings → **API Keys**: den **Publishable key** (`sb_publishable_…`) kopieren
   - Project Settings → **Data API**: die **Project URL** (`https://xxxx.supabase.co`) kopieren
5. **Datenbankschema**: Kurz Bescheid geben, dann spielt Claude die Migrationen über die Supabase-Verbindung ein und prüft die Sicherheitshinweise (Advisors).
6. **AVV**: Organization Settings → **Legal Documents** → DPA unterzeichnen

## B. Vercel (Hosting der Web-App)

1. [vercel.com/new](https://vercel.com/new) → GitHub-Repo **kreativwerk/fleetsurance** importieren
   - Falls es fehlt: „Adjust GitHub App Permissions“ und das Repo freigeben
2. **Projekt-Einstellungen beim Import**
   - Framework Preset: **Next.js**
   - Root Directory: **`apps/web`** → Edit → auswählen
   - Build & Install: Standard lassen (pnpm wird automatisch erkannt)
3. **Environment Variables** (für Production, Preview und Development)

   | Name | Wert |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL aus A4 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key aus A4 |
   | `NEXT_PUBLIC_APP_URL` | vorerst leer lassen, siehe C2 |

4. **Deploy** klicken
5. **Region Frankfurt**: Project → Settings → **Functions** → Function Region: **Frankfurt (fra1)** → Save, danach **Redeploy**
6. **Production-Branch**: Der Code liegt aktuell auf `claude/setup-skills`
   - Entweder diesen Branch nach `main` mergen (Pull Request)
   - Oder Settings → **Git** → Production Branch auf `claude/setup-skills` setzen, solange wir noch bauen
7. **Plan und AVV**
   - Für kommerzielle Nutzung ist der **Pro-Plan** nötig (Hobby ist nur für private Projekte)
   - Team Settings → **Legal** → DPA

## C. Supabase und Vercel verbinden

1. Die Vercel-Adresse notieren, z. B. `https://fleetsurance.vercel.app` (später eure eigene Domain)
2. Vercel → Settings → Environment Variables → `NEXT_PUBLIC_APP_URL` = diese Adresse → **Redeploy**
3. Supabase → Authentication → **URL Configuration**
   - Site URL: `https://fleetsurance.vercel.app`
   - Redirect URLs (**Add URL**):
     - `https://fleetsurance.vercel.app/auth/callback`
     - `https://*-kreativwerk.vercel.app/auth/callback` (für Vorschau-Deployments, euren Team-Slug einsetzen)
     - `http://localhost:3000/auth/callback`

## D. Erster Zugang (Makler-Admin)

1. Supabase → **SQL Editor**:

   ```sql
   insert into public.makler (name) values ('Name des Maklers') returning id;
   -- die zurückgegebene id unten einsetzen
   insert into public.einladungen (makler_id, email, rolle)
   values ('<makler-id>', 'admin@makler.de', 'makler_admin');
   ```

2. Authentication → **Users** → **Invite user** → dieselbe E-Mail-Adresse
3. Die Person öffnet `https://…/login`, gibt ihre Adresse ein und klickt den Link in der E-Mail. Die Einladung wird dabei automatisch angenommen.

**Hinweis zum E-Mail-Versand (D30):** Der eingebaute Testversand von Supabase schafft nur wenige E-Mails pro Stunde. Vor dem ersten echten Kunden richten wir einen EU-Anbieter ein (Authentication → **Emails → SMTP Settings**).
