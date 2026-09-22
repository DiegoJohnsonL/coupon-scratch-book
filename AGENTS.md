# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (port 3000)
pnpm build        # Production build
pnpm lint         # Run ESLint

# Database (Drizzle + Neon PostgreSQL)
pnpm db:generate  # Generate migrations from schema changes
pnpm db:push      # Push schema directly to DB (dev)
pnpm db:migrate   # Apply migrations
pnpm db:studio    # Open Drizzle Studio UI
```

## Architecture

**Stack**: Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + Drizzle ORM + Neon PostgreSQL

**Key directories**:
- `app/` - Next.js App Router pages and layouts
- `src/db/` - Database schema (`schema.ts`) and client (`index.ts`)
- `lib/utils.ts` - Utility functions including `cn()` for class merging
- `drizzle/` - Generated migration files

**Path aliases** (configured in tsconfig.json and components.json):
- `@/*` maps to root
- `@/components/ui` for shadcn UI components
- `@/hooks` for custom React hooks

**Styling**: Tailwind v4 with CSS variables, dark mode support, OKLch colors. Uses shadcn UI component patterns with `cn()` utility for class merging.

**Database**: Drizzle ORM with node-postgres driver. Schema defined in `src/db/schema.ts`. Import db client from `@/db`.
