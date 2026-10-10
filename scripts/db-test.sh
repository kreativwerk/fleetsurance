#!/usr/bin/env bash
# Spielt alle Migrationen in ein frisches lokales Postgres ein und führt die RLS-Tests aus.
# Braucht Postgres 16+ (initdb/pg_ctl). Läuft als root über den Benutzer „postgres“.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
WORK="$(mktemp -d)"
PORT="${PGPORT_TEST:-54329}"
RUN=()
if [ "$(id -u)" = "0" ]; then RUN=(runuser -u postgres --); chown postgres "$WORK"; fi
cleanup() { "${RUN[@]}" "$PGBIN/pg_ctl" -D "$WORK/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT

"${RUN[@]}" "$PGBIN/initdb" -D "$WORK/data" -A trust -U postgres >/dev/null
"${RUN[@]}" "$PGBIN/pg_ctl" -D "$WORK/data" -o "-p $PORT -k $WORK -c listen_addresses=''" -l "$WORK/log" start >/dev/null
PSQL=("${RUN[@]}" psql -h "$WORK" -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -q -X -t -A)
"${PSQL[@]}" -c "create database fleetsurance" >/dev/null
DB=("${PSQL[@]}" -d fleetsurance)

"${DB[@]}" -f "$ROOT/supabase/tests/00_auth_stub.sql"
for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "Migration: $(basename "$f")"
  "${DB[@]}" -f "$f"
done
for f in "$ROOT"/supabase/tests/[1-9]*.sql; do
  echo "Test: $(basename "$f")"
  "${DB[@]}" -f "$f"
done
echo "Alle Datenbank-Tests bestanden."
