# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Clavio is an operational **Autonomous Creator OS (v0.1.0)**. The 4 core systems are fully implemented and integrated:
- **Smart Worker** — Ollama (llama3.2 for `/api/ideas/generate`) + local Whisper service for transcription.
- **Autonomous Agents** — ScrapeGraphAI for deep research and Hermes Agent for advanced scripting.
- **Render Engine** — Remotion + Clipify (Magic Reframing via FFmpeg) for high-fidelity social clips.
- **Automation Bridge** — n8n webhooks for status-triggered publishing workflows.
- **Bilingual Interface** — Full FR/EN support across the entire application.

## Commands

```bash
# Development
npm run dev

# Build
npm run build

# Type checking
npx tsc --noEmit

# Lint
npm run lint

# Single test file
npx jest path/to/test.test.ts
# or with Vitest:
npx vitest run path/to/test.test.ts
```

> When bootstrapping: use `npx create-next-app@latest` with TypeScript, Tailwind, and App Router enabled. Add Shadcn/UI via `npx shadcn@latest init`.

## Architecture Overview

**Stack:** Next.js App Router · TypeScript · Tailwind CSS · Shadcn/UI · Supabase Postgres + Storage · Remotion · FFmpeg · n8n (self-hosted) · Ollama · Whisper local

**No auth in v1.** Single workspace. No paid dependencies required for core features.

### Route Structure

- `/` — landing / redirect
- `/app` — app shell (AppShell wraps all routes below)
- `/app/dashboard` — command center (urgent tasks, active jobs, failures, highlights)
- `/app/ideas` · `/app/ideas/[id]` — idea pipeline
- `/app/videos` · `/app/videos/[id]` — video processing pipeline
- `/app/publishing` · `/app/publishing/[id]` — scheduling and distribution
- `/app/analytics` — KPI cards, platform/hook comparisons, content rankings
- `/app/assets` — brand kits, logos, music, b-roll, templates
- `/app/automations` — n8n workflow list and run history
- `/app/integrations` — provider connections, sync health
- `/app/logs` — queryable operational audit trail
- `/app/settings` — workspace, brand, publishing defaults

### API Routes

```
/api/ideas/generate        /api/ideas/expand
/api/videos/upload         /api/videos/transcribe
/api/videos/clip           /api/videos/render
/api/posts/schedule        /api/posts/publish
/api/metrics/sync          /api/webhooks/[provider]
/api/cron/[task]
```

### Data Model

All tables require `workspace_id`, `id`, `status`, `created_at`, `updated_at`.

Core tables: `ideas` → `idea_variants` → `posts` → `post_metrics` (idea-to-publish pipeline); `videos` → `transcripts` → `clips` → `render_jobs` (video pipeline); `assets`, `workflow_runs`, `integrations`, `logs`, `settings`.

One business object preserves identity through the full pipeline (idea → variant → draft → post → metrics).

### Data Access Pattern

- Data fetching lives at route/server boundaries (server components or server actions), never inside presentational components.
- Mutations use server actions or route handlers and return typed `{ success, error }` responses.
- Every meaningful mutation writes to `workflow_runs` or `logs`.
- Prefer fresh data on operational dashboards — do not cache stale workflow state.

### Component Structure

Use Shadcn/UI primitives (Button, Card, Table, Dialog, Badge, Skeleton, etc.) for standard patterns. Build these custom components for domain logic:

`AppShell` · `TopBar` · `NavItem` · `MetricCard` · `TaskCard` · `StatusBadge` · `FilterBar` · `DataTable` · `DetailDrawer` · `WorkflowTimeline` · `EmptyState` · `ErrorState` · `LogStream` · `ClipCard` · `RenderStatusCard` · `PublishCalendar`

## Design System

- **Light mode only.** White/off-white surfaces, soft blue primary (`#60A5FA`), subtle borders, minimal shadows.
- **Fonts:** Geist (all text) + Geist Mono (technical values). Load via `next/font`.
- **Typography scale:** page title 24–28px semibold · section 16–18px semibold · card title 14–16px medium · body 14px · meta 12px.
- **Layout:** 280px fixed sidebar (collapses to 72px; sheet on mobile) · 64px sticky top bar · 24px main canvas padding · optional right detail panel. Tables full-width on desktop.

## Hard Constraints

**Always:**
- Live data only — never hardcode or mock production content.
- Every list/page must have empty, loading, and error states.
- RLS enabled on every exposed Supabase table; write policies deliberately.
- Use explicit TypeScript types throughout.

**Never:**
- Add paid SaaS as a required core dependency.
- Add auth flows, team/permissions, or billing (not in v1 scope).
- Fetch inside presentational components when a data layer exists.
- Ship a feature that cannot be traced to a DB table, API response, or workflow output.

## Naming Conventions

- Files/routes: `kebab-case`
- React components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

## Logging Rules

Every workflow step must log: `start`, `success`, `failure`, `retry`, `output link`, `provider error`, `publish result`. All entries stored in the `logs` table and queryable from `/app/logs`.

## PR Checklist

Before merging: UI matches design system · no hardcoded content · all screens use live data · no accidental auth flows · RLS enabled · logs added for workflows · empty/loading/error states present · types compile · lint passes · build passes.
