# Mini CRM / Billing System

A lightweight CRM + billing app for small businesses. Track clients, services, appointments, payments, reminders, and revenue.

## Tech stack

- Next.js (App Router)
- Prisma + PostgreSQL
- Tailwind CSS + shadcn UI
- Docker (dev/prod configs)

## Features

- Role-based access: Admin vs Manager
- Dashboard with KPIs
- Clients / Services / Appointments / Payments / Reminders CRUD
- Analytics & charts (Recharts)
- Audit log
- CSV export for clients and payments
- Profile & password change

## Local setup

1. Install dependencies

```bash
npm install
```

2. Create env file

Copy `.env.example` and fill `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`.

3. Run docker (Postgres)

```bash
npm run up:build
```

4. Push schema + generate Prisma client

```bash
npm run db:push
npm run db:gen
```

5. Seed demo data (optional)

```bash
npx prisma db seed
```

6. Start dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Test accounts

- Admin: `admin@demo.local` / `admin123`
- Manager: `manager@demo.local` / `manager123`

## Project structure

```
app/
  (public)/        # auth pages
  (protected)/     # app pages
  _components/     # UI + layout components
  _lib/            # server actions, server functions, validations
  api/             # CSV export + NextAuth
prisma/            # schema + seed
  schema.prisma
  seed.js
  migrations/
 database/
  schema.sql
  seed.sql
```

## TODO (future)

- Calendar drag-and-drop
- Email/Telegram reminder delivery
- Advanced permissions per manager
- CSV import
- Webhooks and integrations
