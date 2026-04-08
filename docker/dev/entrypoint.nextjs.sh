#!/bin/sh
set -e

if [ -f .env.dev.local ]; then
  set -a
  . ./.env.dev.local
  set +a
fi

if [ -n "$DATABASE_URL" ]; then
  echo "Waiting for database..."
  until node -e "const { Client } = require('pg'); const c = new Client({ connectionString: process.env.DATABASE_URL }); c.connect().then(() => c.end()).catch(() => process.exit(1));"; do
    sleep 1
  done

  exit_code=0
  node -e "const { Client } = require('pg'); const c = new Client({ connectionString: process.env.DATABASE_URL }); c.connect().then(async () => { const r = await c.query(\"select to_regclass('public.users') as exists\"); if (!r.rows[0].exists) return process.exit(2); const r2 = await c.query('select count(*)::int as count from users'); return process.exit(r2.rows[0].count === 0 ? 3 : 0); }).catch(() => process.exit(1)); c.on('error', () => process.exit(1));" || exit_code=$?

  if [ "${exit_code:-0}" = "2" ] || [ "${exit_code:-0}" = "3" ]; then
    echo "Initializing database..."
    npx prisma db push
    npx prisma db seed
  fi
fi

exec npm run dev
