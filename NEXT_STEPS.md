# Clavio — Next Steps

_Generated after complete app review · May 2026_

---

## What was fixed in this session

| # | File(s) | Bug / Hallucination |
|---|---------|---------------------|
| 1 | `app/app/dashboard/page.tsx` | Severity comparison `'warn'` → `'warning'` (type mismatch with `Severity`) |
| 2 | `app/app/settings/page.tsx` + `app/actions/settings.ts` | Save buttons were dead code — wired to real server actions (`saveWorkspaceSettings`, `savePublishingSettings`, `saveAISettings`, `clearLogs`) |
| 3 | `app/app/automations/page.tsx` | n8n "Connected" badge was hardcoded green — now reads from `checkIntegrationStatus('n8n')` |
| 4 | `lib/python-bridge.ts` | Hardcoded Windows-only path (`Scripts/python.exe`) — replaced with cross-platform venv detection + `PYTHON_PATH` env override |
| 5 | `lib/integrations-check.ts` | Same Windows-only python path — cross-platform fallback added |
| 6 | `app/app/analytics/page.tsx` | "Weekly Review" and "Monthly Review" were `<a href="#">` no-ops — replaced with real `Link` + `searchParams` period filtering |
| 7 | `app/app/ideas/page.tsx` + `idea-row-actions.tsx` + `app/actions/ideas.ts` | "Archive" dropdown item had no handler — extracted to client component calling `archiveIdea` server action |
| 8 | `app/app/profile/page.tsx` | Hard-coded dummy state (`Admin User`, no save logic) — rewritten to load/save from `settings` table (`key = 'profile'`) |

---

## Priority 1 — Core correctness (must fix before go-live)

### 1.1 Settings `upsert` requires a unique constraint
The `saveWorkspaceSettings` server action uses `.upsert({ onConflict: 'workspace_id,key' })`.
The `settings` table **must** have a `UNIQUE(workspace_id, key)` constraint or the upsert silently inserts duplicates.

```sql
ALTER TABLE settings ADD CONSTRAINT settings_workspace_key_unique UNIQUE (workspace_id, key);
```

### 1.2 Remotion render route has missing dependencies
`app/api/videos/render/route.ts` imports `@remotion/bundler` and `@remotion/renderer` which are **not in `package.json`**.
Either:
- Add them: `npm install @remotion/bundler @remotion/renderer`
- Or replace the render engine with a Clipify-only path (FFmpeg) and remove the Remotion render branch.

### 1.3 `workflow_runs` status `'completed'` vs `'published'`
`Status` type allows `'draft' | 'processing' | 'review' | 'scheduled' | 'published' | 'failed' | 'archived'`.
The automations page checks `run.status === 'completed'` — this value is not in the union.
Either add `'completed'` to the `Status` type, or update all `workflow_runs` inserts to use `'published'`.

### 1.4 Auth callback route does nothing useful
`/api/auth/callback/[provider]` exists but OAuth token handling is a stub.
The Integrations page "Add" button points to it. This will 404 or return an empty response for any real OAuth flow.
**Decision needed:** implement proper OAuth (YouTube, Instagram, TikTok) or remove the button and document manual token entry in `.env.local`.

---

## Priority 2 — Feature completeness (next sprint)

### 2.1 Publish flow has no real social API call
`POST /api/posts/publish` queues a workflow_run and fires an n8n webhook.
n8n must have a working `clavio-publish` webhook workflow. There is currently no fallback if n8n is offline after the 10s timeout — the post stays `processing` forever.

**Fix:** after the n8n call, add a cron or webhook-callback check that marks the post `failed` if no callback arrives within N minutes.

### 2.2 Transcription: Whisper receives `audio_url` but most whisper-asr-webservice builds require a file upload
The current code sends `audio_url` in a FormData field. The standard `faster-whisper`/`whisper-asr-webservice` API expects a binary file (`audio_file` field).
Verify the exact Whisper endpoint contract and update the FormData field name if needed.

### 2.3 Clipify engine Python scripts missing
`lib/clipify-engine.ts` calls `lib/python/analyze.py`, `build_pan.py`, `build_ass.py` — none of these files exist in the repo.
The clipify route will fail silently if invoked.
**Options:**
- Ship the Python scripts
- Replace with a pure Node/FFmpeg implementation
- Gate the feature behind an availability check

### 2.4 Metrics sync is manual only
`POST /api/metrics/sync` must be called explicitly. No scheduled cron triggers it automatically.
The `/api/cron/[task]` route exists — wire a `metrics-sync` task and configure a cron job (Vercel Cron / system cron / n8n schedule).

### 2.5 Video delete has no cascade
Deleting a video from the UI/DB leaves orphaned `transcripts`, `clips`, and `render_jobs` rows.
Add `ON DELETE CASCADE` foreign keys, or a server action that deletes children first.

---

## Priority 3 — UX polish (ongoing)

### 3.1 Settings tab state lost on server navigation
Because Settings is a server component with `defaultValue` inputs inside `<Tabs>`, switching tabs causes a full page reload (form submits reset the tab to the default). Consider making the settings page a client component with `useState` per tab, or use URL `searchParams` to persist the active tab (e.g. `?tab=ai`).

### 3.2 Ideas detail page — "Generate variant" button
The variant generation button in `app/app/ideas/[id]/idea-editor.tsx` calls the expand API but does not show a loading state or confirm success inline — only a toast. Add an inline skeleton or streaming indicator while the LLM generates.

### 3.3 Publishing detail page — post timeline
`/app/publishing/[id]` has a `WorkflowTimeline` component but it renders static milestones. Wire it to the actual `workflow_runs` rows for that post so the timeline shows real steps (queued → n8n triggered → callback received → published).

### 3.4 Asset page — no delete confirmation
`asset-row-actions.tsx` delete calls the API immediately. Add a confirmation dialog to prevent accidental deletion.

### 3.5 Empty states need CTAs
Most empty states have a description but no action button. Add contextual CTAs:
- Ideas empty → "Generate ideas" button
- Videos empty → "Upload video" button
- Publishing/Scheduled empty → "Create post" button

### 3.6 Dashboard "All caught up" card
When there are no action items, the card shows a generic "All caught up" item. Replace with a mini quick-create panel or a highlight of today's scheduled posts.

---

## Priority 4 — Architecture / infrastructure (medium term)

### 4.1 Replace hardcoded WORKSPACE_ID with real identity
`WORKSPACE_ID = '00000000-0000-0000-0000-000000000001'` is a constant used everywhere.
Even in a single-workspace app, reading the workspace from a session/cookie allows:
- Proper RLS enforcement (policies can use `auth.uid()` instead of hard-coded UUID)
- Future multi-user support without a full refactor

Minimal approach: store the workspace UUID in a signed cookie set at first boot, read it server-side via `cookies()`.

### 4.2 Supabase RLS policies
Tables currently rely on `workspace_id` filtering in query code, not RLS.
Any API key leak means full data exposure.
Enable RLS on all tables and add policies:

```sql
-- Example for ideas table
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON ideas
  USING (workspace_id = '00000000-0000-0000-0000-000000000001');
```

### 4.3 Node_modules not installed
Run `npm install` before any `npm run build` or `npx tsc --noEmit`. The `node_modules` directory is absent in the current environment — all tsc errors are environment errors, not code errors.

### 4.4 Remotion Player in Assets page
The Assets page imports `@remotion/player` to render a preview carousel. This adds a significant JS bundle. Consider lazy-loading the player only when a clip is selected.

### 4.5 n8n webhook security
The `/api/webhooks/[provider]` callback route has no authentication. Any HTTP client can POST to it and change post status. Add a shared secret check:

```ts
const secret = request.headers.get('x-clavio-secret')
if (secret !== process.env.WEBHOOK_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

---

## Priority 5 — Future features

| Feature | Description |
|---------|-------------|
| **Idea → Post auto-draft** | When an idea variant is approved, auto-create a draft Post with the variant script as caption |
| **Bulk scheduling** | Select multiple draft posts and schedule them in one action with a time-slot picker |
| **Analytics charts** | Add Recharts line chart for views over time per platform (data already in `post_metrics`) |
| **Render progress polling** | Client-side polling of `render_jobs` status so the UI updates without manual refresh |
| **Clip browser** | Dedicated clip review page — play clip, approve/reject, send to publish queue |
| **Template library** | Saved Remotion compositions per content format (talking head, B-roll, text-only) |
| **Video import from URL** | `/api/videos/import` exists; add Cobalt integration for YouTube/TikTok downloads |
| **i18n dynamic content** | Current FR/EN only covers static UI labels — extend to AI prompt language and DB-stored content |
| **Notification center** | `components/layout/notification-center.tsx` exists but is not connected to any real events — wire to Supabase realtime on `logs` table |

---

## Quick wins (< 1h each)

- [ ] `npm install` + verify `npm run build` passes
- [ ] Add `UNIQUE(workspace_id, key)` constraint on `settings` table
- [ ] Add `'completed'` to the `Status` union type (or change workflow_run inserts)
- [ ] Settings page: persist active tab in URL (`?tab=ai`) so tab isn't lost on save
- [ ] Webhook route: add `x-clavio-secret` header check
- [ ] Ideas list: hide "Archive" option for already-archived ideas
- [ ] Dashboard: translate all hardcoded English strings through `t.` dictionary
- [ ] Analytics: add `Share2` KPI card (shares already aggregated, just missing from grid)
