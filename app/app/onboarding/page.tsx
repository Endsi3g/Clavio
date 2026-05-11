'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  CheckCircle2,
  Youtube,
  Linkedin,
  Smartphone,
  Globe,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { saveOnboardingData } from '@/app/actions/onboarding'
import { checkIntegrationStatus } from '@/lib/integrations-check'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ─── Types ─────────────────────────────────────────────────────────────────────

type ProfileType = 'solo' | 'team' | 'agency'
type PlanType = 'free' | 'pro' | 'agency'
type IntegrationKey = 'ollama' | 'whisper' | 'n8n' | 'cobalt' | 'supabase'
type ConnectionStatus = 'idle' | 'checking' | 'connected' | 'disconnected'

// ─── Constants ──────────────────────────────────────────────────────────────────

const STEP_LABELS = ['Workspace', 'News', 'Plan', 'Connect', 'Ready']

const PROFILE_OPTIONS: { value: ProfileType; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: 'solo', label: 'Solo Creator', desc: 'Just me', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )},
  { value: 'team', label: 'Small Team', desc: '2–10 people', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3"/><path d="M3 20c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5"/>
      <circle cx="17" cy="7" r="3"/><path d="M21 20c0-3-2.7-5.5-6-5.5"/>
    </svg>
  )},
  { value: 'agency', label: 'Agency', desc: 'Multiple clients', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="14" rx="1"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/><line x1="12" y1="12" x2="12" y2="16"/>
    </svg>
  )},
]

const NEWS_CATEGORIES = [
  { id: 'ai', label: 'AI & Tech', emoji: '🤖', desc: 'Models, tools, research' },
  { id: 'marketing', label: 'Marketing', emoji: '📈', desc: 'Growth, ads, SEO' },
  { id: 'social', label: 'Social & Algorithms', emoji: '📱', desc: 'TikTok, IG, X trends' },
  { id: 'creators', label: 'Creator Economy', emoji: '🎬', desc: 'Deals, growth, platforms' },
  { id: 'business', label: 'Business', emoji: '💼', desc: 'Startups, funding, ops' },
  { id: 'world', label: 'World & Trends', emoji: '🌍', desc: 'Viral topics, culture' },
]

const PLANS: { id: PlanType; name: string; price: string; popular?: boolean; features: string[] }[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    features: ['3 members', '10 ideas / month', 'Basic analytics', '1 workspace'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29 / mo',
    popular: true,
    features: ['10 members', 'Unlimited ideas', 'Smart Worker', 'Render Engine', 'Priority support'],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$99 / mo',
    features: ['Unlimited members', 'All Pro features', 'Multi-workspace', 'White-label', 'API access'],
  },
]

const INTEGRATIONS: { key: IntegrationKey; name: string; desc: string; dot: string; url: string }[] = [
  { key: 'ollama', name: 'Ollama', desc: 'Local AI model', dot: 'bg-violet-400', url: 'localhost:11434' },
  { key: 'whisper', name: 'Whisper', desc: 'Transcription', dot: 'bg-blue-400', url: 'localhost:9000' },
  { key: 'n8n', name: 'n8n', desc: 'Automation', dot: 'bg-orange-400', url: 'localhost:5678' },
  { key: 'cobalt', name: 'Cobalt', desc: 'Video import', dot: 'bg-cyan-400', url: 'localhost:9001' },
  { key: 'supabase', name: 'Supabase', desc: 'Database', dot: 'bg-emerald-400', url: 'localhost:54321' },
]

const TOUR_SYSTEMS = [
  { label: 'SW', name: 'Smart Worker', desc: 'AI ideas + transcription', color: 'dark:from-violet-500/20 from-violet-100', accent: 'dark:text-violet-300 text-violet-600' },
  { label: 'AA', name: 'Autonomous Agents', desc: 'Deep research & tasks', color: 'dark:from-blue-500/20 from-blue-100', accent: 'dark:text-blue-300 text-blue-600' },
  { label: 'RE', name: 'Render Engine', desc: 'Local video rendering', color: 'dark:from-pink-500/20 from-pink-100', accent: 'dark:text-pink-300 text-pink-600' },
  { label: 'AB', name: 'Automation Bridge', desc: 'n8n workflows & hooks', color: 'dark:from-orange-500/20 from-orange-100', accent: 'dark:text-orange-300 text-orange-600' },
]

// ─── Theme Toggle ────────────────────────────────────────────────────────────────

function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-9" />
  const dark = resolvedTheme === 'dark'
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
        dark
          ? 'bg-white/10 hover:bg-white/20 text-white'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
      )}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

// ─── Step Bar ────────────────────────────────────────────────────────────────────

function StepBar({ current, labels }: { current: number; labels: string[] }) {
  return (
    <div className="flex items-start justify-center gap-0 mb-10">
      {labels.map((label, i) => {
        const s = i + 1
        const done = s < current
        const active = s === current
        return (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300',
                  done
                    ? 'bg-emerald-500 text-white'
                    : active
                    ? 'dark:bg-white dark:text-black bg-slate-900 text-white'
                    : 'dark:bg-white/10 dark:text-white/35 bg-slate-200 text-slate-400'
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : s}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium hidden sm:block transition-colors whitespace-nowrap',
                  done
                    ? 'text-emerald-500'
                    : active
                    ? 'dark:text-white text-slate-900'
                    : 'dark:text-white/30 text-slate-400'
                )}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className={cn(
                  'w-8 sm:w-12 h-px mx-2 mb-3 transition-colors',
                  done ? 'bg-emerald-500' : 'dark:bg-white/10 bg-slate-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Shared input classes ──────────────────────────────────────────────────────

const inputCls = 'dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/25 focus:ring-0'
const labelCls = 'dark:text-white/70 text-slate-600 text-sm'

// ─── Step 1 — Workspace ───────────────────────────────────────────────────────

function Step1({
  workspaceName, setWorkspaceName,
  language, setLanguage,
  timezone, setTimezone,
  profileType, setProfileType,
}: {
  workspaceName: string; setWorkspaceName: (v: string) => void
  language: string; setLanguage: (v: string) => void
  timezone: string; setTimezone: (v: string) => void
  profileType: ProfileType | null; setProfileType: (v: ProfileType) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading italic text-3xl dark:text-white text-slate-900 leading-tight">
          Set up your workspace
        </h2>
        <p className="mt-1.5 text-sm dark:text-white/55 text-slate-500">
          Tell us a bit about how you create.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className={labelCls}>Workspace name</Label>
          <Input
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="My Workspace"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className={labelCls}>Language</Label>
            <div className="flex gap-2">
              {(['en', 'fr'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={cn(
                    'flex-1 h-9 rounded-lg border text-sm font-medium transition-all',
                    language === l
                      ? 'dark:border-white dark:bg-white/15 dark:text-white border-slate-900 bg-slate-900 text-white'
                      : 'dark:border-white/10 dark:text-white/40 dark:hover:border-white/25 border-slate-200 text-slate-500 hover:border-slate-300'
                  )}
                >
                  {l === 'en' ? 'EN' : 'FR'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Timezone</Label>
            <Input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="UTC"
              className={inputCls}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className={labelCls}>Profile type</Label>
          <div className="grid grid-cols-3 gap-2.5">
            {PROFILE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setProfileType(opt.value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-150',
                  profileType === opt.value
                    ? 'dark:border-white dark:bg-white/10 dark:text-white border-slate-900 bg-slate-50 text-slate-900'
                    : 'dark:border-white/10 dark:text-white/40 dark:hover:border-white/25 border-slate-200 text-slate-500 hover:border-slate-300'
                )}
              >
                {opt.icon}
                <span className="text-xs font-semibold leading-tight">{opt.label}</span>
                <span className="text-[11px] opacity-55 hidden sm:block leading-tight">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 2 — News Preferences ────────────────────────────────────────────────

function Step2({
  selected, setSelected, keywords, setKeywords,
}: {
  selected: string[]; setSelected: (v: string[]) => void
  keywords: string; setKeywords: (v: string) => void
}) {
  const toggle = (id: string) =>
    setSelected(selected.includes(id) ? selected.filter((c) => c !== id) : [...selected, id])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading italic text-3xl dark:text-white text-slate-900 leading-tight">
          Your news feed
        </h2>
        <p className="mt-1.5 text-sm dark:text-white/55 text-slate-500">
          Pick categories — we surface trending topics to turn into content.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {NEWS_CATEGORIES.map((cat) => {
          const on = selected.includes(cat.id)
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              className={cn(
                'relative flex flex-col gap-1.5 rounded-xl border-2 p-3.5 text-left transition-all duration-150',
                on
                  ? 'dark:border-white dark:bg-white/10 border-slate-900 bg-slate-50'
                  : 'dark:border-white/10 dark:hover:border-white/25 border-slate-200 hover:border-slate-300'
              )}
            >
              <span className="text-xl leading-none">{cat.emoji}</span>
              <span className={cn('text-xs font-semibold', on ? 'dark:text-white text-slate-900' : 'dark:text-white/55 text-slate-600')}>
                {cat.label}
              </span>
              <span className="text-[11px] dark:text-white/30 text-slate-400 leading-snug">{cat.desc}</span>
              {on && (
                <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="space-y-1.5">
        <Label className={labelCls}>
          Additional keywords{' '}
          <span className="opacity-50 font-normal">(optional)</span>
        </Label>
        <Input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="e.g. Notion, Web3, indie hacking…"
          className={inputCls}
        />
      </div>
    </div>
  )
}

// ─── Step 3 — Plan ────────────────────────────────────────────────────────────

function Step3({ plan, setPlan }: { plan: PlanType; setPlan: (v: PlanType) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading italic text-3xl dark:text-white text-slate-900 leading-tight">
          Choose your plan
        </h2>
        <p className="mt-1.5 text-sm dark:text-white/55 text-slate-500">
          Start free — upgrade any time from Settings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PLANS.map((p) => {
          const active = plan === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlan(p.id)}
              className={cn(
                'relative flex flex-col rounded-xl border-2 p-4 text-left transition-all duration-150',
                active
                  ? 'dark:border-white dark:bg-white/10 border-slate-900 bg-slate-50'
                  : 'dark:border-white/10 dark:hover:border-white/25 border-slate-200 hover:border-slate-300'
              )}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-3 py-0.5 text-[10px] font-semibold text-white whitespace-nowrap">
                  Most Popular
                </span>
              )}
              <p className={cn('text-sm font-bold mb-0.5', active ? 'dark:text-white text-slate-900' : 'dark:text-white/65 text-slate-700')}>
                {p.name}
              </p>
              <p className={cn('text-lg font-semibold mb-3', active ? 'dark:text-white text-slate-900' : 'dark:text-white/50 text-slate-600')}>
                {p.price}
              </p>
              <ul className="space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs dark:text-white/45 text-slate-500">
                    <Check className="h-3 w-3 shrink-0 dark:text-white/25 text-slate-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>

      <p className="text-xs dark:text-white/30 text-slate-400 text-center">
        No credit card required for Free plan.
      </p>
    </div>
  )
}

// ─── Step 4 — Integrations ─────────────────────────────────────────────────────

function Step4() {
  const [statuses, setStatuses] = useState<Record<IntegrationKey, ConnectionStatus>>({
    ollama: 'idle', whisper: 'idle', n8n: 'idle', cobalt: 'idle', supabase: 'idle',
  })

  async function handleCheck(key: IntegrationKey) {
    setStatuses((p) => ({ ...p, [key]: 'checking' }))
    const result = await checkIntegrationStatus(key)
    setStatuses((p) => ({ ...p, [key]: result === 'connected' ? 'connected' : 'disconnected' }))
  }

  const SOCIAL = [
    { name: 'YouTube', icon: <Youtube className="h-4 w-4 text-red-400" /> },
    { name: 'Instagram', icon: <Smartphone className="h-4 w-4 text-pink-400" /> },
    { name: 'LinkedIn', icon: <Linkedin className="h-4 w-4 text-blue-400" /> },
    { name: 'TikTok', icon: <Globe className="h-4 w-4 text-slate-400" /> },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading italic text-3xl dark:text-white text-slate-900 leading-tight">
          Connect your tools
        </h2>
        <p className="mt-1.5 text-sm dark:text-white/55 text-slate-500">
          Verify local services are reachable. You can skip and configure later.
        </p>
      </div>

      <div className="space-y-2">
        {INTEGRATIONS.map((itg) => {
          const s = statuses[itg.key]
          return (
            <div
              key={itg.key}
              className="flex items-center gap-3 rounded-xl border dark:border-white/10 dark:bg-white/[0.03] border-slate-100 bg-slate-50 p-3"
            >
              <div className={cn('h-2.5 w-2.5 shrink-0 rounded-full', itg.dot)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium dark:text-white text-slate-800">{itg.name}</p>
                <p className="text-xs dark:text-white/30 text-slate-400 font-mono">{itg.url}</p>
              </div>
              <span className={cn(
                'inline-block h-2 w-2 rounded-full shrink-0',
                s === 'checking' ? 'bg-yellow-400 animate-pulse'
                  : s === 'connected' ? 'bg-emerald-400'
                  : s === 'disconnected' ? 'bg-red-400'
                  : 'dark:bg-white/20 bg-slate-300'
              )} />
              <button
                type="button"
                onClick={() => handleCheck(itg.key)}
                disabled={s === 'checking'}
                className="text-xs px-3 py-1.5 rounded-lg border dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10 border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40 shrink-0"
              >
                {s === 'checking' ? 'Checking…' : 'Test'}
              </button>
            </div>
          )
        })}
      </div>

      <div>
        <p className="text-xs font-medium dark:text-white/40 text-slate-500 mb-2.5">
          Social platforms <span className="opacity-60">(coming soon)</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SOCIAL.map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-2.5 rounded-xl border dark:border-white/8 dark:bg-white/[0.02] border-slate-100 bg-slate-50 p-3 opacity-45 cursor-not-allowed"
            >
              {s.icon}
              <span className="text-sm dark:text-white text-slate-700">{s.name}</span>
              <span className="ml-auto text-[10px] dark:text-white/30 text-slate-400">Soon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 5 — Tour & Ready ─────────────────────────────────────────────────────

function Step5({ onFinish, isPending }: { onFinish: () => void; isPending: boolean }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full dark:bg-emerald-500/15 dark:border dark:border-emerald-500/25 bg-emerald-50 border border-emerald-200 mb-4">
          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
        </div>
        <h2 className="font-heading italic text-3xl dark:text-white text-slate-900 leading-tight">
          Your Creator OS is ready
        </h2>
        <p className="mt-1.5 text-sm dark:text-white/55 text-slate-500 max-w-sm mx-auto">
          Four systems are waiting for you inside.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TOUR_SYSTEMS.map((sys, i) => (
          <motion.div
            key={sys.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className={cn(
              'flex flex-col gap-2.5 rounded-xl border p-4 bg-gradient-to-br to-transparent',
              'dark:border-white/10 border-slate-100',
              sys.color
            )}
          >
            <div className={cn('text-sm font-mono font-bold tracking-widest', sys.accent)}>
              {sys.label}
            </div>
            <div>
              <p className="text-sm font-semibold dark:text-white text-slate-900">{sys.name}</p>
              <p className="text-xs dark:text-white/40 text-slate-500 mt-0.5">{sys.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        type="button"
        onClick={onFinish}
        disabled={isPending}
        className={cn(
          'w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all',
          'dark:bg-white dark:text-black dark:hover:bg-white/90',
          'bg-slate-900 text-white hover:bg-slate-800',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isPending ? 'Setting up your workspace…' : 'Go to Dashboard'}
        {!isPending && <ArrowRight className="h-4 w-4" />}
      </button>
    </div>
  )
}

// ─── Motion variants ────────────────────────────────────────────────────────────

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 48 : -48, opacity: 0 }),
}

// ─── Main Wizard ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)

  // Step 1
  const [workspaceName, setWorkspaceName] = useState('My Workspace')
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState(() =>
    typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
  )
  const [profileType, setProfileType] = useState<ProfileType | null>(null)

  // Step 2
  const [newsCategories, setNewsCategories] = useState<string[]>(['ai', 'world'])
  const [keywords, setKeywords] = useState('')

  // Step 3
  const [plan, setPlan] = useState<PlanType>('free')

  function goNext() {
    setDirection(1)
    setStep((p) => Math.min(p + 1, 5))
  }

  function goBack() {
    setDirection(-1)
    setStep((p) => Math.max(p - 1, 1))
  }

  function handleFinish() {
    startTransition(async () => {
      await saveOnboardingData({
        workspaceName,
        workspaceType: profileType ?? 'solo',
        language,
        timezone,
        newsCategories,
        newsKeywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
        plan,
      })
      router.push('/app/dashboard')
    })
  }

  const canProceed = step !== 1 || (workspaceName.trim().length > 0 && profileType !== null)

  return (
    <div className="relative min-h-screen overflow-hidden dark:bg-black bg-slate-50 flex flex-col">
      {/* Video background — same as landing page */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <video
          autoPlay loop muted playsInline
          poster="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover dark:opacity-30 opacity-10"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlay */}
        <div className="absolute inset-0 dark:bg-gradient-to-b dark:from-black/60 dark:via-black/40 dark:to-black/70 bg-gradient-to-b from-slate-50/80 via-slate-50/60 to-slate-50/80" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full dark:bg-white bg-slate-900 dark:text-black text-white font-bold text-sm select-none">
            C
          </div>
          <span className="font-heading italic text-lg dark:text-white text-slate-900">Clavio</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Wizard */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-6">
        <div className="w-full max-w-[560px]">
          <StepBar current={step} labels={STEP_LABELS} />

          {/* Glass card */}
          <div className="dark:backdrop-blur-2xl dark:bg-white/[0.045] dark:border dark:border-white/10 bg-white border border-slate-200 shadow-xl rounded-3xl p-7 sm:p-9">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeInOut' }}
              >
                {step === 1 && (
                  <Step1
                    workspaceName={workspaceName} setWorkspaceName={setWorkspaceName}
                    language={language} setLanguage={setLanguage}
                    timezone={timezone} setTimezone={setTimezone}
                    profileType={profileType} setProfileType={setProfileType}
                  />
                )}
                {step === 2 && (
                  <Step2
                    selected={newsCategories} setSelected={setNewsCategories}
                    keywords={keywords} setKeywords={setKeywords}
                  />
                )}
                {step === 3 && <Step3 plan={plan} setPlan={setPlan} />}
                {step === 4 && <Step4 />}
                {step === 5 && <Step5 onFinish={handleFinish} isPending={isPending} />}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            {step < 5 && (
              <div className="flex items-center justify-between mt-8 pt-6 dark:border-t dark:border-white/8 border-t border-slate-100">
                <div className="flex gap-1">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-colors dark:text-white/50 dark:hover:text-white dark:hover:bg-white/8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back
                    </button>
                  )}
                  {(step === 2 || step === 4) && (
                    <button
                      type="button"
                      onClick={goNext}
                      className="px-4 py-2 rounded-xl text-sm dark:text-white/30 dark:hover:text-white/50 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Skip
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canProceed}
                  className={cn(
                    'flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                    'dark:bg-white dark:text-black dark:hover:bg-white/90',
                    'bg-slate-900 text-white hover:bg-slate-800',
                    'disabled:opacity-35 disabled:cursor-not-allowed'
                  )}
                >
                  {step === 4 ? 'Continue' : 'Next'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-xs dark:text-white/20 text-slate-400 mt-5">
            Step {step} of {STEP_LABELS.length}
          </p>
        </div>
      </main>
    </div>
  )
}
