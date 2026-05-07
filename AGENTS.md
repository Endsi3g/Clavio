# AGENTS.md — Clavio

## Project Identity

**Project name:** Clavio

**Product type:** Bilingual creator operations SaaS.

**Core goal:** Help creators move from idea to published content in one system:

- ideas
- video processing
- publishing
- analytics
- assets
- automations
- logs

**Version 1 constraints:**

- No auth.
- Single workspace only.
- No paid dependency required for core features.
- Self-hosted or 100% free tools only.
- No mock data in production UI.
- All displayed data must come from the database or live service outputs.

---

## Product Philosophy

Clavio must feel like a calm, premium, operational control room.
It is not a social app.
It is not a toy dashboard.
It is a serious creator workflow system.

Every page must answer:

1. What needs attention?
2. What is processing?
3. What is scheduled?
4. What failed?
5. What is performing well?

---

## Tech Stack

### Required

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Supabase Postgres
- Supabase Storage
- n8n self-hosted
- FFmpeg
- Remotion
- Local transcription and/or local AI when possible

### Preferred local/free AI tools

- Ollama
- Whisper local
- Any open-source or free model serving solution

### Font system

- Primary: Geist
- Mono: Geist Mono
- Load fonts using `next/font`

---

## Hard Rules

### Always

- Use live data only.
- Keep UI state explicit.
- Build empty/loading/error states.
- Keep modules loosely coupled.
- Use typed data access.
- Prefer server actions or route handlers for mutations.
- Keep the light-mode design system consistent.
- Write small, composable components.
- Keep the app usable without auth in v1.

### Never

- Add paid SaaS as a required core dependency.
- Hardcode production content.
- Mix demo data into live views.
- Add auth flows in v1 unless explicitly requested.
- Add team/permissions/billing unless explicitly requested.
- Fetch directly inside presentational components when a data layer already exists.
- Introduce a new dependency without reason.
- Add visual clutter or overly decorative UI.
- Build a feature that cannot be traced to a DB table, API response, or workflow output.

---

## Design System Rules

### Visual style

- Light mode only.
- White and off-white surfaces.
- Soft blue primary color.
- Subtle borders.
- Minimal shadows.
- Clean spacing.
- Dense but readable layout.

### Typography

Use a strict hierarchy:

- Page title: 24–28px, semibold.
- Section title: 16–18px, semibold.
- Card title: 14–16px, medium.
- Body: 14px, regular.
- Meta/caption: 12px.
- Technical values: Geist Mono.

### Layout

- Sidebar on the left.
- Sticky top bar.
- Main canvas in the center.
- Optional right panel for contextual details.
- Tables should be full-width on desktop.
- Detail pages should use two-column layouts.
- Mobile should collapse sidebar into a sheet.

---

## Information Architecture

### Main routes

- `/`
- `/app`
- `/app/dashboard`
- `/app/ideas`
- `/app/ideas/[id]`
- `/app/videos`
- `/app/videos/[id]`
- `/app/publishing`
- `/app/publishing/[id]`
- `/app/analytics`
- `/app/assets`
- `/app/automations`
- `/app/integrations`
- `/app/logs`
- `/app/settings`

### API routes

- `/api/ideas/generate`
- `/api/ideas/expand`
- `/api/videos/upload`
- `/api/videos/transcribe`
- `/api/videos/clip`
- `/api/videos/render`
- `/api/posts/schedule`
- `/api/posts/publish`
- `/api/metrics/sync`
- `/api/webhooks/[provider]`
- `/api/cron/[task]`

---

## Pages

## Dashboard

The dashboard is the command center.
It must show:

- urgent tasks
- active jobs
- upcoming posts
- failed workflows
- performance highlights
- recent system events

It must not show decorative widgets without purpose.

## Ideas

This page manages:

- idea creation
- idea variants
- hooks
- angles
- formats
- platforms
- priorities
- downstream actions

## Idea Detail

This page manages:

- full editable idea content
- status history
- related assets
- scripts
- carousel outlines
- post draft links
- workflow actions

## Videos

This page manages:

- uploads
- video records
- transcription status
- clip suggestions
- render jobs
- exports

## Video Detail

This page manages:

- player preview
- transcript
- clip list
- render versions
- failure logs
- retry actions

## Publishing

This page manages:

- drafts
- scheduled posts
- published posts
- failed posts
- calendar view
- multi-platform variants

## Post Detail

This page manages:

- caption
- media
- hashtags
- schedule
- status timeline
- metrics snapshot

## Analytics

This page manages:

- KPI cards
- trends
- platform comparisons
- hook comparisons
- CTA comparisons
- content rankings

## Assets

This page manages:

- brand kits
- logos
- fonts
- music
- b-roll
- templates
- caption blocks

## Automations

This page manages:

- workflow list
- workflow runs
- retries
- failures
- step logs

## Integrations

This page manages:

- connected providers
- sync health
- configuration
- webhooks
- render engines
- transcription engines
- AI providers

## Logs

This page manages:

- system events
- workflow failures
- provider errors
- payload history
- operational audit trail

## Settings

This page manages:

- workspace settings
- brand settings
- default publishing rules
- default prompt rules
- environment settings
- maintenance actions

---

## Component Library Rules

### Use Shadcn components when possible

- `Sidebar`
- `Sheet`
- `Card`
- `Table`
- `Tabs`
- `Badge`
- `Button`
- `Input`
- `Textarea`
- `Select`
- `Dialog`
- `DropdownMenu`
- `Popover`
- `Tooltip`
- `Progress`
- `Skeleton`
- `Calendar`
- `ScrollArea`
- `Accordion`
- `Separator`
- `Avatar`

### Custom components to create

- `AppShell`
- `TopBar`
- `NavItem`
- `MetricCard`
- `TaskCard`
- `StatusBadge`
- `FilterBar`
- `DataTable`
- `DetailDrawer`
- `PreviewPane`
- `WorkflowTimeline`
- `EmptyState`
- `ErrorState`
- `ActionRail`
- `PublishCalendar`
- `ClipCard`
- `RenderStatusCard`
- `InsightCallout`
- `LogStream`

---

## Data Model Rules

### Required tenant field

Every tenant-scoped table must include:

- `workspace_id`

### Required metadata

Every content table must include:

- `id`
- `status`
- `created_at`
- `updated_at`

### Core tables

- `ideas`
- `idea_variants`
- `videos`
- `transcripts`
- `clips`
- `render_jobs`
- `posts`
- `post_metrics`
- `assets`
- `workflow_runs`
- `integrations`
- `logs`
- `settings`

### Data model principle

One business object must be able to move through the pipeline without losing identity.

Example:

- idea becomes variant
- variant becomes draft
- draft becomes post
- post becomes metrics snapshot

---

## Workflow Rules

### Idea workflow

- Create idea
- Generate variants
- Edit variant
- Promote to script or post draft
- Schedule or send to video pipeline

### Video workflow

- Upload
- Store
- Transcribe
- Detect clips
- Approve clips
- Render
- Export
- Publish or queue

### Publishing workflow

- Draft
- Review
- Schedule
- Publish
- Sync metrics
- Generate insights

### Automation workflow

- Trigger
- Step execution
- Status tracking
- Log output
- Retry on failure

---

## Self-Hosted / Free-Only Policy

### Allowed

- Local servers
- Docker containers
- Self-hosted open-source services
- Free tiers only when optional
- Local replacements for any external service

### Recommended self-hosted services

- n8n for automation
- FFmpeg for processing
- Remotion for render templates
- Supabase or self-hosted Postgres compatible stack
- Ollama for local AI
- Whisper for transcription

### Disallowed as core dependencies

- Paid automation platforms
- Paid render platforms
- Paid auth providers
- Paid scheduling platforms
- Paid AI dependencies for basic functionality

---

## Security Rules

### Auth

- No auth in v1.
- Do not add login screens.
- Do not add permission logic yet.
- Do not add invite flows yet.

### Data

- Still write the app as if security matters.
- Keep table ownership patterns clean.
- Use server-side mutation boundaries.
- Avoid exposing secrets in client code.

### Supabase

- Enable row level security on all exposed tables.
- Write policies deliberately.
- Do not rely on permissive defaults.

---

## Code Style Rules

### General

- Prefer small components.
- Prefer named exports for reusable UI.
- Prefer explicit types.
- Avoid magic constants.
- Keep functions single-purpose.
- Avoid overengineering.

### File naming

- Use `kebab-case` for route and component filenames where consistent with the project.
- Use `PascalCase` for React components.
- Use `camelCase` for functions and variables.
- Use `UPPER_SNAKE_CASE` for constants.

### Styling

- Use Tailwind utility classes.
- Extract repeated patterns into design tokens or reusable components.
- Avoid inline style objects unless required.

---

## Data Access Rules

### Frontend

- Presentational components must not own data fetching unless specifically intended.
- Use a typed data layer.
- Keep queries close to route or server boundaries.

### Mutations

- Prefer server actions or dedicated route handlers.
- Mutations must return typed success/failure responses.
- Every mutation must create or update logs when relevant.

### Caching

- Cache with intent.
- Do not hide stale workflow state.
- Prefer fresh data for operational dashboards.

---

## Error Handling Rules

### Required behavior

- Surface errors clearly.
- Show retry actions where possible.
- Log every important failure.
- Keep the UI recoverable.

### Never

- swallow errors silently
- show generic “something went wrong” only
- fail without a log entry if the failure is operational

---

## Empty State Rules

Empty states must:

- be honest,
- explain why the list is empty,
- show what the user can do next,
- not pretend data exists.

Example:

- “No ideas yet. Create your first idea or generate one from a prompt.”
- “No videos uploaded yet. Add a source file to begin processing.”

---

## Logging Rules

Every meaningful workflow step should write a log or workflow run entry.

Must log:

- start
- success
- failure
- retry
- output link
- provider error
- publish result

Logs must be queryable from the UI.

---

## Analytics Rules

Analytics must be:

- sourced from actual events,
- stored as snapshots,
- filterable by date range,
- tied to content records,
- used to improve future content generation.

Do not invent analytics data.

---

## PR Review Checklist

Before merging or shipping:

- UI matches design system
- No hardcoded production content
- All screens use live data
- No auth flows added accidentally
- RLS enabled where applicable
- Logs added for workflows
- Empty states implemented
- Loading and error states implemented
- Types compile
- Lint passes
- Build passes
- New code remains small and coherent

---

## When Unclear

If the implementation target is ambiguous:

1. Ask one focused question.
2. Or propose a short implementation plan.
3. Do not invent missing requirements.
4. Do not build broad speculative features.

---

## Output Standard

When writing code or specs for this project:

- be exact,
- be minimal in surface area,
- be explicit in data flow,
- keep systems connected,
- keep the UI operational,
- keep the product self-hosted or free,
- keep Clavio coherent and premium.

## Final Direction

Clavio should always feel like a creator operating system, not a toy.
Everything should connect.
Everything should be traceable.
Everything should ship cleanly.
