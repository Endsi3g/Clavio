import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import type { Asset } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Layout,
  Plus,
  Youtube,
  Smartphone,
  Linkedin,
  FileText,
  Clock,
  List,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { UseTemplateButton } from './use-template-button'

export const dynamic = 'force-dynamic'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Template {
  id: string
  title: string
  format: string
  platform: string
  description: string
  duration: string
  structure: string[]
  isDemo?: boolean
  createdAt?: string
}

// ─── Demo templates ───────────────────────────────────────────────────────────

const DEMO_TEMPLATES: Template[] = [
  {
    id: 'demo-1',
    title: 'YouTube Long Form',
    format: 'Long Form Video',
    platform: 'youtube',
    description:
      'Full-length educational or entertainment video optimized for YouTube watch-time and retention.',
    duration: '15–60 min',
    structure: ['Hook (0–30s)', 'Intro & teaser', 'Segment 1', 'Segment 2', 'Segment 3', 'CTA & outro'],
    isDemo: true,
  },
  {
    id: 'demo-2',
    title: 'TikTok Hook Formula',
    format: 'Short Form Video',
    platform: 'tiktok',
    description:
      'Fast-paced short-form video designed to capture attention in the first 3 seconds and drive completion rate.',
    duration: '15–60 s',
    structure: ['Hook (0–3s)', 'Value delivery', 'Pattern interrupt', 'CTA'],
    isDemo: true,
  },
  {
    id: 'demo-3',
    title: 'LinkedIn Thought Leadership',
    format: 'Text Post',
    platform: 'linkedin',
    description:
      'Professional text-based post that builds authority by sharing a personal insight, lesson, or contrarian take.',
    duration: 'Text',
    structure: ['Personal story / hook', 'Core insight or lesson', 'Actionable takeaway', 'Engaging question'],
    isDemo: true,
  },
]

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORM_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; badge: string }
> = {
  youtube: {
    label: 'YouTube',
    icon: <Youtube className="h-4 w-4" />,
    badge: 'bg-red-50 text-red-700 border-red-100',
  },
  tiktok: {
    label: 'TikTok',
    icon: <Smartphone className="h-4 w-4" />,
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  instagram: {
    label: 'Instagram',
    icon: <Smartphone className="h-4 w-4" />,
    badge: 'bg-pink-50 text-pink-700 border-pink-100',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: <Linkedin className="h-4 w-4" />,
    badge: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  twitter: {
    label: 'Twitter / X',
    icon: <FileText className="h-4 w-4" />,
    badge: 'bg-sky-50 text-sky-700 border-sky-100',
  },
  general: {
    label: 'General',
    icon: <Layout className="h-4 w-4" />,
    badge: 'bg-slate-50 text-slate-700 border-slate-200',
  },
}

function getPlatformConfig(platform: string) {
  return PLATFORM_CONFIG[platform.toLowerCase()] ?? PLATFORM_CONFIG.general
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({ template }: { template: Template }) {
  const platformCfg = getPlatformConfig(template.platform)

  return (
    <Card className="flex flex-col border-slate-200 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Layout className="h-5 w-5" />
          </div>
          {template.isDemo && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-400">
              Demo
            </span>
          )}
        </div>

        <div className="space-y-1 pt-1">
          <h3 className="text-sm font-semibold text-slate-900 leading-snug">
            {template.title}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
                platformCfg.badge
              )}
            >
              {platformCfg.icon}
              {platformCfg.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
              {template.format}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-xs text-slate-500 leading-relaxed">{template.description}</p>

        {/* Duration */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{template.duration}</span>
        </div>

        {/* Structure */}
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <List className="h-3.5 w-3.5 shrink-0" />
            Structure
          </p>
          <ol className="space-y-1 pl-1">
            {template.structure.map((step, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-xs text-slate-500"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[9px] font-bold text-blue-500">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-slate-100">
        <UseTemplateButton
          title={template.title}
          description={template.description}
          format={template.format}
          platform={template.platform}
        />
      </CardFooter>
    </Card>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function TemplatesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 px-8 text-center">
      <span className="text-5xl mb-4" role="img" aria-label="Templates">
        📋
      </span>
      <h3 className="text-base font-semibold text-slate-900">No custom templates yet</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">
        Templates let you define a repeatable structure for your content — hooks, segments, CTAs —
        so every piece starts from a strong foundation.
      </p>
      <Button size="sm" className="mt-5 gap-1.5" asChild>
        <Link href="/app/assets?type=template">
          <Plus className="h-4 w-4" />
          Create template
        </Link>
      </Button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TemplatesPage() {
  const supabase = await createServerClient()

  // Try to load template assets from the DB
  let dbTemplates: Template[] = []
  let fetchFailed = false

  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .eq('asset_type', 'template')
      .order('created_at', { ascending: false })

    if (!error && data) {
      dbTemplates = (data as Asset[]).map((asset) => {
        const meta = (asset.metadata ?? {}) as Record<string, unknown>
        return {
          id: asset.id,
          title: asset.name,
          format: (meta.format as string) ?? 'Template',
          platform: (meta.platform as string) ?? 'general',
          description: (meta.description as string) ?? '',
          duration: (meta.duration as string) ?? '—',
          structure: (meta.structure as string[]) ?? [],
          createdAt: asset.created_at,
        } satisfies Template
      })
    }
  } catch {
    fetchFailed = true
  }

  // Show demo templates when DB is empty (or unreachable)
  const templates: Template[] =
    dbTemplates.length > 0 ? dbTemplates : DEMO_TEMPLATES

  const showDemoNotice = dbTemplates.length === 0 && !fetchFailed

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Templates
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Reusable content structures for every format and platform
          </p>
        </div>
        <Button size="sm" className="gap-1.5" asChild>
          <Link href="/app/assets?type=template">
            <Plus className="h-4 w-4" />
            New template
          </Link>
        </Button>
      </div>

      {/* Demo notice */}
      {showDemoNotice && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 flex items-start gap-3">
          <Layout className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Showing demo templates.</span> Save custom templates as
            assets with <code className="font-mono bg-blue-100 px-1 rounded">asset_type = 'template'</code>{' '}
            to see them here.
          </p>
        </div>
      )}

      {/* Grid */}
      {templates.length === 0 ? (
        <TemplatesEmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  )
}
