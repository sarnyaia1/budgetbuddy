# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ForintFigyelő (HaviKiadas) — Hungarian-language personal budget tracking app. All UI text, validation messages, and user-facing strings are in **Hungarian**. Currency is **HUF (Hungarian Forint)**.

## Commands

```bash
npm run dev       # Start dev server (Turbopack)
npm run build     # Production build (TS/ESLint errors ignored in next.config.js)
npm start         # Run production server
npm run lint      # ESLint
```

No test framework is configured.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Supabase** (PostgreSQL + Auth + RLS)
- **Tailwind CSS 4** + **shadcn/ui** (New York style, lucide-react icons)
- **react-hook-form** + **Zod** for form validation
- **sonner** for toast notifications
- **date-fns** (Hungarian locale) for date formatting
- **Deployed on Netlify** (Node 20.20.0)

## Architecture

### Data Flow Pattern
All mutations use **Next.js Server Actions** (`app/actions/*.ts`), not API routes. Server Actions return `{ data?, error? }` objects. After mutations, paths are revalidated via `revalidatePath()`. Client components call Server Actions directly.

### Supabase Client Split
- `lib/supabase/client.ts` — browser-side Supabase client (uses anon key)
- `lib/supabase/server.ts` — server-side Supabase client (cookie-based sessions)

### Auth Flow
Supabase Auth with email/password + email verification. `middleware.ts` enforces route protection:
- `/dashboard/*` requires authentication
- Auth pages (`/login`, `/register`, `/forgot-password`) redirect to dashboard if already logged in

### Validation Strategy
Zod schemas in `lib/validations/*.ts` are used on both client (react-hook-form resolver) and server (Server Action validation). All error messages are in Hungarian.

### Soft Delete Pattern
All tables use `deleted_at` timestamp columns. Queries always filter `deleted_at IS NULL`. Records are never hard-deleted.

### Month Auto-Creation
`getOrCreateMonth()` in `app/actions/months.ts` automatically creates a month record on first access — no explicit "create month" step for users.

### Database Tables
- **months** — year/month/starting_balance per user
- **income** — transactions with 4 source types (Fizetés, Utalás, Vállalkozás, Egyéb)
- **expenses** — transactions with 8 categories (Bevásárlás, Szórakozás, Vendéglátás, Extra, Utazás, Kötelező kiadás, Ruha, Sport)
- **budgets** — per-category budget limits per month (unique constraint: month_id + category + user_id)

All tables have RLS policies enforcing `auth.uid() = user_id`.

### Key Directories
- `app/actions/` — Server Actions (auth, months, income, expenses, budget)
- `app/(auth)/` — Auth pages (login, register, forgot-password)
- `app/dashboard/` — Main dashboard (server component)
- `components/forms/` — Client form components (income-form, expense-form, budget-form)
- `components/dashboard/` — Dashboard UI sections (month-selector, summary-cards, income-list, expense-list, budget-overview)
- `components/ui/` — shadcn/ui primitives
- `lib/validations/` — Zod schemas
- `lib/types/database.ts` — TypeScript type definitions matching Supabase schema

### Import Alias
`@/*` maps to the project root (e.g., `@/components/ui/button`).

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key

Optional:
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only
- `ANTHROPIC_API_KEY` — for Phase 6 AI features
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — rate limiting

## Development Phase Status

Phases 1-4 complete (Auth, Months, Income/Expenses CRUD, Budget Planning). Upcoming: Phase 5 (Charts/Recharts), Phase 6 (AI tips/Claude API), Phase 7 (PDF/Excel export), Phase 8-10 (recurring transactions, savings goals, multi-month analytics). Dependencies for upcoming phases (recharts, @react-pdf/renderer, exceljs, anthropic SDK) are already installed.

## Database Migrations

SQL migration files (e.g., `CREATE_BUDGETS_TABLE.sql`) must be run manually in the Supabase Dashboard SQL Editor. There is no automated migration system.
