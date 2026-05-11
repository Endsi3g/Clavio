import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Layout,
  Plus,
  Youtube,
  Smartphone,
  Linkedin,
  FileText,
  Clock,
  List,
  FileUp,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { UseTemplateButton } from './use-template-button'
import { ImportTemplateDialog } from './import-template-dialog'

export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Template {
  id: string
  title: string
  format: string
  platforms: string[]
  description: string
  structure: { section: string; description: string; tips?: string }[]
  sourceType?: string
  isDemo?: boolean
}

// ─── Demo templates ───────────────────────────────────────────────────────────

const DEMO_TEMPLATES: Template[] = [
  {
    id: 'demo-1',
    title: 'YouTube Long Form',
    format: 'long',
    platforms: ['youtube'],
    description:
      'Full-length educational or entertainment video optimized for YouTube watch-time and retention.',
    structure: [
      { section: 'Hook (0–30s)', description: 'Grab attention immediately' },
      { section: 'Intro & teaser', description: 'Preview what viewers will learn' },
      { section: 'Segment 1', description: 'First main point with examples' },
      { section: 'Segment 2', description: 'Second main point' },
      { section: 'Segment 3', description: 'Third main point' },
      { section: 'CTA & outro', description: 'Subscribe, like, next video' },
    ],
    isDemo: true,
  },
  {
    id: 'demo-2',
    title: 'TikTok Hook Formula',
    format: 'reel',
    platforms: ['tiktok', 'instagram'],
    description:
      'Fast-paced short-form video designed to capture attention in the first 3 seconds.',
    structure: [
      { section: 'Hook (0–3s)', description: 'Bold claim or question' },
      { section: 'Value delivery', description: 'Core content — be concise' },
      { section: 'Pattern interrupt', description: 'Visual or audio break to re-engage' },
      { section: 'CTA', description: 'Follow, share, comment prompt' },
    ],
    isDemo: true,
  },
  {
    id: 'demo-3',
    title: 'LinkedIn Thought Leadership',
    format: 'thread',
    platforms: ['linkedin'],
    description:
      'Professional post that builds authority by sharing a personal insight or contrarian take.',
    structure: [
      { section: 'Personal hook', description: 'Story or relatable situation' },
      { section: 'Core insight', description: 'The lesson or perspective shift' },
      { section: 'Actionable takeaway', description: 'What readers can do today' },
      { section: 'Engaging question', description: 'Invite comments' },
    ],
    isDemo: true,
  },
]

// ─── Config ───────────────────────────────────────────────────────────────────

const FORMAT_LABEL: Record<string, string> = {
  short: 'Short Form',
  long: 'Long Form',
  reel: 'Reel / TikTok',
  thread: 'Thread / Post',
  newsletter: 'Newsletter',
  general: 'General',
}

const PLATFORM_CONFIG: Record<string, { label: string; icon: React.ReactNode; badge: string }> = {
  youtube: {
    label: 'YouTube',
    icon: <Youtube className="h-3.5 w-3.5" />,
    badge: 'bg-red-50 text-red-700 border-red-100',
  },
  tiktok: {
    label: 'TikTok',
    icon: <Smartphone className="h-3.5 w-3.5" />,
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  instagram: {
    label: 'Instagram',
    icon: <Smartphone className="h-3.5 w-3.5" />,
    badge: 'bg-pink-50 text-pink-700 border-pink-100',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: <Linkedin className="h-3.5 w-3.5" />,
    badge: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  twitter: {
    label: 'Twitter / X',
    icon: <FileText className="h-3.5 w-3.5" />,
    badge: 'bg-sky-50 text-sky-700 border-sky-100',
  },
  general: {
    label: 'General',
    icon: <Layout className="h-3.5 w-3.5" />,
    badge: 'bg-slate-50 text-slate-700 border-slate-200',
  },
}

function getPlatformCfg(platform: string) {
  return PLATFORM_CONFIG[platform.toLowerCase()] ?? PLATFORM_CONFIG.general
}

// ─── Template Card ─────────────────────────────────────────────────────────────

function TemplateCard({ template }: { template: Template }) {
  const primaryPlatform = template.platforms[0] ?? 'general'
  const platformCfg = getPlatformCfg(primaryPlatform)

  return (
    <Card className="flex flex-col border-slate-200 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Layout className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-1.5">
            {template.isDemo && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                Demo
              </span>
            )}
            {template.sourceType && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                <FileUp className="h-2.5 w-2.5" />
                {template.sourceType.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1 pt-1">
          <h3 className="text-sm font-semibold text-slate-900 leading-snug">{template.title}</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {template.platforms.slice(0, 2).map((p) => {
              const cfg = getPlatformCfg(p)
              return (
                <span
                  key={p}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
                    cfg.badge
                  )}
                >
                  {cfg.icon}
                  {cfg.label}
                </span>
              )
            })}
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
              {FORMAT_LABEL[template.format] ?? template.format}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-xs text-slate-500 leading-relaxed">{template.description}</p>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{template.structure.length} sections</span>
        </div>

        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <List className="h-3.5 w-3.5 shrink-0" />
            Structure
          </p>
          <ol className="space-y-1 pl-1">
            {template.structure.slice(0, 5).map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[9px] font-bold text-blue-500 mt-0.5">
                  {i + 1}
                </span>
                <span>
                  <span className="font-medium text-slate-700">{step.section}</span>
                  {step.description && (
                    <span className="text-slate-400"> — {step.description}</span>
                  )}
                </span>
              </li>
            ))}
            {template.structure.length > 5 && (
              <li className="text-xs text-slate-400 pl-6">
                +{template.structure.length - 5} more sections
              </li>
            )}
          </ol>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-slate-100">
        <UseTemplateButton
          title={template.title}
          description={template.description}
          format={FORMAT_LABEL[template.format] ?? template.format}
          platform={template.platforms[0] ?? 'general'}
        />
      </CardFooter>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TemplatesPage() {
  const supabase = await createServerClient()

  let dbTemplates: Template[] = []

  try {
    const { data } = await supabase
      .from('content_templates')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .order('created_at', { ascending: false })

    if (data) {
      dbTemplates = data.map((row) => ({
        id: row.id,
        title: row.name,
        format: row.format,
        platforms: row.platforms ?? ['general'],
        description: row.description ?? '',
        structure: (row.structure ?? []) as Template['structure'],
        sourceType: row.source_type ?? undefined,
      }))
    }
  } catch {
    // table may not exist yet — show demos
  }

  const showDemoNotice = dbTemplates.length === 0
  const templates = dbTemplates.length > 0 ? dbTemplates : DEMO_TEMPLATES

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Templates</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Reusable content structures for every format and platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ImportTemplateDialog />
          <Button size="sm" className="gap-1.5" asChild>
            <Link href="/app/assets?type=template">
              <Plus className="h-4 w-4" />
              New template
            </Link>
          </Button>
        </div>
      </div>

      {/* Demo notice */}
      {showDemoNotice && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 flex items-start gap-3">
          <Layout className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Showing demo templates.</span>{' '}
            Import a PDF, TXT, or DOCX file to let the AI generate a custom template — or create one manually.
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  )
}
