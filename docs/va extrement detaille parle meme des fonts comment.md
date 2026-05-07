<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# va extrement detaille parle meme des fonts comment les componments doivent etre place aussi  ceomment les poages systeme et fonctionnalites sont connecte soit tellemet precis que ca donne mal a la tete

Oui — on va le faire comme un vrai **system design doc**, très précis, presque obsessionnel, avec le branding de **Clavio**, la structure UI, les fonts, le placement exact des composants, les connexions entre pages, et la logique complète du produit. Next.js font optimization supports self-hosted fonts with no layout shift, Shadcn is intentionally minimal on typography so you define the system yourself, Supabase requires RLS on exposed tables, and n8n webhooks can act like API triggers for workflows.[^1][^2][^3][^4]

## 1) Product Definition

### Product Name

**Clavio**

### Product Type

A bilingual creator operations SaaS for English and French creators who want to move from idea to published content inside one unified system.

### Core Promise

Clavio helps creators:

- generate ideas,
- transform ideas into scripts and video plans,
- process long-form video into short-form clips,
- publish content,
- and learn from analytics.


### Product Philosophy

Clavio must feel like a **control room**, not a social app. Every screen should be dense, useful, calm, and operational. No decorative nonsense. No fake data in production. No auth in v1. One workspace only. Everything runs from one canonical dataset.

***

## 2) Brand System

### Brand Personality

Clavio should feel:

- intelligent,
- composed,
- soft blue,
- premium,
- bilingual,
- creator-first,
- not childish,
- not overly corporate.


### Color Direction

Use a blue family that feels like “focus + clarity + trust”:

- `#F8FAFC` background
- `#FFFFFF` cards
- `#E2E8F0` borders
- `#60A5FA` primary
- `#3B82F6` hover/active
- `#1D4ED8` strong action
- `#0F172A` text
- `#64748B` secondary text
- `#DBEAFE` soft blue surfaces
- `#EFF6FF` tinted sections


### Visual Rules

- White surfaces dominate.
- Blue is only for action, active state, and key highlights.
- No neon gradients in the base UI.
- Icons should be subtle line icons.
- Shadows must be soft and almost invisible.
- Cards should use 12–16px radius.
- Dense content, but with breathing room.

***

## 3) Font System

### Primary Font

Use **Geist** for the entire app because it has a modern, neutral, crisp SaaS feel and fits the “Clavio” vibe well.[^2][^5]

### Secondary Font

Use **Geist Mono** for:

- IDs,
- timestamps,
- job names,
- short codes,
- render output paths,
- analytics labels.


### Typography Hierarchy

Define typography like a real design system, not random Tailwind text classes.

#### Page Title

- Font: Geist
- Size: 24–28px
- Weight: 600
- Line height: 1.1
- Tracking: -0.02em


#### Section Title

- Size: 16–18px
- Weight: 600
- Line height: 1.2


#### Card Title

- Size: 14–16px
- Weight: 500–600


#### Body

- Size: 14px
- Weight: 400
- Line height: 1.5


#### Caption / Meta

- Size: 12px
- Weight: 400–500
- Color: slate 500–600


#### Tables

- Size: 13–14px
- Dense rows.
- Use monospace only for technical columns.


### Font Placement

- All navigation labels use Geist.
- All headers use Geist.
- All technical values use Geist Mono.
- Empty states and helper copy use regular Geist, never mono.
- Do not mix too many font weights.


### Implementation Rule

Use `next/font` for self-hosted font loading so you avoid layout shift and external font requests.[^2]

***

## 4) App Shell Layout

### Global Structure

The app uses:

- a **fixed left sidebar**,
- a **sticky top bar**,
- a **main content canvas**,
- optional **right-side contextual panel** on wider screens.


### Sidebar Width

- Expanded: 280px
- Collapsed: 72px


### Top Bar Height

- 64px


### Main Content Padding

- Desktop: 24px
- Tablet: 20px
- Mobile: 16px


### Sidebar Placement Rules

Sidebar should contain:

1. Brand at top.
2. Main navigation.
3. Divider.
4. Secondary navigation.
5. User/settings block at bottom.

### Main Content Placement

- Header first.
- Primary actionable content under header.
- Secondary contextual blocks to the right or below.
- Tables should occupy full width unless the page is a detail view.


### Right Panel Rules

On dashboard and detail pages, the right panel should:

- show stats,
- recent logs,
- status summaries,
- quick actions,
- or selected item details.

Never use a right panel for decorative content.

***

## 5) Exact Sidebar Structure

### Sidebar Top

- Logo mark
- Brand name: **Clavio**
- Small subtitle: “Creator Ops”


### Primary Nav

- Dashboard
- Ideas
- Videos
- Publishing
- Analytics


### Secondary Nav

- Assets
- Automations
- Integrations
- Logs
- Settings


### Footer Block

- Workspace name: `Clavio Default`
- Environment badge: `Live`
- Last sync timestamp
- System health indicator


### Sidebar Interaction

- Active item uses blue background tint.
- Hover state uses a soft blue-gray surface.
- Collapsed sidebar should show icon only with tooltip.
- Selected item should preserve blue accent and stronger text contrast.

***

## 6) Page Map

### Public Routes

- `/`
- `/pricing`
- `/demo`


### App Routes

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


### API Routes

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

***

## 7) Dashboard Spec

### Purpose

The dashboard is the operational landing page. It should answer:

- what needs attention,
- what is running,
- what is scheduled,
- what failed,
- what is winning.


### Header

- Left: greeting and date.
- Center: workspace selector if ever needed later, but in v1 just hidden.
- Right: search, notifications, system status, user menu.


### First Row

Left large card:

- `Things to do`
- urgent tasks only
- each task has icon, title, short explanation, due time, and action button

Right stack:

- `Active pipeline`
- `Today’s queue`
- `Publishing status`


### Second Row

Left:

- `Upcoming posts`
- compact calendar/list hybrid

Right:

- `Top performing content`
- `Recent automations`


### Third Row

- `System health`
- `Render queue`
- `Failed jobs`
- `Analytics snapshot`


### Dashboard Behavior

- Every task opens the related page or drawer.
- Every number must come from DB.
- Nothing is static except layout labels.
- If there is no content, show a real empty state from actual query result.

***

## 8) Ideas Page Spec

### Purpose

This page is the idea engine.

### Top Bar

- Search input
- Filter buttons
- `New idea` button
- `Generate ideas` button


### Main Layout

Use a 2-column layout:

- left: idea table / list
- right: detail drawer or context panel


### Idea Table Columns

- Title
- Format
- Platform
- Pillar
- Status
- Priority
- Source
- Updated
- Actions


### Filters

- Status
- Format
- Platform
- Pillar
- Source type
- Priority


### Row Actions

- Open
- Generate variants
- Convert to script
- Convert to video
- Schedule draft
- Archive


### Idea Detail Panel

When an idea is selected, show:

- title
- description
- hook
- angle
- CTA
- status history
- linked assets
- downstream outputs
- related posts
- action buttons

***

## 9) Idea Detail Page

### Layout

Three vertical zones:

1. top identity header,
2. central editable workspace,
3. lower connected workflow timeline.

### Left Main Column

- Title editor
- Description editor
- Hook editor
- Angle editor
- CTA editor
- Script editor
- Carousel outline if applicable


### Right Column

- Metadata card
- Status card
- Source card
- Related assets card
- Downstream actions card


### Footer Area

- Version history
- Comments
- Workflow logs
- AI suggestion output


### Behavior

- Auto-save every field.
- Manual publish state only when approved.
- Every edit updates `updated_at`.

***

## 10) Videos Page Spec

### Purpose

This page manages raw footage and all downstream processing.

### Top Bar

- Upload button
- Import from URL
- Filter by status
- Search
- Processing summary


### Table Columns

- Title
- Source
- Duration
- Transcription
- Clips
- Render status
- Published status
- Updated
- Actions


### Actions

- Open
- Transcribe
- Detect clips
- Reprocess
- Render selected
- Export
- Retry failed job


### Detail Drawer

For a selected video:

- preview player
- transcript snippet
- detected highlights
- clip list
- render queue
- error log


### Processing Chain

- Upload source
- Store file
- Create video record
- Send webhook to transcription job
- Store transcript
- Generate clip suggestions
- User approves clip
- Create render job
- Export result
- Send to publishing queue

***

## 11) Video Detail Page

### Left Column

- Embedded preview
- video metadata
- transcript viewer
- clip selector


### Right Column

- clip job summary
- render versions
- export destinations
- failure logs
- retry buttons


### Clip Row Data

- clip title
- start/end
- duration
- aspect ratio
- subtitle style
- hook label
- status


### Clip Actions

- approve
- edit time range
- edit caption
- render again
- send to post draft

***

## 12) Publishing Page Spec

### Purpose

Content distribution center.

### Layout

- calendar at top or left
- queue table below
- filtered platform views


### Queue Columns

- Title
- Platform
- Scheduled for
- Status
- Media type
- Approval
- Metrics
- Actions


### Post Actions

- edit caption
- edit media
- reschedule
- publish now
- duplicate to another platform
- archive


### Calendar Behavior

- single source can create several platform posts
- calendar cells show compact status badges
- clicking a post opens detail drawer

***

## 13) Post Detail Page

### Main Content

- post preview
- caption editor
- hashtags
- CTA
- media preview
- schedule controls
- publish status


### Side Panel

- platform-specific settings
- associated idea
- associated video or clip
- performance history
- version history


### Timeline

- created
- approved
- scheduled
- published
- metrics synced

***

## 14) Analytics Page Spec

### Purpose

Turn publishing data into decisions.

### KPI Strip

- Views
- Watch time
- Engagement rate
- Saves
- Shares
- CTR
- Conversion proxy
- Avg retention


### Chart Area

- performance over time
- platform comparison
- hook comparison
- CTA comparison
- format comparison


### Tables

- best posts
- worst posts
- fastest growing posts
- failed/low-performing automation runs


### Insights Block

This is a generated summary from metrics:

- best posting time,
- best hook pattern,
- best format,
- worst CTA,
- strongest platform.

***

## 15) Assets Page Spec

### Purpose

Store and reuse brand resources.

### Asset Types

- logos
- icons
- fonts
- b-roll
- music
- thumbnails
- templates
- caption snippets


### Layout

- grid view
- table view
- filter by type
- drag-drop upload
- preview drawer

***

## 16) Automations Page Spec

### Purpose

System observability.

### Main Sections

- workflow list
- active runs
- failed runs
- retry queue
- last execution detail


### Workflow Columns

- name
- trigger
- status
- last run
- success rate
- average time
- owner


### Workflow Detail

- step list
- input payload
- output payload
- error message
- rerun button

***

## 17) Integrations Page Spec

### Purpose

Connect services.

### Providers

- LLM provider
- transcription engine
- render engine
- social accounts
- storage bucket
- webhook endpoints


### Each Integration Card

- provider name
- connection status
- last sync
- health indicator
- configure button

***

## 18) Logs Page Spec

### Purpose

Developer and operator visibility.

### Log Entry Fields

- timestamp
- source
- entity type
- entity id
- severity
- message
- payload summary


### Filters

- severity
- workflow
- date
- entity type
- provider

***

## 19) Component Placement Rules

### Global Rules

Every page should follow this logic:

1. Top header.
2. Primary action zone.
3. Main data zone.
4. Secondary context zone.
5. Log or metadata zone.

### Dashboard

- Task cards at top-left.
- Metrics at top-right.
- Tables or timelines below.


### Detail Pages

- Main editable content left.
- Metadata and actions right.
- Timeline at bottom.


### Table Pages

- Search and filters above.
- table center.
- summary panel right.


### Mobile

- Sidebar becomes drawer.
- Right panel collapses below main content.
- Tables become stacked cards.

***

## 20) UI Component System

### Shadcn Components To Use

- `Sidebar`
- `Sheet`
- `Card`
- `Tabs`
- `Table`
- `Badge`
- `Button`
- `Input`
- `Textarea`
- `Select`
- `Dialog`
- `DropdownMenu`
- `Popover`
- `Calendar`
- `Tooltip`
- `ScrollArea`
- `Separator`
- `Avatar`
- `Skeleton`
- `Progress`
- `Accordion`
- `Toast`


### Custom Components

- `AppShell`
- `TopBar`
- `NavItem`
- `MetricCard`
- `StatusBadge`
- `TaskCard`
- `WorkflowStep`
- `TimelineItem`
- `PreviewDrawer`
- `FilterBar`
- `EmptyState`
- `SearchCommand`
- `DataTable`
- `SideSummary`
- `ActionRail`
- `PublishCalendar`
- `ClipCard`
- `RenderStatusCard`
- `MetricSparkline`
- `InsightCallout`

***

## 21) Database Tables

### `ideas`

- `id`
- `workspace_id`
- `title`
- `description`
- `format`
- `platform`
- `pillar`
- `status`
- `priority`
- `source_type`
- `source_ref`
- `prompt`
- `created_at`
- `updated_at`


### `idea_variants`

- `id`
- `workspace_id`
- `idea_id`
- `variant_type`
- `hook`
- `script`
- `cta`
- `status`
- `created_at`
- `updated_at`


### `videos`

- `id`
- `workspace_id`
- `title`
- `source_url`
- `storage_path`
- `duration_seconds`
- `processing_status`
- `transcription_status`
- `created_at`
- `updated_at`


### `transcripts`

- `id`
- `workspace_id`
- `video_id`
- `language`
- `content`
- `segments_json`
- `created_at`


### `clips`

- `id`
- `workspace_id`
- `video_id`
- `title`
- `start_ms`
- `end_ms`
- `caption`
- `aspect_ratio`
- `status`
- `created_at`
- `updated_at`


### `render_jobs`

- `id`
- `workspace_id`
- `clip_id`
- `engine`
- `composition_name`
- `status`
- `input_json`
- `output_url`
- `error_message`
- `started_at`
- `finished_at`


### `posts`

- `id`
- `workspace_id`
- `idea_id`
- `clip_id`
- `platform`
- `title`
- `caption`
- `hashtags`
- `media_url`
- `status`
- `scheduled_for`
- `published_at`
- `created_at`
- `updated_at`


### `post_metrics`

- `id`
- `workspace_id`
- `post_id`
- `views`
- `likes`
- `comments`
- `shares`
- `saves`
- `clicks`
- `watch_time_seconds`
- `retention_rate`
- `collected_at`


### `assets`

- `id`
- `workspace_id`
- `asset_type`
- `name`
- `url`
- `mime_type`
- `size_bytes`
- `metadata`
- `created_at`


### `workflow_runs`

- `id`
- `workspace_id`
- `workflow_name`
- `entity_type`
- `entity_id`
- `status`
- `input_json`
- `output_json`
- `error_message`
- `started_at`
- `finished_at`


### `integrations`

- `id`
- `workspace_id`
- `provider`
- `status`
- `config_json`
- `created_at`
- `updated_at`


### `logs`

- `id`
- `workspace_id`
- `severity`
- `source`
- `entity_type`
- `entity_id`
- `message`
- `payload_json`
- `created_at`


### `settings`

- `id`
- `workspace_id`
- `key`
- `value_json`
- `updated_at`

***

## 22) Workflow Connections

### Idea to Publish

1. User creates idea.
2. AI generates variants.
3. User selects one.
4. Variant becomes script or post draft.
5. Draft enters publishing queue.
6. Post is published.
7. Metrics sync back.
8. Analytics learns from it.

### Video to Clip

1. User uploads source video.
2. Transcription job runs.
3. Clip candidates are generated.
4. User approves clips.
5. Render jobs are created.
6. Final media is exported.
7. Published or queued.

### Feedback Loop

- Analytics identifies top-performing hooks.
- Idea generation uses top hooks as future prompt input.
- Publishing adjusts schedule rules.
- Automation logs capture failures and retry patterns.

***

## 23) Technical Rules

### Frontend

- Next.js App Router.
- Shadcn UI.
- Geist / Geist Mono.
- Tailwind tokens.
- Server components where possible.
- Client components only for interactions.


### Backend

- Supabase Postgres.
- RPC or server actions for sensitive mutations.
- RLS enabled on all exposed tables.[^3]
- Storage for media assets.
- Workflow workers via n8n webhooks.[^4]


### Video

- Remotion compositions are parameterized via props for repeated render templates.[^6]
- Render jobs should be stored and tracked in DB.
- Outputs must be saved to storage and linked back to the content item.


### Fonts

Use `next/font` for local optimization and no layout shift.[^2]

***

## 24) Build Order

### Phase 1

- app shell
- fonts
- theme
- sidebar
- DB schema
- dashboard skeleton


### Phase 2

- ideas module
- data tables
- detail views
- filters


### Phase 3

- videos module
- transcription flow
- clip flow
- render flow


### Phase 4

- publishing module
- calendar
- publish queue
- post detail


### Phase 5

- analytics module
- charts
- insights
- performance tables


### Phase 6

- integrations
- automations
- logs
- hardening

***

## 25) Non-Negotiable UX Rules

- No fake metrics.
- No static task cards.
- No hardcoded list content in production.
- Every action must map to a database mutation or fetch.
- Every important state needs loading, empty, error, and success versions.
- Every detail page must have a clear relationship to a parent list.
- Every workflow must show status and source.

***

If you want, next I can turn this into:

1. a **real PRD markdown file**,
2. a **full database migration schema**, and
3. a **complete Shadcn page tree with component files and folder structure**.
<span style="display:none">[^10][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://ui.shadcn.com/docs/components/radix/typography

[^2]: https://nextjs.org/docs/app/getting-started/fonts

[^3]: https://supabase.com/docs/guides/database/postgres/row-level-security

[^4]: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/

[^5]: https://shadcnstudio.com/docs/getting-started/shadcn-figma

[^6]: https://www.remotion.dev/docs/passing-props

[^7]: https://www.shadcndesign.com/components/typography

[^8]: https://shadcn.obra.studio/documentation/typography

[^9]: https://v3.shadcn.com/docs/components/typography

[^10]: https://www.shadcnblocks.com/docs/figma/getting-started/

