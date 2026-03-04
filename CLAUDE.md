# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## Project Overview

**SatisfactoryPlanner** — a web-based planning tool for [Satisfactory](https://www.satisfactorygame.com/), a factory-building game by Coffee Stain Studios. Used to plan production chains, resource throughput, and factory layouts.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth v5 (Auth.js) — JWT sessions |
| ORM | Sequelize + sequelize-typescript |
| Database | PostgreSQL |
| Hosting | Render |

## Package Manager

**npm**

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database (requires DATABASE_URL in .env.local)
npx sequelize-cli db:migrate          # Run pending migrations
npx sequelize-cli db:migrate:undo     # Revert last migration
npx sequelize-cli db:seed:all         # Run all seeders
npx sequelize-cli migration:generate --name <name>   # Create a new migration
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — random secret for NextAuth (generate: `openssl rand -base64 32`)
- `NEXTAUTH_URL` — full base URL (e.g. `http://localhost:3000`)

## Architecture

```
src/
  app/             # Next.js App Router (routing only — no business logic here)
    api/
      auth/[...nextauth]/route.ts   # NextAuth route handler
    layout.tsx     # Root layout — imports src/styles/globals.css
    page.tsx       # Home page
  auth.ts          # NextAuth v5 config (JWT strategy)
  domain/          # Business logic (pure functions, no framework dependencies)
  lib/
    db.ts          # Sequelize singleton
  models/          # Sequelize model definitions
  styles/
    globals.css    # Single global CSS entry point (imported by layout.tsx)

config/
  config.js        # Sequelize CLI connection config (reads DATABASE_URL)

db/
  migrations/      # Sequelize migrations
  seeders/         # Sequelize seed files

.sequelizerc       # Tells sequelize-cli where config/models/migrations live
```

## Key Architectural Rules

See `.claude/rules/` for full enforcement rules. Summary:

- **Domain logic** lives only in `src/domain/` — keep it framework-free and pure
- **Components** are presentational only (no business logic)
- **src/app/** is routing-only — no business logic in route handlers beyond calling domain/service functions
- **Global styles** must be imported via `src/app/layout.tsx` → `src/styles/globals.css`
- **APIs** must require authentication, use explicit field allowlists, validate input, and return minimal DTOs
- **Tests**: any new domain or application logic must include unit tests (TEST_FIRST rule)
- **RTL tests** required when extracting JSX into new components

## Auth Setup

NextAuth v5 uses JWT sessions (no database session table needed). To add an OAuth provider:

1. Add provider credentials to `.env.local`
2. Import and add to the `providers` array in `src/auth.ts`

## Database

Sequelize CLI reads from `config/config.js`, which picks up `DATABASE_URL` from the environment. SSL is enabled automatically in production (required by Render's managed PostgreSQL).

## Deployment (Render)

- **Build command**: `npm run build`
- **Start command**: `npm run start`
- **Environment**: Set `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` in Render's environment settings
- Run `npx sequelize-cli db:migrate` as a pre-deploy job or via Render's job runner
