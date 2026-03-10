# SatisfactoryPlanner

A web-based production planner for [Satisfactory](https://www.satisfactorygame.com/) — the factory-building game by Coffee Stain Studios. Plan production chains, optimize resource throughput, and design factory layouts before you build them in-game.

## Features

- **Production Solver** — set target items and quantities, and the solver computes the full production chain (machines, recipes, resource inputs)
- **Multiple Views** — visualize your plan as an interactive graph, tree, factory blueprint, or freeform builder
- **Freeform Builder** — drag-and-drop machines onto a canvas, assign recipes, connect with belts, and see throughput rates calculated automatically
- **Multi-Floor Factory** — organize factory blueprints across multiple floors with lifts between them
- **Milestone Tier Filtering** — restrict recipes and buildings to only what you've unlocked at a given tier
- **Space Elevator Templates** — start from pre-built templates for each Space Elevator phase
- **Real-Time Collaboration** — multiple users can edit the same plan simultaneously via WebSocket sync
- **Plan Sharing** — share plans with others as viewers or editors via invite links
- **Accounts & Persistence** — sign up, save plans to your account, and access them from anywhere

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Data Fetching | TanStack React Query |
| Graph Rendering | React Flow (@xyflow/react) |
| Auth | NextAuth v5 (Auth.js) — JWT sessions |
| ORM | Sequelize + sequelize-typescript |
| Database | PostgreSQL |
| Real-Time | Socket.IO |
| Validation | Zod |
| Testing | Vitest + React Testing Library + Playwright |

## Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+
- **npm**

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/SatisfactoryPlanner.git
cd SatisfactoryPlanner
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://postgres:password@localhost:5432/satisfactory_planner`) |
| `AUTH_SECRET` | Random secret for NextAuth — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL of the app (e.g. `http://localhost:3000`) |

### 4. Create the database

```bash
createdb satisfactory_planner
```

### 5. Run migrations

```bash
npx sequelize-cli db:migrate
```

### 6. Seed game data

```bash
npx sequelize-cli db:seed:all
```

### 7. Start the dev server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (with Socket.IO) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |
| `npx sequelize-cli db:migrate` | Run pending database migrations |
| `npx sequelize-cli db:seed:all` | Seed the database with game data |

## Project Structure

```
src/
  app/              # Next.js App Router — pages and API routes
  domain/           # Business logic (pure functions, framework-free)
  components/       # React components (presentational)
  store/            # Zustand stores
  hooks/            # Custom React hooks
  lib/              # Database connection, Socket.IO server
  models/           # Sequelize model definitions
  styles/           # Global CSS and theme
  repositories/     # Data access layer

db/
  migrations/       # Sequelize migrations
  seeders/          # Game data seeders

e2e/                # Playwright end-to-end tests
```

## License

This project is for personal/portfolio use. Satisfactory is a trademark of Coffee Stain Studios.
